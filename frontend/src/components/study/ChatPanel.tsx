'use client'
import { useEffect, useRef, useState } from 'react'
import { useStudyStore } from '@/stores/studyStore'
import { useStreamingChat } from '@/hooks/useStreamingChat'
import { useStudySession } from '@/hooks/useStudySession'
import ModeSwitcher from './ModeSwitcher'
import ChatMessage from './ChatMessage'
import StreamingMessage from './StreamingMessage'
import VoiceToggle from '@/components/voice/VoiceToggle'
import AlwaysListeningBanner from '@/components/voice/AlwaysListening'
import type { NotesPanelRef } from './NotesPanel'

interface ChatPanelProps {
  materialId: string
  notesPanelRef: React.RefObject<NotesPanelRef>
}

export default function ChatPanel({ materialId, notesPanelRef }: ChatPanelProps) {
  const [inputText, setInputText] = useState('')
  const [alwaysListening, setAlwaysListening] = useState(false)
  const { messages, isStreaming, streamingContent } = useStudyStore()
  const { sendMessage } = useStreamingChat(materialId)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Record study session
  useStudySession(materialId)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    const text = inputText.trim()
    if (!text || isStreaming) return
    setInputText('')
    await sendMessage(text)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  function handleVoiceTranscript(text: string) {
    setInputText((prev) => prev + (prev ? ' ' : '') + text)
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [inputText])

  return (
    <section className="flex-1 flex flex-col parchment-texture border-r border-outline-variant relative overflow-hidden">
      {/* Header row: mode switcher + always listening indicator */}
      <div className="px-4 py-3 border-b border-outline-variant bg-surface/80 backdrop-blur-sm flex items-center justify-between">
        <ModeSwitcher />
        {alwaysListening && (
          <AlwaysListeningBanner onDisable={() => setAlwaysListening(false)} />
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <span className="material-symbols-outlined text-primary text-[48px] mb-4 opacity-40">auto_stories</span>
            <p className="font-body-lg text-on-surface-variant italic max-w-sm">
              Ask a question, request a quiz, or say &ldquo;start Feynman mode&rdquo; to begin.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className="max-w-content mx-auto w-full">
            <ChatMessage
              message={msg}
              onScrollTo={(charStart) => notesPanelRef.current?.scrollToOffset(charStart)}
            />
          </div>
        ))}

        {isStreaming && streamingContent && (
          <div className="max-w-content mx-auto w-full">
            <StreamingMessage content={streamingContent} />
          </div>
        )}

        {isStreaming && !streamingContent && (
          <div className="max-w-content mx-auto w-full pl-6 border-l-2 border-primary">
            <div className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 md:p-6 bg-surface-container-low border-t border-aged-paper">
        <div className="max-w-content mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="flex items-end gap-3 bg-surface border border-outline rounded-xl p-3 focus-within:border-secondary transition-colors">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question or share your thinking…"
                rows={1}
                className="flex-1 bg-transparent border-none focus:ring-0 resize-none font-body-md text-body-md pt-1 max-h-32 outline-none"
                disabled={isStreaming}
              />
              <div className="flex items-center gap-2 border-l border-outline-variant pl-2">
                <VoiceToggle onTranscript={handleVoiceTranscript} />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isStreaming}
                  className="bg-primary text-surface rounded-full p-2 flex items-center justify-center hover:bg-primary-container transition-colors disabled:opacity-40 shrink-0"
                  aria-label="Send message"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
