'use client'
import Link from 'next/link'
import type { WeakSpot } from '@/types/bookshelf'
import { formatRelative } from '@/lib/utils'

interface WeakSpotItemProps {
  spot: WeakSpot
  onResolve: (id: string) => void
}

export default function WeakSpotItem({ spot, onResolve }: WeakSpotItemProps) {
  const severityColor = spot.miss_count >= 8
    ? 'bg-[#C62828]'
    : spot.miss_count >= 4
      ? 'bg-[#E65100]'
      : 'bg-secondary'

  return (
    <div className="card-hover rounded-xl p-6" style={{
      background: `linear-gradient(180deg, var(--color-surface-elevated) 0%, var(--color-surface-elevated-end) 100%)`,
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2.5">
          <span className={`w-3 h-3 rounded-full block ${severityColor}`}
            style={{ boxShadow: '0 0 6px rgba(198, 40, 40, 0.2)' }} />
          <span className="font-body-lg font-bold text-primary"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            {spot.topic}
          </span>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-error)', background: 'var(--color-error-badge-bg)' }}>
          {spot.miss_count} MISSES
        </span>
      </div>

      {spot.description && (
        <p className="text-body-md mb-4" style={{ fontFamily: 'Literata, Georgia, serif', color: 'var(--color-text-muted)' }}>
          {spot.description}
        </p>
      )}

      <p className="text-[12px] italic mb-4" style={{ fontFamily: 'Literata, Georgia, serif', color: 'var(--color-text-faint)' }}>
        Last missed {formatRelative(spot.last_missed_at)}
      </p>

      <div className="flex gap-3">
        {spot.material_id && (
          <Link
            href={`/materials/${spot.material_id}/study?mode=tutor&focus=${encodeURIComponent(spot.topic)}`}
            className="flex-1 text-white py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-[13px] font-semibold transition-all hover:opacity-90"
            style={{
              fontFamily: 'Literata, Georgia, serif',
              background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)`,
              boxShadow: 'var(--shadow-primary)',
            }}
          >
            Practice
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        )}
        <button
          onClick={() => onResolve(spot.id)}
          className="flex items-center justify-center p-2.5 rounded-lg transition-all duration-200"
          style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-hover-bg)'; e.currentTarget.style.color = 'var(--color-primary)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--color-text-muted)' }}
          title="Mark as resolved"
          aria-label="Mark as resolved"
        >
          <span className="material-symbols-outlined">check</span>
        </button>
      </div>
    </div>
  )
}
