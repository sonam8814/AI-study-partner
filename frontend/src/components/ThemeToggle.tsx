'use client'
import { useTheme } from './ThemeProvider'

interface ThemeToggleProps {
  compact?: boolean
}

export default function ThemeToggle({ compact }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 rounded-lg transition-all duration-200 text-on-surface-variant hover:text-primary hover:bg-[--color-hover-bg]"
      style={{ padding: compact ? '6px' : '6px 12px' }}
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <span className="material-symbols-outlined text-[20px]">
        {theme === 'light' ? 'dark_mode' : 'light_mode'}
      </span>
      {!compact && (
        <span className="text-[13px] font-semibold hidden md:inline" style={{ fontFamily: 'Literata, Georgia, serif' }}>
          {theme === 'light' ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  )
}
