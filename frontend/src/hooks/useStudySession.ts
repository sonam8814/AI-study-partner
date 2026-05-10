import { useEffect, useRef } from 'react'
import { useStudyStore } from '@/stores/studyStore'
import { useStreak } from './useStreak'

export function useStudySession(materialId: string) {
  const startTime = useRef<Date>(new Date())
  const recorded = useRef(false)
  const { messages } = useStudyStore()
  const { recordStudyDay } = useStreak()

  // Record study day when user sends their first message (after 60s)
  useEffect(() => {
    if (messages.length === 0 || recorded.current) return

    const elapsed = (Date.now() - startTime.current.getTime()) / 1000
    if (elapsed >= 60) {
      recorded.current = true
      const minutes = Math.ceil(elapsed / 60)
      recordStudyDay(minutes)
    }
  }, [messages, recordStudyDay])

  // On unmount, record if any session happened
  useEffect(() => {
    return () => {
      if (messages.length > 0 && !recorded.current) {
        const elapsed = (Date.now() - startTime.current.getTime()) / 1000
        const minutes = Math.max(1, Math.ceil(elapsed / 60))
        recordStudyDay(minutes)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
