'use client'
import { useStudyStore } from '@/stores/studyStore'
import { MODES, MODE_LABELS } from '@/lib/constants'
import type { Mode } from '@/lib/constants'
import { cn } from '@/lib/utils'

const MODE_ICONS: Record<Mode, string> = {
  peer: 'groups',
  tutor: 'school',
  examiner: 'assignment',
  feynman: 'lightbulb',
}

export default function ModeSwitcher() {
  const { mode, setMode } = useStudyStore()

  return (
    <div className="flex rounded-full p-1 gap-0.5" style={{
      background: 'var(--color-parchment-end)',
      border: '1px solid var(--color-border)',
    }}>
      {MODES.map((m) => (
        <button
          key={m}
          onClick={() => setMode(m)}
          className={cn(
            'px-3 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-200 flex items-center gap-1.5',
            mode === m
              ? 'text-white shadow-sm'
              : ''
          )}
          style={mode === m
            ? { background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)`, boxShadow: 'var(--shadow-primary)', color: 'white' }
            : { color: 'var(--color-text-muted)' }
          }
          onMouseEnter={(e) => { if (mode !== m) { e.currentTarget.style.background = 'var(--color-hover-bg)'; e.currentTarget.style.color = 'var(--color-primary)' } }}
          onMouseLeave={(e) => { if (mode !== m) { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--color-text-muted)' } }}
          title={MODE_LABELS[m]}
        >
          <span className="material-symbols-outlined text-[16px]"
            style={mode === m ? { fontVariationSettings: "'FILL' 1" } : {}}>
            {MODE_ICONS[m]}
          </span>
          <span className="hidden md:inline" style={{ fontFamily: 'Literata, Georgia, serif' }}>
            {MODE_LABELS[m]}
          </span>
        </button>
      ))}
    </div>
  )
}
