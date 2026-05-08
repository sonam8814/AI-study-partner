from __future__ import annotations

import re

_CITATION_RE = re.compile(r"\[(\d+)\]")


def strip_unresolved_citations(text: str, max_index: int) -> str:
    """Replace [N] where N > max_index with plain text '[N]' (no click handler hint)."""
    def _replace(m: re.Match) -> str:
        n = int(m.group(1))
        return m.group(0) if n <= max_index else m.group(0)

    return _CITATION_RE.sub(_replace, text)


def citation_indices(text: str) -> list[int]:
    """Return sorted list of unique citation indices found in text."""
    return sorted({int(m.group(1)) for m in _CITATION_RE.finditer(text)})
