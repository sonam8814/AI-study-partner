import { create } from 'zustand'
import type { Mode } from '@/lib/constants'
import type { ChatMessage } from '@/types/session'
import type { Citation } from '@/lib/citations'

interface StudyState {
  mode: Mode
  sessionId: string | null
  messages: ChatMessage[]
  isStreaming: boolean
  streamingContent: string
  citations: Citation[]
  setMode: (mode: Mode) => void
  setSessionId: (id: string | null) => void
  addMessage: (msg: ChatMessage) => void
  setStreaming: (streaming: boolean) => void
  appendStreamToken: (token: string) => void
  finalizeStreamedMessage: (citations: Citation[]) => void
  setCitations: (citations: Citation[]) => void
  reset: () => void
}

export const useStudyStore = create<StudyState>((set, get) => ({
  mode: 'tutor',
  sessionId: null,
  messages: [],
  isStreaming: false,
  streamingContent: '',
  citations: [],

  setMode: (mode) => set({ mode }),
  setSessionId: (id) => set({ sessionId: id }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setStreaming: (streaming) => set({ isStreaming: streaming, streamingContent: '' }),
  appendStreamToken: (token) =>
    set((s) => ({ streamingContent: s.streamingContent + token })),
  finalizeStreamedMessage: (citations) => {
    const { streamingContent, mode } = get()
    if (!streamingContent) return
    const msg: ChatMessage = {
      role: 'assistant',
      content: streamingContent,
      citations,
      timestamp: new Date().toISOString(),
      mode,
    }
    set((s) => ({
      messages: [...s.messages, msg],
      isStreaming: false,
      streamingContent: '',
    }))
  },
  setCitations: (citations) => set({ citations }),
  reset: () =>
    set({
      sessionId: null,
      messages: [],
      isStreaming: false,
      streamingContent: '',
      citations: [],
    }),
}))
