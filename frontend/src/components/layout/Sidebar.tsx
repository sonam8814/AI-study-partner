'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import ThemeToggle from '@/components/ThemeToggle'

const NAV_ITEMS = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/library', icon: 'menu_book', label: 'My Library' },
  { href: '/weakspots', icon: 'assignment_late', label: 'Weak Spots' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 z-40"
      style={{
        background: `linear-gradient(180deg, var(--color-sidebar-start) 0%, var(--color-sidebar-end) 100%)`,
        borderRight: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sidebar)',
      }}>
      {/* Brand */}
      <div className="px-7 pt-7 pb-6">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)` }}>
            <span className="material-symbols-outlined text-[20px]" style={{ color: 'var(--color-on-primary)' }}>menu_book</span>
          </div>
          <div>
            <span className="font-headline-md text-[18px] text-primary tracking-tight block leading-tight"
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
              The Library
            </span>
            <span className="text-[10px] uppercase tracking-[0.15em]"
              style={{ fontFamily: 'Literata, Georgia, serif', color: 'var(--color-text-muted)' }}>
              Study Partner
            </span>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-6 mb-4 opacity-60" style={{ borderTop: '1px solid var(--color-border)' }} />

      {/* Navigation */}
      <nav className="flex flex-col flex-1 px-3">
        <span className="px-4 mb-2 text-[10px] uppercase tracking-[0.15em] font-semibold"
          style={{ fontFamily: 'Literata, Georgia, serif', color: 'var(--color-text-muted)' }}>
          Navigate
        </span>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-4 py-3 flex items-center gap-3 rounded-lg transition-all duration-200 mb-0.5',
                isActive
                  ? 'text-white shadow-sm'
                  : 'text-on-surface-variant'
              )}
              style={isActive
                ? { background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)`, boxShadow: 'var(--shadow-primary)' }
                : {}
              }
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = 'var(--color-hover-bg)'; e.currentTarget.style.color = 'var(--color-primary)' } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = ''; e.currentTarget.style.color = '' } }}
            >
              <span className="material-symbols-outlined text-[20px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 400" } : {}}>
                {item.icon}
              </span>
              <span className="font-body-md text-[14px]">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Theme toggle */}
      <div className="px-4 py-2">
        <ThemeToggle />
      </div>

      {/* Footer */}
      <div className="px-6 py-5" style={{ borderTop: '1px solid var(--color-border)', opacity: 0.8 }}>
        <p className="text-[10px] italic text-center"
          style={{ fontFamily: 'Literata, Georgia, serif', color: 'var(--color-text-faint)' }}>
          &ldquo;The more that you read, the more things you will know.&rdquo;
        </p>
      </div>
    </aside>
  )
}
