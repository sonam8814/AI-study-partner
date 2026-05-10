'use client'
import { useVoice } from '@/hooks/useVoice'
import { cn } from '@/lib/utils'

interface VoiceToggleProps {
  onTranscript?: (text: string) => void
}

export default function VoiceToggle({ onTranscript }: VoiceToggleProps) {
  const { isListening, startListening, stopListening, transcript, resetTranscript, isSupported, error } =
    useVoice()

  function handleToggle() {
    if (!isSupported) return
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

  if (!isSupported) {
    return (
      <button
        disabled
        className="p-2 text-outline cursor-not-allowed"
        title="Voice not supported in this browser"
        aria-label="Voice not supported"
      >
        <span className="material-symbols-outlined text-[20px]">mic_off</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      aria-pressed={isListening}
      title={isListening ? 'Stop listening' : 'Start voice input'}
      aria-label={isListening ? 'Stop listening' : 'Start voice input'}
      className={cn(
        'p-2 rounded-full transition-all',
        isListening
          ? 'bg-error text-on-error animate-pulse'
          : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
      )}
    >
      <span className="material-symbols-outlined text-[20px]">
        {isListening ? 'mic' : 'mic_none'}
      </span>
    </button>
  )
}
