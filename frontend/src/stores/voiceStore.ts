import { create } from 'zustand'

interface VoiceState {
  alwaysOn: boolean
  isListening: boolean
  isSpeaking: boolean
  setAlwaysOn: (on: boolean) => void
  setListening: (listening: boolean) => void
  setSpeaking: (speaking: boolean) => void
}

export const useVoiceStore = create<VoiceState>((set) => ({
  alwaysOn: false,
  isListening: false,
  isSpeaking: false,
  setAlwaysOn: (on) => set({ alwaysOn: on }),
  setListening: (listening) => set({ isListening: listening }),
  setSpeaking: (speaking) => set({ isSpeaking: speaking }),
}))
