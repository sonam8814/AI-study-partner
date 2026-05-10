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
    <div className="flex bg-surface-container-low border border-aged-paper rounded-full p-1 gap-1">
      {MODES.map((m) => (
        <button
          key={m}
          onClick={() => setMode(m)}
          className={cn(
            'px-3 py-1.5 rounded-full font-label-sm text-label-sm transition-colors flex items-center gap-1.5',
            mode === m
              ? 'bg-primary text-on-primary active-mode-italic'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          )}
          title={MODE_LABELS[m]}
        >
          <span className="material-symbols-outlined text-[16px]">{MODE_ICONS[m]}</span>
          <span className="hidden md:inline">{MODE_LABELS[m]}</span>
        </button>
      ))}
    </div>
  )
}
