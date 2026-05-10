'use client'
import { useState, useEffect } from 'react'
import { useVoice } from '@/hooks/useVoice'
import { cn } from '@/lib/utils'

interface VoiceToggleProps {
  onTranscript?: (text: string) => void
}

export default function VoiceToggle({ onTranscript }: VoiceToggleProps) {
  const [mounted, setMounted] = useState(false)
  const { isListening, startListening, stopListening, transcript, resetTranscript, isSupported } =
    useVoice()

  useEffect(() => {
    setMounted(true)
  }, [])

  function handleToggle() {
    if (!mounted || !isSupported) return
    if (isListening) {
      stopListening()
      if (transcript && onTranscript) {
        onTranscript(transcript)
        resetTranscript()
      }
    } else {
      resetTranscript()
      startListening()
    }
  }

  const active = mounted && isSupported
  const icon = !active ? 'mic_off' : isListening ? 'mic' : 'mic_none'

  return (
    <button
      onClick={handleToggle}
      disabled={!active}
      aria-pressed={active ? isListening : undefined}
      title={
        !active
          ? 'Voice not supported in this browser'
          : isListening
          ? 'Stop listening'
          : 'Start voice input'
      }
      aria-label={
        !active
          ? 'Voice not supported'
          : isListening
          ? 'Stop listening'
          : 'Start voice input'
      }
      className={cn(
        'p-2 rounded-full transition-all',
        !active
          ? 'text-outline cursor-not-allowed'
          : isListening
          ? 'bg-error text-on-error animate-pulse'
          : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
      )}
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </button>
  )
}
