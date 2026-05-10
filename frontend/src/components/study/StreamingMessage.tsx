'use client'

interface StreamingMessageProps {
  content: string
}

export default function StreamingMessage({ content }: StreamingMessageProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="pl-6 border-l-2 border-primary">
        <p className="font-body-lg text-body-lg text-on-surface leading-relaxed streaming-cursor">
          {content}
        </p>
      </div>
    </div>
  )
}
