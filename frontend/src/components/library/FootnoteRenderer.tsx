'use client'
import type { ReactNode } from 'react'

interface FootnoteRendererProps {
  children: ReactNode
  id?: string
}

export default function FootnoteRenderer({ children, id }: FootnoteRendererProps) {
  return (
    <aside
      id={id}
      className="border-l-2 border-aged-paper pl-4 my-2 font-label-sm text-on-surface-variant italic"
    >
      {children}
    </aside>
  )
}
