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
      <header className="sticky top-0 z-50 bg-surface border-b border-outline-variant h-16 flex items-center px-4 md:px-[40px] justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/library"
            className="flex items-center gap-2 text-primary font-label-sm hover:opacity-80 transition-opacity"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="hidden md:inline">Library</span>
          </Link>
          <span className="hidden md:block text-on-surface-variant font-label-sm truncate max-w-[300px]">
            {material.title}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/materials/${params.id}`}
            className="hidden md:flex items-center gap-1 text-on-surface-variant hover:text-primary font-label-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">edit_note</span>
            Edit
          </a>
        </div>
      </header>

      <DualPaneLayout material={material as Material} />
    </div>
  )
}
