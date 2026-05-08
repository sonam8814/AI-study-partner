from __future__ import annotations

import re
from dataclasses import dataclass, field

# ---------------------------------------------------------------------------
# Token approximation: 1 token ≈ 4 characters (PRD §10.4)
# ---------------------------------------------------------------------------
TARGET_TOKENS = 350
MAX_TOKENS = 512
MIN_TOKENS = 100


def _tokens(text: str) -> int:
    return max(1, len(text) // 4)


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

@dataclass
class Block:
    type: str          # h1 | h2 | h3 | code | table | paragraph
    content: str
    char_start: int
    char_end: int


@dataclass
class Chunk:
    content: str
    section_heading: str | None
    char_start: int
    char_end: int
    token_count: int = field(init=False)

    def __post_init__(self) -> None:
        self.token_count = _tokens(self.content)


# ---------------------------------------------------------------------------
# Step 1 — Parse markdown into blocks
# ---------------------------------------------------------------------------

# Matches fenced code blocks (``` … ```)
_CODE_RE = re.compile(r"(```[\s\S]*?```)", re.MULTILINE)
# Matches ATX headings
_HEADING_RE = re.compile(r"^(#{1,3})\s+(.+)$", re.MULTILINE)
# Markdown table row
_TABLE_ROW_RE = re.compile(r"^\|.+\|$", re.MULTILINE)


def _parse_blocks(text: str) -> list[Block]:
    """Split markdown text into typed blocks, preserving char offsets."""
    blocks: list[Block] = []
    pos = 0

    # We'll walk through the text, carving out code blocks first (they must
    # not be split), then process the remaining text line-by-line.
    segments: list[tuple[str, int, int]] = []  # (segment_text, abs_start, is_code)

    for m in _CODE_RE.finditer(text):
        if m.start() > pos:
            segments.append((text[pos:m.start()], pos, False))
        segments.append((m.group(0), m.start(), True))
        pos = m.end()
    if pos < len(text):
        segments.append((text[pos:], pos, False))

    for seg_text, seg_start, is_code in segments:
        if is_code:
            blocks.append(Block("code", seg_text, seg_start, seg_start + len(seg_text)))
            continue

        # Non-code segment: split by blank lines into paragraphs / headings / tables
        raw_paras = re.split(r"\n{2,}", seg_text)
        cursor = seg_start
        for para in raw_paras:
            para_stripped = para.strip()
            if not para_stripped:
                cursor += len(para) + 2
                continue

            abs_start = text.find(para_stripped, cursor)
            if abs_start == -1:
                abs_start = cursor
            abs_end = abs_start + len(para_stripped)

            # Heading?
            hm = _HEADING_RE.match(para_stripped)
            if hm:
                level = len(hm.group(1))
                btype = f"h{level}"
                blocks.append(Block(btype, para_stripped, abs_start, abs_end))
            # Table block (majority of lines are table rows)?
            elif _TABLE_ROW_RE.match(para_stripped.splitlines()[0]):
                blocks.append(Block("table", para_stripped, abs_start, abs_end))
            else:
                blocks.append(Block("paragraph", para_stripped, abs_start, abs_end))

            cursor = abs_end + 2  # skip the blank-line separator

    return blocks


# ---------------------------------------------------------------------------
# Step 2 — Flush buffer into a Chunk
# ---------------------------------------------------------------------------

def _flush(buf: list[Block], heading_stack: list[str]) -> Chunk:
    combined = "\n\n".join(b.content for b in buf)
    char_start = buf[0].char_start
    char_end = buf[-1].char_end
    section = heading_stack[-1] if heading_stack else None
    return Chunk(content=combined, section_heading=section,
                 char_start=char_start, char_end=char_end)


# ---------------------------------------------------------------------------
# Step 3 — Merge tiny trailing chunks forward
# ---------------------------------------------------------------------------

_HEADING_START_RE = re.compile(r"^#{1,2}\s")


def _merge_tiny(chunks: list[Chunk], min_tokens: int = MIN_TOKENS) -> list[Chunk]:
    if not chunks:
        return chunks
    merged: list[Chunk] = []
    i = 0
    while i < len(chunks):
        c = chunks[i]
        nxt = chunks[i + 1] if i + 1 < len(chunks) else None
        # Merge tiny chunk forward ONLY when:
        #   - it is below min_tokens
        #   - there is a next chunk
        #   - the next chunk does NOT start with H1/H2 (respect heading boundaries)
        if (
            c.token_count < min_tokens
            and nxt is not None
            and not _HEADING_START_RE.match(nxt.content)
        ):
            combined = c.content + "\n\n" + nxt.content
            chunks[i + 1] = Chunk(
                content=combined,
                section_heading=nxt.section_heading or c.section_heading,
                char_start=c.char_start,
                char_end=nxt.char_end,
            )
            i += 1
            continue
        merged.append(c)
        i += 1
    return merged


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def chunk_markdown(text: str) -> list[Chunk]:
    """
    Markdown-aware chunker per PRD §10.4.

    Returns a list of Chunk objects with content, section_heading,
    char_start, char_end, and token_count.
    """
    if not text or not text.strip():
        return []

    blocks = _parse_blocks(text)
    if not blocks:
        return []

    chunks: list[Chunk] = []
    buf: list[Block] = []
    buf_tokens = 0
    heading_stack: list[str] = []

    for block in blocks:
        block_tokens = _tokens(block.content)

        # H1 / H2 always force a new chunk boundary
        if block.type in ("h1", "h2"):
            if buf:
                chunks.append(_flush(buf, heading_stack))
                buf = []
                buf_tokens = 0
            # Update heading stack
            if block.type == "h1":
                heading_stack = [block.content]
            else:
                heading_stack = [h for h in heading_stack if h.startswith("# ")] + [block.content]
            buf.append(block)
            buf_tokens = block_tokens

        # H3 updates stack but doesn't force a break
        elif block.type == "h3":
            heading_stack = [h for h in heading_stack
                             if not h.startswith("### ")] + [block.content]
            if buf_tokens + block_tokens > MAX_TOKENS:
                chunks.append(_flush(buf, heading_stack))
                buf = [block]
                buf_tokens = block_tokens
            else:
                buf.append(block)
                buf_tokens += block_tokens

        # All other blocks: add until MAX_TOKENS exceeded
        else:
            if buf and buf_tokens + block_tokens > MAX_TOKENS:
                chunks.append(_flush(buf, heading_stack))
                buf = [block]
                buf_tokens = block_tokens
            else:
                buf.append(block)
                buf_tokens += block_tokens

    if buf:
        chunks.append(_flush(buf, heading_stack))

    return _merge_tiny(chunks)
