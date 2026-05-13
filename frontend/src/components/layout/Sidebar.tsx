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
    <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 z-40"
      style={{
        background: 'linear-gradient(180deg, #F9F5EC 0%, #F3EDE0 100%)',
        borderRight: '1px solid #D4C9A8',
        boxShadow: '2px 0 16px rgba(92, 61, 30, 0.04)',
      }}>
      {/* Brand */}
      <div className="px-7 pt-7 pb-6">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #033327 0%, #1F4A3D 100%)' }}>
            <span className="material-symbols-outlined text-white text-[20px]">menu_book</span>
          </div>
          <div>
            <span className="font-headline-md text-[18px] text-primary tracking-tight block leading-tight"
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
              The Library
            </span>
            <span className="text-[10px] text-[#7A7067] uppercase tracking-[0.15em]"
              style={{ fontFamily: 'Literata, Georgia, serif' }}>
              Study Partner
            </span>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-6 mb-4 border-t border-[#D4C9A8] opacity-60" />

      {/* Navigation */}
      <nav className="flex flex-col flex-1 px-3">
        <span className="px-4 mb-2 text-[10px] text-[#7A7067] uppercase tracking-[0.15em] font-semibold"
          style={{ fontFamily: 'Literata, Georgia, serif' }}>
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
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:bg-[#EDE7D9] hover:text-primary'
              )}
              style={isActive ? { boxShadow: '0 2px 8px rgba(3, 51, 39, 0.2)' } : {}}
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

      {/* Footer */}
      <div className="px-6 py-5 border-t border-[#D4C9A8] border-opacity-60">
        <p className="text-[10px] text-[#A09888] italic text-center"
          style={{ fontFamily: 'Literata, Georgia, serif' }}>
          &ldquo;The more that you read, the more things you will know.&rdquo;
        </p>
      </div>
    </aside>
  )
}
