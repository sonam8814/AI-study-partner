'use client'
import { useRef, useState } from 'react'
import ChatPanel from './ChatPanel'
import NotesPanel, { type NotesPanelRef } from './NotesPanel'
import type { Material } from '@/types/material'

interface DualPaneLayoutProps {
  material: Material
}

export default function DualPaneLayout({ material }: DualPaneLayoutProps) {
  const notesPanelRef = useRef<NotesPanelRef>(null)
  const [activeTab, setActiveTab] = useState<'chat' | 'notes'>('chat')

  return (
    <>
      {/* Mobile tab switcher */}
      <nav className="md:hidden flex sticky top-14 z-40"
        style={{
          borderBottom: '1px solid var(--color-border-light)',
          background: `linear-gradient(180deg, var(--color-input-area-start) 0%, var(--color-input-area-end) 100%)`,
        }}>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 text-[13px] font-semibold transition-all duration-200 ${
            activeTab === 'chat'
              ? 'border-b-2 border-primary text-primary'
              : ''
          }`}
          style={{
            fontFamily: 'Literata, Georgia, serif',
            ...(activeTab !== 'chat' ? { color: 'var(--color-text-muted)' } : {}),
          }}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-3 text-[13px] font-semibold transition-all duration-200 ${
            activeTab === 'notes'
              ? 'border-b-2 border-primary text-primary'
              : ''
          }`}
          style={{
            fontFamily: 'Literata, Georgia, serif',
            ...(activeTab !== 'notes' ? { color: 'var(--color-text-muted)' } : {}),
          }}
        >
          Notes
        </button>
      </nav>

      {/* Desktop: side-by-side */}
      <main className="flex h-[calc(100vh-56px)] overflow-hidden">
        {/* Chat pane */}
        <div className={`${activeTab === 'chat' ? 'flex' : 'hidden'} md:flex flex-1`}>
          <ChatPanel materialId={material.id} notesPanelRef={notesPanelRef} />
        </div>

        {/* Notes pane */}
        <div className={`${activeTab === 'notes' ? 'flex' : 'hidden'} md:flex w-full md:w-[400px]`}
          style={{ borderLeft: '1px solid var(--color-border-light)' }}>
          <NotesPanel ref={notesPanelRef} material={material} />
        </div>
      </main>
    </>
  )
}
