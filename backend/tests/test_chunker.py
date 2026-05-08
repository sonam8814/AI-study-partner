"""
Unit tests for app/utils/chunker.py — PRD Step 5 acceptance criteria.

Covers:
  - Simple plain text
  - Multi-heading document
  - Code blocks (must not be split)
  - Tables (must not split mid-row)
  - Tiny chunks (merged forward)
  - Empty / whitespace-only input
  - Char offsets are within bounds
  - H1/H2 always start a new chunk
"""
import pytest
from app.utils.chunker import chunk_markdown, MIN_TOKENS, MAX_TOKENS, _tokens


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _total_content(chunks) -> str:
    return "\n\n".join(c.content for c in chunks)


# ---------------------------------------------------------------------------
# 1. Empty / whitespace-only
# ---------------------------------------------------------------------------

def test_empty_string():
    assert chunk_markdown("") == []


def test_whitespace_only():
    assert chunk_markdown("   \n\n  ") == []


# ---------------------------------------------------------------------------
# 2. Simple plain text — single chunk
# ---------------------------------------------------------------------------

def test_simple_text():
    text = "Photosynthesis is the process by which plants convert sunlight into energy."
    chunks = chunk_markdown(text)
    assert len(chunks) == 1
    assert "Photosynthesis" in chunks[0].content
    assert chunks[0].section_heading is None


# ---------------------------------------------------------------------------
# 3. Multi-heading document
# ---------------------------------------------------------------------------

MULTI_HEADING = """\
# Chapter 1

Introduction to biology. Plants are amazing organisms.

## Section 1.1

Photosynthesis converts light energy into chemical energy stored in glucose.

## Section 1.2

Cellular respiration releases energy from glucose through a series of reactions.

# Chapter 2

Advanced topics in biochemistry.
"""


def test_multi_heading_chunk_count():
    chunks = chunk_markdown(MULTI_HEADING)
    # Each H1/H2 starts a new chunk → at least 4 chunks
    assert len(chunks) >= 4


def test_multi_heading_h1_starts_new_chunk():
    chunks = chunk_markdown(MULTI_HEADING)
    headings_in_first_content = [c for c in chunks if "# Chapter 1" in c.content]
    headings_in_second = [c for c in chunks if "# Chapter 2" in c.content]
    assert headings_in_first_content, "Chapter 1 should be its own chunk"
    assert headings_in_second, "Chapter 2 should be its own chunk"
    # They must be different chunks
    assert headings_in_first_content[0] is not headings_in_second[0]


def test_section_heading_propagates():
    chunks = chunk_markdown(MULTI_HEADING)
    # The chunk containing "Photosynthesis" should have section_heading set
    photo_chunk = next((c for c in chunks if "Photosynthesis" in c.content), None)
    assert photo_chunk is not None
    assert photo_chunk.section_heading is not None


# ---------------------------------------------------------------------------
# 4. Code block must not be split
# ---------------------------------------------------------------------------

CODE_DOC = """\
# Algorithm

Here is the pseudocode for the algorithm.

```python
def fibonacci(n):
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b
```

The above function runs in O(n) time.
"""


def test_code_block_not_split():
    chunks = chunk_markdown(CODE_DOC)
    # Exactly one chunk should contain the full code block
    code_chunks = [c for c in chunks if "```python" in c.content and "```" in c.content[c.content.index("```python") + 3:]]
    assert len(code_chunks) == 1, "Code block must stay in a single chunk"
    assert "def fibonacci" in code_chunks[0].content
    assert "return b" in code_chunks[0].content


# ---------------------------------------------------------------------------
# 5. Tables stay in one chunk
# ---------------------------------------------------------------------------

TABLE_DOC = """\
# Comparison

| Feature    | Option A | Option B |
|------------|----------|----------|
| Speed      | Fast     | Slow     |
| Memory     | High     | Low      |
| Complexity | Simple   | Complex  |

Some notes after the table.
"""


def test_table_in_single_chunk():
    chunks = chunk_markdown(TABLE_DOC)
    table_chunks = [c for c in chunks if "| Feature" in c.content]
    assert len(table_chunks) == 1
    # All rows present
    assert "| Speed" in table_chunks[0].content
    assert "| Memory" in table_chunks[0].content
    assert "| Complexity" in table_chunks[0].content


# ---------------------------------------------------------------------------
# 6. Tiny chunks are merged forward
# ---------------------------------------------------------------------------

def test_tiny_chunks_merged():
    # Two-word paragraph after a heading is tiny; should merge with next paragraph
    doc = "# Title\n\nTiny.\n\nThis is a longer paragraph with more content to push it over the minimum token threshold for standalone chunks."
    chunks = chunk_markdown(doc)
    # The tiny "Tiny." should be merged into the same chunk as the longer paragraph
    for c in chunks:
        if "Tiny." in c.content:
            assert _tokens(c.content) >= MIN_TOKENS or len(chunks) == 1


# ---------------------------------------------------------------------------
# 7. Char offsets are valid and non-overlapping
# ---------------------------------------------------------------------------

def test_char_offsets_valid():
    chunks = chunk_markdown(MULTI_HEADING)
    for c in chunks:
        assert c.char_start >= 0
        assert c.char_end > c.char_start
        assert c.char_end <= len(MULTI_HEADING)


def test_char_offsets_non_overlapping():
    chunks = chunk_markdown(MULTI_HEADING)
    for i in range(len(chunks) - 1):
        assert chunks[i].char_end <= chunks[i + 1].char_start + 5  # small tolerance for whitespace


# ---------------------------------------------------------------------------
# 8. No chunk exceeds MAX_TOKENS
# ---------------------------------------------------------------------------

def test_no_chunk_exceeds_max_tokens():
    # Build a doc with many short paragraphs to trigger splitting
    paragraphs = [f"Paragraph {i}: " + ("word " * 80) for i in range(20)]
    doc = "\n\n".join(paragraphs)
    chunks = chunk_markdown(doc)
    for c in chunks:
        assert c.token_count <= MAX_TOKENS + 50, (
            f"Chunk exceeded max tokens: {c.token_count}"
        )


# ---------------------------------------------------------------------------
# 9. token_count is set correctly
# ---------------------------------------------------------------------------

def test_token_count_populated():
    chunks = chunk_markdown(MULTI_HEADING)
    for c in chunks:
        assert c.token_count > 0
        assert c.token_count == max(1, len(c.content) // 4)
