'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import TagInput from '@/components/library/TagInput'
import Spinner from '@/components/ui/Spinner'
import { api } from '@/lib/api'
import type { Material } from '@/types/material'
import { toast } from 'react-hot-toast'

const MarkdownEditor = dynamic(() => import('@/components/library/MarkdownEditor'), { ssr: false })

export default function NewMaterialPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function handleSave() {
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }
    setSaving(true)
    try {
      const material = await api<Material>('/materials', {
        method: 'POST',
        body: JSON.stringify({ title: title.trim(), markdown_content: content, tags }),
      })
      toast.success('Material saved')
      router.push(`/materials/${material.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col w-full max-w-content mx-auto px-4 md:px-[40px] py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => router.back()}
            className="text-primary hover:bg-surface-container p-1 rounded transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title your manuscript..."
            maxLength={200}
            className="bg-transparent border-none p-0 focus:ring-0 font-headline-md text-headline-md font-bold text-primary w-full outline-none border-b border-on-surface focus:border-secondary transition-colors pb-1"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-label-sm text-label-sm rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
        >
          {saving ? <Spinner className="w-4 h-4" /> : null}
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {/* Tags */}
      <div className="mb-6">
        <label className="font-label-sm text-label-sm text-on-surface-variant mb-2 block">Tags</label>
        <TagInput tags={tags} onChange={setTags} />
      </div>

      {/* Editor toolbar */}
      <div className="flex items-center justify-between border border-aged-paper bg-surface-container-low rounded-t-lg p-2">
        <div className="flex items-center gap-1">
          <span className="px-4 py-1.5 font-label-sm text-label-sm bg-surface-container-high border-b-2 border-secondary text-primary">Write</span>
        </div>
        <span className="hidden sm:block font-label-sm text-label-sm text-on-surface-variant italic">
          Markdown supported
        </span>
      </div>

      {/* Editor */}
      <div className="flex-1 border-x border-b border-aged-paper">
        <MarkdownEditor value={content} onChange={setContent} height={600} />
      </div>
    </div>
  )
}
