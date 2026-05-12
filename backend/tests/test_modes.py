from __future__ import annotations

import json
from uuid import uuid4

import pytest

from app.core.rag_engine import RetrievedChunk, build_rag_context
from app.modes.peer import PeerMode
from app.modes.tutor import TutorMode
from app.modes.examiner import ExaminerMode, _WEAK_SPOT_RE
from app.modes.feynman import FeynmanMode, _FEYNMAN_RESULT_RE


# ── Fixtures ─────────────────────────────────────────────────────────────────

def _make_chunk(
    content: str = "Photosynthesis converts light to chemical energy.",
    section: str = "Introduction",
    index: int = 0,
) -> RetrievedChunk:
    return RetrievedChunk(
        id=uuid4(),
        material_id=uuid4(),
        chunk_index=index,
        content=content,
        section_heading=section,
        char_start=index * 100,
        char_end=index * 100 + len(content),
        similarity=0.85,
    )


@pytest.fixture
def sample_chunks() -> list[RetrievedChunk]:
    return [
        _make_chunk("Photosynthesis converts light energy.", "Light Reactions", 0),
        _make_chunk("The Calvin cycle fixes CO2 into sugar.", "Calvin Cycle", 1),
    ]


@pytest.fixture
def empty_chunks() -> list[RetrievedChunk]:
    return []


# ── System Prompt Assembly ───────────────────────────────────────────────────

class TestPeerMode:
    def test_system_prompt_includes_rag_context(self, sample_chunks):
        mode = PeerMode()
        prompt = mode.system_prompt(sample_chunks)
        assert "study buddy" in prompt
        assert "[1]" in prompt
        assert "[2]" in prompt
        assert "Light Reactions" in prompt
        assert "Calvin Cycle" in prompt

    def test_system_prompt_empty_chunks(self, empty_chunks):
        mode = PeerMode()
        prompt = mode.system_prompt(empty_chunks)
        assert "study buddy" in prompt
        # With empty chunks, no RAG context header ("retrieved excerpts") should appear
        assert "retrieved excerpts" not in prompt

    def test_name(self):
        assert PeerMode.name == "peer"

    @pytest.mark.asyncio
    async def test_post_process_returns_empty(self, sample_chunks):
        mode = PeerMode()
        result = await mode.post_process(uuid4(), uuid4(), "hi", "hello", sample_chunks)
        assert result == {}


class TestTutorMode:
    def test_system_prompt_includes_rag_context(self, sample_chunks):
        mode = TutorMode()
        prompt = mode.system_prompt(sample_chunks)
        assert "expert tutor" in prompt
        assert "[1]" in prompt
        assert "Photosynthesis converts light energy." in prompt

    def test_system_prompt_empty_chunks(self, empty_chunks):
        mode = TutorMode()
        prompt = mode.system_prompt(empty_chunks)
        assert "expert tutor" in prompt

    def test_name(self):
        assert TutorMode.name == "tutor"

    @pytest.mark.asyncio
    async def test_post_process_returns_empty(self, sample_chunks):
        mode = TutorMode()
        result = await mode.post_process(uuid4(), uuid4(), "hi", "hello", sample_chunks)
        assert result == {}


class TestExaminerMode:
    def test_system_prompt_structure(self, sample_chunks):
        mode = ExaminerMode()
        prompt = mode.system_prompt(sample_chunks)
        assert "strict examiner" in prompt
        assert "VERDICT" in prompt
        assert "WEAK_SPOT" in prompt
        assert "Calvin Cycle" in prompt

    def test_name(self):
        assert ExaminerMode.name == "examiner"

    def test_weak_spot_regex_matches(self):
        text = (
            'Your answer is incorrect.\n\n'
            'WEAK_SPOT: {"topic": "Calvin cycle", "description": "Missed the role of RuBisCO"}'
        )
        m = _WEAK_SPOT_RE.search(text)
        assert m is not None
        data = json.loads(m.group(1))
        assert data["topic"] == "Calvin cycle"
        assert "RuBisCO" in data["description"]

    def test_weak_spot_regex_no_match(self):
        text = "Great answer! Keep going."
        m = _WEAK_SPOT_RE.search(text)
        assert m is None

    @pytest.mark.asyncio
    async def test_post_process_no_weak_spot(self, sample_chunks):
        mode = ExaminerMode()
        result = await mode.post_process(
            uuid4(), uuid4(), "my answer", "Correct. Next question:", sample_chunks
        )
        assert result == {}


class TestFeynmanMode:
    def test_system_prompt_structure(self, sample_chunks):
        mode = FeynmanMode()
        prompt = mode.system_prompt(sample_chunks)
        assert "Feynman" in prompt
        assert "[1]" in prompt

    def test_name(self):
        assert FeynmanMode.name == "feynman"

    def test_feynman_result_regex_matches(self):
        text = (
            '**Score:** 72/100\n\n'
            'FEYNMAN_RESULT: {"score": 72, "gaps": ["electron transport chain", "ATP synthase"]}'
        )
        m = _FEYNMAN_RESULT_RE.search(text)
        assert m is not None
        data = json.loads(m.group(1))
        assert data["score"] == 72
        assert len(data["gaps"]) == 2

    def test_feynman_result_regex_no_match(self):
        text = "Great explanation! You nailed it."
        m = _FEYNMAN_RESULT_RE.search(text)
        assert m is None

    @pytest.mark.asyncio
    async def test_post_process_no_result_block(self, sample_chunks):
        mode = FeynmanMode()
        result = await mode.post_process(
            uuid4(), uuid4(), "my explanation", "Great job!", sample_chunks
        )
        assert result == {}


# ── RAG Context ──────────────────────────────────────────────────────────────

class TestRagContextInPrompts:
    def test_all_modes_include_chunk_content(self, sample_chunks):
        modes = [PeerMode(), TutorMode(), ExaminerMode(), FeynmanMode()]
        for mode in modes:
            prompt = mode.system_prompt(sample_chunks)
            assert "Photosynthesis converts light energy." in prompt, (
                f"{mode.name} did not include chunk content"
            )
            assert "Calvin cycle fixes CO2" in prompt, (
                f"{mode.name} did not include second chunk"
            )

    def test_all_modes_handle_empty_context(self, empty_chunks):
        modes = [PeerMode(), TutorMode(), ExaminerMode(), FeynmanMode()]
        for mode in modes:
            prompt = mode.system_prompt(empty_chunks)
            assert isinstance(prompt, str)
            assert len(prompt) > 10
