'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useVoiceStore } from '@/stores/voiceStore'
import { createClient } from '@/lib/supabase/client'

const SR =
  typeof window !== 'undefined'
    ? (window as Window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition ||
      (window as Window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
    : null

export interface UseVoiceReturn {
  isListening: boolean
  transcript: string
  interimTranscript: string
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  isSpeaking: boolean
  speak: (text: string) => Promise<void>
  cancelSpeech: () => void
  alwaysOn: boolean
  setAlwaysOn: (on: boolean) => void
  error: string | null
  isSupported: boolean
}

export function useVoice(): UseVoiceReturn {
  const { alwaysOn, isListening, isSpeaking, setAlwaysOn, setListening, setSpeaking } =
    useVoiceStore()

  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const isSupported = !!SR && typeof window !== 'undefined' && !!window.speechSynthesis

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [setListening])

  const startListening = useCallback(() => {
    if (!SR) {
      setError('Speech recognition not supported in this browser.')
      return
    }
    if (isListening) return

    const recognition = new (SR as new () => SpeechRecognition)()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onresult = (ev) => {
      let interim = ''
      let final = ''
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i]
        if (r.isFinal) final += r[0].transcript
        else interim += r[0].transcript
      }
      if (final) setTranscript((t) => t + final)
      setInterimTranscript(interim)
    }

    recognition.onerror = (ev) => {
      setError(ev.error)
      setListening(false)
    }

    recognition.onend = () => {
      setListening(false)
      setInterimTranscript('')
    }

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
    setError(null)
  }, [isListening, setListening])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
  }, [])

  const speak = useCallback(
    async (text: string): Promise<void> => {
      if (!window.speechSynthesis) return
      return new Promise((resolve) => {
        // Strip markdown for TTS
        const plain = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/\[(\d+)\]/g, '').trim()
        const utterance = new SpeechSynthesisUtterance(plain)
        utterance.rate = 1.05
        utterance.pitch = 1.0
        utterance.volume = 1.0

        const voices = window.speechSynthesis.getVoices()
        utterance.voice =
          voices.find((v) => v.name.includes('Daniel')) ||
          voices.find((v) => v.lang.startsWith('en')) ||
          voices[0] ||
          null

        utterance.onstart = () => setSpeaking(true)
        utterance.onend = () => {
          setSpeaking(false)
          resolve()
        }
        utterance.onerror = () => {
          setSpeaking(false)
          resolve()
        }

        window.speechSynthesis.speak(utterance)
      })
    },
    [setSpeaking]
  )

  const cancelSpeech = useCallback(() => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
  }, [setSpeaking])

  const handleSetAlwaysOn = useCallback(
    async (on: boolean) => {
      setAlwaysOn(on)
      // Persist to profile
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase
            .from('profiles')
            .update({ voice_always_on: on })
            .eq('id', user.id)
        }
      } catch {
        // Non-critical
      }
    },
    [setAlwaysOn]
  )

  return {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSpeaking,
    speak,
    cancelSpeech,
    alwaysOn,
    setAlwaysOn: handleSetAlwaysOn,
    error,
    isSupported,
  }
}
