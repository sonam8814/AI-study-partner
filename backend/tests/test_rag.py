from __future__ import annotations

"""
Unit tests for rag_engine helpers that don't require network calls.
The retrieve_context() function (which calls Supabase + embedding model)
is tested via integration test (run manually from terminal).
"""

from uuid import UUID

import pytest

from app.core.rag_engine import RetrievedChunk, build_rag_context, extract_citations
from app.db.schemas import Citation

# ── Fixtures ───────────────────────────────────────────────────────────────────

CHUNK_A = RetrievedChunk(
    id=UUID("00000000-0000-0000-0000-000000000001"),
    material_id=UUID("00000000-0000-0000-0000-000000000010"),
    chunk_index=0,
    content="Photosynthesis converts light energy into chemical energy.",
    section_heading="## Photosynthesis",
    char_start=0,
    char_end=55,
    similarity=0.92,
)

CHUNK_B = RetrievedChunk(
    id=UUID("00000000-0000-0000-0000-000000000002"),
    material_id=UUID("00000000-0000-0000-0000-000000000010"),
    chunk_index=1,
    content="The Calvin cycle fixes CO2 into glucose.",
    section_heading="## Calvin Cycle",
    char_start=56,
    char_end=95,
    similarity=0.78,
)

CHUNK_NO_HEADING = RetrievedChunk(
    id=UUID("00000000-0000-0000-0000-000000000003"),
    material_id=UUID("00000000-0000-0000-0000-000000000010"),
    chunk_index=2,
    content="Chlorophyll absorbs red and blue light.",
    section_heading=None,
    char_start=96,
    char_end=133,
    similarity=0.65,
)


# ── build_rag_context ──────────────────────────────────────────────────────────

def test_build_rag_context_empty():
    assert build_rag_context([]) == ""


def test_build_rag_context_single_chunk():
    result = build_rag_context([CHUNK_A])
    assert "[1]" in result
    assert "Photosynthesis" in result
    assert CHUNK_A.content in result


def test_build_rag_context_multiple_chunks():
    result = build_rag_context([CHUNK_A, CHUNK_B])
    assert "[1]" in result
    assert "[2]" in result
    assert "## Photosynthesis" in result
    assert "## Calvin Cycle" in result


def test_build_rag_context_no_heading_fallback():
    result = build_rag_context([CHUNK_NO_HEADING])
    assert "your notes" in result


def test_build_rag_context_has_header_text():
    result = build_rag_context([CHUNK_A])
    assert "retrieved excerpts" in result
    assert "use [N] format" in result


# ── extract_citations ──────────────────────────────────────────────────────────

def test_extract_citations_empty_text():
    result = extract_citations("No citations here.", [CHUNK_A, CHUNK_B])
    assert result == []


def test_extract_citations_single():
    citations = extract_citations("As stated in [1], photosynthesis...", [CHUNK_A])
    assert len(citations) == 1
    assert citations[0].index == 1
    assert citations[0].chunk_id == CHUNK_A.id
    assert citations[0].section == "## Photosynthesis"
    assert citations[0].similarity == pytest.approx(0.92)


def test_extract_citations_multiple():
    text = "See [1] and [2] for details."
    citations = extract_citations(text, [CHUNK_A, CHUNK_B])
    assert len(citations) == 2
    assert citations[0].index == 1
    assert citations[1].index == 2


def test_extract_citations_deduplicated():
    text = "According to [1], ... [1] again ..."
    citations = extract_citations(text, [CHUNK_A])
    assert len(citations) == 1


def test_extract_citations_out_of_range_ignored():
    text = "See [1] and [99] for details."
    citations = extract_citations(text, [CHUNK_A])
    # [99] is out of range (only 1 chunk), should be ignored
    assert len(citations) == 1
    assert citations[0].index == 1


def test_extract_citations_no_heading_chunk():
    citations = extract_citations("[1] is useful.", [CHUNK_NO_HEADING])
    assert citations[0].section is None
