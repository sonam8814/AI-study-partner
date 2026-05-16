'use client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import CitationLink from './CitationLink'
import type { ChatMessage as ChatMessageType } from '@/types/session'
import type { Citation } from '@/lib/citations'

interface ChatMessageProps {
  message: ChatMessageType
  onScrollTo?: (charStart: number) => void
}

// Replace [N] markers with CitationLink components
function processCitations(
  text: string,
  citations: Citation[],
  onScrollTo?: (charStart: number) => void
): React.ReactNode[] {
  const parts = text.split(/(\[\d+\])/g)
  return parts.map((part, i) => {
    const match = part.match(/^\[(\d+)\]$/)
    if (match) {
      const idx = parseInt(match[1], 10)
      const citation = citations.find((c) => c.index === idx)
      return <CitationLink key={i} index={idx} citation={citation} onScrollTo={onScrollTo} />
    }
    return part
  })
}

export default function ChatMessage({ message, onScrollTo }: ChatMessageProps) {
  const citations = message.citations ?? []

  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] px-5 py-3.5 rounded-2xl rounded-tr-sm"
          style={{
            background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)`,
            boxShadow: 'var(--shadow-primary)',
          }}>
          <p className="font-body-md text-body-md text-white/95">{message.content}</p>
        </div>
      </div>
    )
  }

  // For assistant messages, we need to handle citation replacement within markdown
  const textWithCitations = message.content
  const hasCitations = citations.length > 0

  return (
    <div className="flex flex-col gap-2">
      <div className="pl-5 border-l-[3px] rounded-sm" style={{ borderColor: 'var(--color-gilt)' }}>
        <div className="font-body-lg text-body-lg text-on-surface leading-relaxed prose-library">
          {hasCitations ? (
            <div>
              {processCitations(textWithCitations, citations, onScrollTo)}
            </div>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {textWithCitations}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  )
}
