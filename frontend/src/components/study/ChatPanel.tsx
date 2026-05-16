'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useStudyStore } from '@/stores/studyStore'
import { useStreamingChat } from '@/hooks/useStreamingChat'
import { useStudySession } from '@/hooks/useStudySession'
import { useVoice } from '@/hooks/useVoice'
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
  const { messages, isStreaming, streamingContent } = useStudyStore()
  const { sendMessage } = useStreamingChat(materialId)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const {
    alwaysOn,
    setAlwaysOn,
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSpeaking,
    speak,
    cancelSpeech,
    isSupported,
  } = useVoice()

  // Record study session
  useStudySession(materialId)

  // --- Always-listening: silence detection + auto-submit ---
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastInterimRef = useRef('')

  // Track interim transcript changes for silence detection
  useEffect(() => {
    if (!alwaysOn || !isListening || isStreaming || isSpeaking) return

    // If interim changed, reset the silence timer
    if (interimTranscript !== lastInterimRef.current) {
      lastInterimRef.current = interimTranscript
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)

      // Only set silence timer if there's accumulated content
      if (transcript || interimTranscript) {
        silenceTimerRef.current = setTimeout(() => {
          // 1500ms of silence — populate the input so user can review & send manually
          const text = transcript.trim()
          if (text) {
            stopListening()
            resetTranscript()
            setInputText((prev) => prev + (prev ? ' ' : '') + text)
            // Re-start listening if always-on
            if (alwaysOn && !isStreaming) {
              setTimeout(() => startListening(), 300)
            }
          }
        }, 1500)
      }
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
    }
  }, [interimTranscript, transcript, alwaysOn, isListening, isStreaming, isSpeaking, stopListening, resetTranscript, startListening])

  // Start listening when alwaysOn is enabled
  useEffect(() => {
    if (alwaysOn && isSupported && !isListening && !isStreaming && !isSpeaking) {
      resetTranscript()
      startListening()
    }
  }, [alwaysOn, isSupported, isListening, isStreaming, isSpeaking, resetTranscript, startListening])

  // Auto-speak AI response when alwaysOn and streaming finishes
  const prevMessageCountRef = useRef(messages.length)
  useEffect(() => {
    if (!alwaysOn || isStreaming) return
    if (messages.length > prevMessageCountRef.current) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg?.role === 'assistant') {
        speak(lastMsg.content)
      }
    }
    prevMessageCountRef.current = messages.length
  }, [messages, isStreaming, alwaysOn, speak])

  // Resume listening 500ms after TTS finishes
  const wasSpeakingRef = useRef(false)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null
    if (isSpeaking) {
      wasSpeakingRef.current = true
      if (isListening) stopListening()
    } else if (wasSpeakingRef.current) {
      wasSpeakingRef.current = false
      if (alwaysOn && !isStreaming) {
        timer = setTimeout(() => {
          resetTranscript()
          startListening()
        }, 500)
      }
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [isSpeaking, alwaysOn, isStreaming, isListening, stopListening, resetTranscript, startListening])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
    }
  }, [])

  // --- Scroll to bottom ---
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

  const handleDisableAlwaysOn = useCallback(() => {
    setAlwaysOn(false)
    stopListening()
    cancelSpeech()
  }, [setAlwaysOn, stopListening, cancelSpeech])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [inputText])

  return (
    <section className="flex-1 flex flex-col parchment-texture relative overflow-hidden"
      style={{ borderRight: '1px solid var(--color-border-light)' }}>
      {/* Header row: mode switcher + always listening indicator */}
      <div className="px-4 py-3 glass-header flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}>
        <ModeSwitcher />
        {alwaysOn && (
          <AlwaysListeningBanner onDisable={handleDisableAlwaysOn} />
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth custom-scrollbar">
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
              style={{ background: `linear-gradient(135deg, var(--chat-empty-bg-start) 0%, var(--chat-empty-bg-end) 100%)` }}>
              <span className="material-symbols-outlined text-primary text-[36px] opacity-50">auto_stories</span>
            </div>
            <p className="font-body-lg italic max-w-sm" style={{ fontFamily: 'Literata, Georgia, serif', color: 'var(--color-text-muted)' }}>
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

      {/* Interim transcript preview (always-listening) */}
      {alwaysOn && (transcript || interimTranscript) && (
        <div className="px-4 py-2 bg-surface-container-low border-t border-outline-variant">
          <p className="font-body-md text-on-surface-variant italic text-sm max-w-content mx-auto">
            {transcript}
            <span className="text-outline">{interimTranscript}</span>
          </p>
        </div>
      )}

      {/* Input */}
      <div className="p-4 md:p-6" style={{
        borderTop: '1px solid var(--color-border-light)',
        background: `linear-gradient(180deg, var(--color-input-area-start) 0%, var(--color-input-area-end) 100%)`,
      }}>
        <div className="max-w-content mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="flex items-end gap-3 rounded-xl p-3 focus-within:shadow-sm transition-all duration-200"
              style={{
                background: 'var(--color-input-bg)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)',
              }}>
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question or share your thinking..."
                rows={1}
                className="flex-1 bg-transparent border-none focus:ring-0 resize-none font-body-md text-body-md pt-1 max-h-32 outline-none"
                style={{ color: 'var(--color-on-surface)' }}
                disabled={isStreaming}
              />
              <div className="flex items-center gap-1.5 pl-2" style={{ borderLeft: '1px solid var(--color-weakspot-border)' }}>
                <VoiceToggle onTranscript={handleVoiceTranscript} />
                {isSupported && (
                  <button
                    type="button"
                    onClick={() => alwaysOn ? handleDisableAlwaysOn() : setAlwaysOn(true)}
                    title={alwaysOn ? 'Disable always listening' : 'Enable always listening'}
                    aria-label={alwaysOn ? 'Disable always listening' : 'Enable always listening'}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      alwaysOn
                        ? 'bg-primary text-white animate-pulse'
                        : ''
                    }`}
                    style={!alwaysOn ? { color: 'var(--color-text-muted)' } : {}}
                    onMouseEnter={(e) => { if (!alwaysOn) { e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.background = 'var(--color-hover-bg)' } }}
                    onMouseLeave={(e) => { if (!alwaysOn) { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = '' } }}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {alwaysOn ? 'hearing' : 'hearing_disabled'}
                    </span>
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!inputText.trim() || isStreaming}
                  className="rounded-full p-2.5 flex items-center justify-center transition-all duration-200 disabled:opacity-30 shrink-0"
                  style={{
                    background: inputText.trim() && !isStreaming
                      ? `linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)`
                      : 'var(--color-disabled-bg)',
                    color: inputText.trim() && !isStreaming ? 'white' : 'var(--color-disabled-text)',
                    boxShadow: inputText.trim() && !isStreaming ? 'var(--shadow-primary)' : 'none',
                  }}
                  aria-label="Send message"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
