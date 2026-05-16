'use client'
import dynamic from 'next/dynamic'
import '@uiw/react-md-editor/markdown-editor.css'
import { useTheme } from '@/components/ThemeProvider'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  height?: number
}

export default function MarkdownEditor({ value, onChange, height = 500 }: MarkdownEditorProps) {
  const { theme } = useTheme()

  return (
    <div className="w-full" data-color-mode={theme}>
      <MDEditor
        value={value}
        onChange={(val) => onChange(val ?? '')}
        height={height}
        preview="edit"
        style={{
          fontFamily: 'Lora, Georgia, serif',
          fontSize: '18px',
          backgroundColor: 'var(--color-background)',
          border: '1px solid var(--color-border)',
          borderRadius: '0 0 8px 8px',
        }}
      />
    </div>
  )
}
