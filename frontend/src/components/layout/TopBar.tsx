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
    <header className="bg-surface border-b border-outline-variant fixed top-0 z-50 flex items-center justify-between px-4 md:px-[40px] h-16 w-full">
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
          className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center hover:bg-surface-container transition-colors"
          title="Sign out"
          aria-label="Sign out"
        >
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">logout</span>
        </button>
      </div>
    </header>
  )
}
