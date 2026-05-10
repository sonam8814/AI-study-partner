'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import TagInput from '@/components/library/TagInput'
import Spinner from '@/components/ui/Spinner'
import { api } from '@/lib/api'
import type { Material } from '@/types/material'
import { toast } from 'react-hot-toast'

const MarkdownEditor = dynamic(() => import('@/components/library/MarkdownEditor'), { ssr: false })

export default function MaterialEditorPage({ params }: { params: { id: string } }) {
  const [material, setMaterial] = useState<Material | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const router = useRouter()

  useEffect(() => {
    api<Material>(`/materials/${params.id}`)
      .then((m) => {
        setMaterial(m)
        setTitle(m.title)
        setContent(m.markdown_content)
        setTags(m.tags)
      })
      .catch(() => toast.error('Failed to load material'))
  }, [params.id])

  const handleSave = useCallback(async () => {
    if (!isDirty) return
    setSaving(true)
    try {
      const updated = await api<Material>(`/materials/${params.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: title.trim(), markdown_content: content, tags }),
      })
      setMaterial(updated)
      setIsDirty(false)
      toast.success('Saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }, [isDirty, params.id, title, content, tags])

  // Ctrl/Cmd+S to save
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSave])

  if (!material) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen w-full max-w-content mx-auto px-4 md:px-[40px] py-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-1">
          <button onClick={() => router.back()} className="text-primary hover:bg-surface-container p-1 rounded transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setIsDirty(true) }}
            className="bg-transparent border-none p-0 focus:ring-0 font-headline-md text-headline-md font-bold text-primary w-full outline-none border-b border-on-surface focus:border-secondary transition-colors pb-1"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="hidden md:flex px-4 py-2 border border-aged-paper text-secondary font-label-sm text-label-sm rounded transition-colors hover:bg-surface-container disabled:opacity-40"
          >
            {saving ? 'Saving…' : isDirty ? 'Save' : 'Saved'}
          </button>
          <Link
            href={`/materials/${params.id}/study`}
            className="flex items-center gap-2 px-4 py-2 border border-secondary text-secondary font-label-sm text-label-sm rounded transition-all hover:bg-secondary hover:text-white"
          >
            <span>Study this</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* Tags */}
      <div className="mb-4">
        <TagInput tags={tags} onChange={(t) => { setTags(t); setIsDirty(true) }} />
      </div>

      {/* Editor toolbar */}
      <div className="flex items-center justify-between border border-aged-paper bg-surface-container-low rounded-t-lg p-2">
        <div className="flex items-center gap-1">
          <span className="px-4 py-1.5 font-label-sm text-label-sm bg-surface-container-high border-b-2 border-secondary text-primary">Write</span>
        </div>
        <span className="hidden sm:block font-label-sm text-label-sm text-on-surface-variant italic">
          {saving ? 'Saving…' : isDirty ? 'Unsaved changes' : 'All changes saved'}
        </span>
      </div>

      {/* Editor */}
      <div className="flex-1 border-x border-b border-aged-paper">
        <MarkdownEditor
          value={content}
          onChange={(v) => { setContent(v); setIsDirty(true) }}
          height={600}
        />
      </div>
    </div>
  )
}
