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
      <nav className="md:hidden flex border-b border-outline-variant bg-surface sticky top-16 z-40">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 font-label-sm text-label-sm ${
            activeTab === 'chat' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant'
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-3 font-label-sm text-label-sm ${
            activeTab === 'notes' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant'
          }`}
        >
          Notes
        </button>
      </nav>

      {/* Desktop: side-by-side */}
      <main className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* Chat pane */}
        <div className={`${activeTab === 'chat' ? 'flex' : 'hidden'} md:flex flex-1`}>
          <ChatPanel materialId={material.id} notesPanelRef={notesPanelRef} />
        </div>

        {/* Notes pane */}
        <div className={`${activeTab === 'notes' ? 'flex' : 'hidden'} md:flex w-full md:w-[400px] border-l border-outline-variant`}>
          <NotesPanel ref={notesPanelRef} material={material} />
        </div>
      </main>
    </>
  )
}
