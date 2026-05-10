import { useCallback } from 'react'
import { apiStream } from '@/lib/api'
import { useStudyStore } from '@/stores/studyStore'
import type { Mode } from '@/lib/constants'
import type { Citation } from '@/lib/citations'
import { toast } from 'react-hot-toast'

export function useStreamingChat(materialId: string) {
  const { mode, sessionId, setSessionId, addMessage, setStreaming, appendStreamToken, finalizeStreamedMessage } =
    useStudyStore()

  const sendMessage = useCallback(
    async (text: string) => {
      addMessage({
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
        mode,
      })

      setStreaming(true)
      let citations: Citation[] = []

      try {
        const stream = apiStream('/chat', {
          material_id: materialId,
          session_id: sessionId,
          mode,
          message: text,
          stream: true,
        })

        for await (const ev of stream) {
          if (ev.event === 'token') {
            const d = ev.data as { text: string }
            appendStreamToken(d.text)
          } else if (ev.event === 'citations') {
            const d = ev.data as { citations: Citation[] }
            citations = d.citations
          } else if (ev.event === 'done') {
            const d = ev.data as { session_id: string }
            if (d.session_id) setSessionId(d.session_id)
          } else if (ev.event === 'error') {
            const d = ev.data as { message: string }
            toast.error(d.message || 'Generation error')
          }
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Stream failed')
      } finally {
        finalizeStreamedMessage(citations)
      }
    },
    [materialId, mode, sessionId, addMessage, setSessionId, setStreaming, appendStreamToken, finalizeStreamedMessage]
  )

  return { sendMessage }
}
