import { createServerClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import DualPaneLayout from '@/components/study/DualPaneLayout'
import Link from 'next/link'
import type { Material } from '@/types/material'

export default async function StudyPage({ params, searchParams }: {
  params: { id: string }
  searchParams?: { mode?: string }
}) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch material from Supabase directly (bypasses backend for simple reads)
  const { data: material, error } = await supabase
    .from('materials')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !material) notFound()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Study header */}
      <header className="sticky top-0 z-50 glass-header h-14 flex items-center px-4 md:px-[40px] justify-between"
        style={{ borderBottom: '1px solid var(--color-border-light)', boxShadow: 'var(--shadow-soft)' }}>
        <div className="flex items-center gap-4">
          <Link
            href="/library"
            className="flex items-center gap-2 text-primary text-[13px] font-semibold hover:opacity-80 transition-opacity"
            style={{ fontFamily: 'Literata, Georgia, serif' }}
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span className="hidden md:inline">Library</span>
          </Link>
          <div className="hidden md:block w-px h-5" style={{ background: 'var(--color-border)' }} />
          <span className="hidden md:block text-[13px] truncate max-w-[300px]"
            style={{ fontFamily: 'Literata, Georgia, serif', color: 'var(--color-text-muted)' }}>
            {material.title}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/materials/${params.id}`}
            className="hidden md:flex items-center gap-1.5 text-[13px] font-semibold transition-colors px-3 py-1.5 rounded-lg"
            style={{ fontFamily: 'Literata, Georgia, serif', color: 'var(--color-text-muted)' }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.background = 'var(--color-hover-bg)' }}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = '' }}
          >
            <span className="material-symbols-outlined text-[16px]">edit_note</span>
            Edit
          </a>
        </div>
      </header>

      <DualPaneLayout material={material as Material} />
    </div>
  )
}
