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
      background: '#F0E8D4',
      border: '1px solid #D4C9A8',
    }}>
      {MODES.map((m) => (
        <button
          key={m}
          onClick={() => setMode(m)}
          className={cn(
            'px-3 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-200 flex items-center gap-1.5',
            mode === m
              ? 'bg-primary text-white shadow-sm'
              : 'text-[#7A7067] hover:bg-[#E8DFC8] hover:text-primary'
          )}
          style={mode === m ? { boxShadow: '0 1px 4px rgba(3,51,39,0.2)' } : {}}
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
