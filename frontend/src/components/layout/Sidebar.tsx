'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/library', icon: 'menu_book', label: 'My Library' },
  { href: '/weakspots', icon: 'assignment_late', label: 'Weak Spots' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col py-8 h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant z-40">
      <div className="font-headline-md text-headline-md text-primary mb-8 px-8 flex items-center gap-2">
        <span className="material-symbols-outlined">menu_book</span>
        <span>The Library</span>
      </div>
      <nav className="flex flex-col flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-8 py-3 flex items-center gap-4 transition-all duration-150',
                isActive
                  ? 'border-l-4 border-secondary text-primary bg-surface-container-high font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container'
              )}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-body-md">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
