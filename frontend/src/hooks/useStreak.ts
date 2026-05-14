import { useCallback } from 'react'
import { api } from '@/lib/api'
import type { BookshelfStats } from '@/types/bookshelf'

interface RecordDayResult {
  current_streak: number
  longest_streak: number
  current_plant_stage: number
  is_new_day: boolean
  plant_just_grew: boolean
}

export function useStreak() {
  const recordStudyDay = useCallback(async (minutesStudied: number): Promise<RecordDayResult | null> => {
    try {
      return await api<RecordDayResult>('/bookshelf/record', {
        method: 'POST',
        body: JSON.stringify({ minutes_studied: minutesStudied }),
      })
    } catch {
      return null
    }
  }, [])

  const getBookshelfStats = useCallback(async (): Promise<BookshelfStats | null> => {
    try {
      return await api<BookshelfStats>('/bookshelf')
    } catch {
      return null
    }
  }, [])

  return { recordStudyDay, getBookshelfStats }
}
