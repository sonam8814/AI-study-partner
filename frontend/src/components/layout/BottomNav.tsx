'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/library', icon: 'auto_stories', label: 'Library' },
  { href: '/weakspots', icon: 'error', label: 'Weak Spots' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-outline-variant flex justify-around items-center z-50">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center p-2 transition-transform active:scale-90',
              isActive
                ? 'text-primary bg-secondary-fixed rounded-full px-4 py-1'
                : 'text-on-surface-variant hover:text-primary'
            )}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-label-sm text-label-sm">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
