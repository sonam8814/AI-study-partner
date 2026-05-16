'use client'

interface StreamingMessageProps {
  content: string
}

export default function StreamingMessage({ content }: StreamingMessageProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="pl-5 border-l-[3px] rounded-sm" style={{ borderColor: 'var(--color-gilt)' }}>
        <p className="font-body-lg text-body-lg text-on-surface leading-relaxed streaming-cursor">
          {content}
        </p>
      </div>
    </div>
  )
}
