'use client'
import Link from 'next/link'
import type { WeakSpot } from '@/types/garden'
import { formatRelative } from '@/lib/utils'

interface WeakSpotItemProps {
  spot: WeakSpot
  onResolve: (id: string) => void
}

export default function WeakSpotItem({ spot, onResolve }: WeakSpotItemProps) {
  const severity = spot.miss_count >= 8 ? 'error' : spot.miss_count >= 4 ? 'secondary' : 'secondary-fixed-dim'
  const severityColor = spot.miss_count >= 8 ? 'bg-error' : spot.miss_count >= 4 ? 'bg-secondary' : 'bg-secondary-fixed-dim'

  return (
    <div className="border border-aged-paper bg-surface-container-low p-6 rounded-xl hover:bg-surface-container transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full block ${severityColor}`} />
          <span className="font-body-lg font-bold text-primary">{spot.topic}</span>
        </div>
        <span className="bg-error text-on-error px-2 py-0.5 rounded-full font-mono text-[11px] font-bold">
          {spot.miss_count} MISSES
        </span>
      </div>

      {spot.description && (
        <p className="text-on-surface-variant text-body-md mb-4">{spot.description}</p>
      )}

      <p className="text-outline text-label-sm italic mb-4">
        Last missed {formatRelative(spot.last_missed_at)}
      </p>

      <div className="flex gap-3">
        {spot.material_id && (
          <Link
            href={`/materials/${spot.material_id}/study?mode=tutor&focus=${encodeURIComponent(spot.topic)}`}
            className="flex-1 bg-primary text-on-primary py-2 px-4 rounded-lg flex items-center justify-center gap-2 font-label-sm hover:opacity-90 transition-opacity"
          >
            Practice
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        )}
        <button
          onClick={() => onResolve(spot.id)}
          className="flex items-center justify-center border border-outline-variant text-on-surface p-2 rounded-lg hover:bg-surface-container-high transition-colors"
          title="Mark as resolved"
          aria-label="Mark as resolved"
        >
          <span className="material-symbols-outlined">check</span>
        </button>
      </div>
    </div>
  )
}
