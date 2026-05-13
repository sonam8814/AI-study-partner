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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] glass-header border-t border-[#D4C9A8]/60 flex justify-around items-center z-50 px-2"
      style={{ boxShadow: '0 -2px 12px rgba(92, 61, 30, 0.04)' }}>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center px-4 py-1.5 rounded-xl transition-all duration-200 min-w-[64px]',
              isActive
                ? 'text-primary'
                : 'text-on-surface-variant'
            )}
          >
            <div className={cn(
              'w-12 h-7 flex items-center justify-center rounded-full mb-0.5 transition-all duration-200',
              isActive ? 'bg-primary-fixed' : ''
            )}>
              <span className="material-symbols-outlined text-[22px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 400" } : {}}>
                {item.icon}
              </span>
            </div>
            <span className="text-[11px] font-semibold" style={{ fontFamily: 'Literata, Georgia, serif' }}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
