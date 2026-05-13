'use client'
import { useRef, useImperativeHandle, forwardRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Material } from '@/types/material'

export interface NotesPanelRef {
  scrollToOffset: (charStart: number) => void
}

interface NotesPanelProps {
  material: Material
}

// Custom component that wraps each block element with char-range data
function buildComponents(markdown: string) {
  // Track cumulative char position across blocks
  const lines = markdown.split('\n')
  let pos = 0
  const lineStarts: number[] = []
  for (const line of lines) {
    lineStarts.push(pos)
    pos += line.length + 1 // +1 for newline
  }

  return {
    p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement> & { node?: unknown }) => {
      const { node: _node, ...rest } = props
      return (
        <p
          {...rest}
          className="font-body-md text-body-md text-on-surface leading-relaxed mb-4"
        >
          {children}
        </p>
      )
    },
    h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement> & { node?: unknown }) => {
      const { node: _node, ...rest } = props
      return (
        <h1
          {...rest}
          className="font-display text-[28px] text-primary mb-4 mt-8"
          style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
        >
          {children}
        </h1>
      )
    },
    h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement> & { node?: unknown }) => {
      const { node: _node, ...rest } = props
      return (
        <h2
          {...rest}
          className="font-headline-md text-headline-md text-primary mb-3 mt-6"
        >
          {children}
        </h2>
      )
    },
    h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement> & { node?: unknown }) => {
      const { node: _node, ...rest } = props
      return (
        <h3
          {...rest}
          className="font-label-sm text-label-sm uppercase tracking-widest text-secondary mb-2 mt-4"
        >
          {children}
        </h3>
      )
    },
    ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement> & { node?: unknown }) => {
      const { node: _node, ...rest } = props
      return (
        <ul {...rest} className="space-y-2 pl-4 border-l border-aged-paper mb-4">
          {children}
        </ul>
      )
    },
    li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement> & { node?: unknown }) => {
      const { node: _node, ...rest } = props
      return (
        <li {...rest} className="font-body-md text-on-surface">
          {children}
        </li>
      )
    },
    code: ({ children, ...props }: React.HTMLAttributes<HTMLElement> & { inline?: boolean; node?: unknown }) => {
      const { inline, node: _node, ...rest } = props
      if (inline) {
        return (
          <code {...rest} className="font-mono text-code-sm bg-surface-container px-1 py-0.5 rounded text-primary">
            {children}
          </code>
        )
      }
      return (
        <pre className="bg-surface-container border border-aged-paper rounded-md p-4 overflow-x-auto mb-4">
          <code {...rest} className="font-mono text-code-sm text-on-surface">
            {children}
          </code>
        </pre>
      )
    },
    blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement> & { node?: unknown }) => {
      const { node: _node, ...rest } = props
      return (
        <blockquote {...rest} className="border-l-2 border-aged-paper pl-4 italic text-on-surface-variant mb-4">
          {children}
        </blockquote>
      )
    },
  }
}

const NotesPanel = forwardRef<NotesPanelRef, NotesPanelProps>(function NotesPanel(
  { material },
  ref
) {
  const panelRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => ({
    scrollToOffset(charStart: number) {
      if (!panelRef.current) return
      const blocks = panelRef.current.querySelectorAll('[data-char-start]')
      let target: HTMLElement | null = null
      for (const b of blocks) {
        const start = parseInt(b.getAttribute('data-char-start') ?? '0', 10)
        const end = parseInt(b.getAttribute('data-char-end') ?? '0', 10)
        if (charStart >= start && charStart <= end) {
          target = b as HTMLElement
          break
        }
      }
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' })
        target.classList.add('citation-highlight')
        setTimeout(() => target!.classList.remove('citation-highlight'), 1500)
      }
    },
  }))

  const components = buildComponents(material.markdown_content)

  return (
    <aside className="h-full overflow-y-auto custom-scrollbar" style={{
      background: 'linear-gradient(180deg, #FDFBF7 0%, #F9F5EC 100%)',
    }}>
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[18px] text-primary font-semibold"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            Your Notes
          </h3>
          <a
            href={`/materials/${material.id}`}
            className="text-[#7A7067] hover:text-primary hover:bg-[#EDE7D9] p-1.5 rounded-lg transition-all duration-200"
            title="Edit notes"
          >
            <span className="material-symbols-outlined text-[20px]">edit_note</span>
          </a>
        </div>

        {material.markdown_content ? (
          <div ref={panelRef} className="prose-library max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={components}
            >
              {material.markdown_content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-[48px] mb-3 block opacity-25 text-primary">description</span>
            <p className="text-[#7A7067] italic" style={{ fontFamily: 'Literata, Georgia, serif' }}>Notes are empty.</p>
            <a
              href={`/materials/${material.id}`}
              className="mt-4 inline-block text-primary text-[13px] font-semibold hover:underline"
              style={{ fontFamily: 'Literata, Georgia, serif' }}
            >
              Add notes &rarr;
            </a>
          </div>
        )}
      </div>
    </aside>
  )
})

export default NotesPanel
