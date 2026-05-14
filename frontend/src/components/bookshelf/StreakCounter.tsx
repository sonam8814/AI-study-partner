'use client'
import type { BookshelfStats } from '@/types/bookshelf'

interface StreakCounterProps {
  stats: BookshelfStats
}

export default function StreakCounter({ stats }: StreakCounterProps) {
  return (
    <div className="flex gap-4">
      <div className="bg-surface-container-low border border-aged-paper rounded-lg p-4 w-40 flex flex-col justify-between">
        <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">Day Streak</span>
        <div className="flex items-end gap-1 mt-4">
          <span className="font-display text-[32px] text-primary" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            {stats.current_streak}
          </span>
          <span className="mb-1 text-xl">🔥</span>
        </div>
      </div>
      <div className="bg-surface-container-low border border-aged-paper rounded-lg p-4 w-40 flex flex-col justify-between">
        <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">Total Days</span>
        <div className="mt-4">
          <span className="font-display text-[32px] text-primary" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            {stats.total_study_days}
          </span>
        </div>
      </div>
    </div>
  )
}
