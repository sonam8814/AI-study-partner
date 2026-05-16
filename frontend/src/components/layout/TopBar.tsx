'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ThemeToggle from '@/components/ThemeToggle'

interface TopBarProps {
  title?: string
  showMenu?: boolean
}

export default function TopBar({ title, showMenu = false }: TopBarProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="glass-header fixed top-0 z-50 flex items-center justify-between px-4 md:px-[40px] h-16 w-full"
      style={{ borderBottom: '1px solid var(--color-border-light)', boxShadow: 'var(--shadow-soft)' }}>
      <div className="flex items-center gap-4">
        {showMenu && (
          <button className="md:hidden text-primary">
            <span className="material-symbols-outlined">menu</span>
          </button>
        )}
        {title && (
          <h1 className="font-headline-md text-headline-md font-bold text-primary">{title}</h1>
        )}
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle compact />
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-primary transition-all duration-200"
          style={{ background: 'transparent' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-hover-bg)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          title="Sign out"
          aria-label="Sign out"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span className="hidden md:inline text-[13px] font-semibold" style={{ fontFamily: 'Literata, Georgia, serif' }}>
            Sign out
          </span>
        </button>
      </div>
    </header>
  )
}
