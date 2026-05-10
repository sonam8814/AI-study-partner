'use client'
import dynamic from 'next/dynamic'
import '@uiw/react-md-editor/markdown-editor.css'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  height?: number
}

export default function MarkdownEditor({ value, onChange, height = 500 }: MarkdownEditorProps) {
  return (
    <div className="w-full" data-color-mode="light">
      <MDEditor
        value={value}
        onChange={(val) => onChange(val ?? '')}
        height={height}
        preview="edit"
        style={{
          fontFamily: 'Lora, Georgia, serif',
          fontSize: '18px',
          backgroundColor: '#fcf9f8',
          border: '1px solid #D4C9A8',
          borderRadius: '0 0 8px 8px',
        }}
      />
    </div>
  )
}
