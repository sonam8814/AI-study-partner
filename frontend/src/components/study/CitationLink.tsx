'use client'
import type { Citation } from '@/lib/citations'

interface CitationLinkProps {
  index: number
  citation?: Citation
  onScrollTo?: (charStart: number) => void
}

export default function CitationLink({ index, citation, onScrollTo }: CitationLinkProps) {
  if (!citation) {
    return <span className="gilt-citation">[{index}]</span>
  }

  return (
    <sup
      className="text-gilt-gold cursor-pointer hover:underline font-mono text-[0.7em] font-bold"
      onClick={() => onScrollTo?.(citation.char_start)}
      title={`From: ${citation.section ?? 'your notes'}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onScrollTo?.(citation.char_start)}
    >
      [{index}]
    </sup>
  )
}
