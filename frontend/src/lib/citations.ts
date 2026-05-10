export interface Citation {
  index: number
  chunk_id: string
  material_id: string
  char_start: number
  char_end: number
  section: string | null
  similarity: number
}

const CITATION_RE = /\[(\d+)\]/g

export function parseCitationIndices(text: string): number[] {
  const indices: number[] = []
  let match: RegExpExecArray | null
  CITATION_RE.lastIndex = 0
  while ((match = CITATION_RE.exec(text)) !== null) {
    const i = parseInt(match[1], 10)
    if (!indices.includes(i)) indices.push(i)
  }
  return indices.sort((a, b) => a - b)
}
