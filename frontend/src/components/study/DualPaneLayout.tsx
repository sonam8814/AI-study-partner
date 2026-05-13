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
      <nav className="md:hidden flex border-b border-[#D4C9A8]/60 sticky top-14 z-40"
        style={{ background: 'linear-gradient(180deg, #F9F5EC 0%, #F3EDE0 100%)' }}>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 text-[13px] font-semibold transition-all duration-200 ${
            activeTab === 'chat'
              ? 'border-b-2 border-primary text-primary'
              : 'text-[#7A7067]'
          }`}
          style={{ fontFamily: 'Literata, Georgia, serif' }}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-3 text-[13px] font-semibold transition-all duration-200 ${
            activeTab === 'notes'
              ? 'border-b-2 border-primary text-primary'
              : 'text-[#7A7067]'
          }`}
          style={{ fontFamily: 'Literata, Georgia, serif' }}
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
        <div className={`${activeTab === 'notes' ? 'flex' : 'hidden'} md:flex w-full md:w-[400px] border-l border-[#D4C9A8]/60`}>
          <NotesPanel ref={notesPanelRef} material={material} />
        </div>
      </main>
    </>
  )
}
