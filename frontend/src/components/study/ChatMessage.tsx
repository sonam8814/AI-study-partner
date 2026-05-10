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
        <div className="max-w-[80%] bg-primary text-surface-container-lowest px-6 py-4 rounded-xl rounded-tr-none">
          <p className="font-body-md text-body-md">{message.content}</p>
        </div>
      </div>
    )
  }

  // For assistant messages, we need to handle citation replacement within markdown
  // We render the content processing [N] markers
  const textWithCitations = message.content
  const hasCitations = citations.length > 0

  return (
    <div className="flex flex-col gap-2">
      <div className="pl-6 border-l-2 border-primary">
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
