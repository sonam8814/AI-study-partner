import { useEffect, useRef, useCallback } from 'react'
import { useStudyStore } from '@/stores/studyStore'
import { useStreak } from './useStreak'

export function useStudySession(materialId: string) {
  const startTime = useRef<number>(Date.now())
  const recorded = useRef(false)
  const lastRecordedMinutes = useRef(0)
  const hasMessages = useRef(false)
  const { messages } = useStudyStore()
  const { recordStudyDay } = useStreak()
  const recordRef = useRef(recordStudyDay)
  recordRef.current = recordStudyDay

  // Keep hasMessages ref in sync so unmount cleanup sees the latest value
  useEffect(() => {
    if (messages.length > 0) hasMessages.current = true
  }, [messages.length])

  const getElapsedMinutes = useCallback(() => {
    return Math.ceil((Date.now() - startTime.current) / 60000)
  }, [])

  // Record study day after 60 seconds AND at least 1 message sent.
  // Uses a timer so it fires even if no new messages arrive after 60s.
  useEffect(() => {
    if (messages.length === 0) return
    if (recorded.current) return

    const elapsed = (Date.now() - startTime.current) / 1000
    if (elapsed >= 60) {
      recorded.current = true
      const minutes = getElapsedMinutes()
      lastRecordedMinutes.current = minutes
      recordStudyDay(minutes)
    } else {
      const delay = Math.ceil((60 - elapsed) * 1000)
      const timer = setTimeout(() => {
        if (recorded.current) return
        recorded.current = true
        const minutes = getElapsedMinutes()
        lastRecordedMinutes.current = minutes
        recordStudyDay(minutes)
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [messages.length, recordStudyDay, getElapsedMinutes])

  // Periodically update study minutes every 5 minutes if session is active
  useEffect(() => {
    if (messages.length === 0) return

    const interval = setInterval(() => {
      if (!recorded.current) return
      const minutes = getElapsedMinutes()
      const delta = minutes - lastRecordedMinutes.current
      if (delta >= 5) {
        lastRecordedMinutes.current = minutes
        recordStudyDay(delta)
      }
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [messages.length, recordStudyDay, getElapsedMinutes])

  // On unmount, record remaining time if user had an active session
  useEffect(() => {
    return () => {
      if (!hasMessages.current) return
      const minutes = Math.ceil((Date.now() - startTime.current) / 60000)
      const delta = minutes - lastRecordedMinutes.current
      if (delta > 0) {
        recordRef.current(delta)
      }
    }
  }, [])
}
