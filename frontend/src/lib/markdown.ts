export function stripMarkdown(md: string): string {
  return md
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`{3}[\s\S]*?`{3}/g, '')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/!\[(.*?)\]\(.*?\)/g, '')
    .trim()
}

export function getFirstParagraph(md: string): string {
  const lines = md.split('\n').filter((l) => l.trim() && !l.startsWith('#'))
  return stripMarkdown(lines[0] ?? '')
}
