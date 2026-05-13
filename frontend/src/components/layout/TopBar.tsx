'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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
    <header className="glass-header border-b border-[#D4C9A8]/60 fixed top-0 z-50 flex items-center justify-between px-4 md:px-[40px] h-16 w-full"
      style={{ boxShadow: '0 1px 8px rgba(92, 61, 30, 0.03)' }}>
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
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-[#EDE7D9] transition-all duration-200"
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
