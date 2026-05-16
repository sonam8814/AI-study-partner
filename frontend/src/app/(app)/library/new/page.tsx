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
    <div className="flex-1 flex flex-col w-full max-w-content mx-auto px-4 md:px-[40px] py-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => router.back()}
            className="text-primary p-2 rounded-lg transition-all duration-200"
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-hover-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.background = ''}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title your manuscript..."
            maxLength={200}
            className="bg-transparent border-none p-0 focus:ring-0 text-[24px] font-bold text-primary w-full outline-none pb-1"
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              borderBottom: '1px solid var(--color-border)',
            }}
            onFocus={(e) => e.currentTarget.style.borderBottomColor = 'var(--color-secondary)'}
            onBlur={(e) => e.currentTarget.style.borderBottomColor = 'var(--color-border)'}
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 text-white text-[13px] font-semibold rounded-lg transition-all disabled:opacity-50 hover:opacity-90"
          style={{
            fontFamily: 'Literata, Georgia, serif',
            background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)`,
            boxShadow: 'var(--shadow-primary)',
          }}
        >
          {saving ? <Spinner className="w-4 h-4" /> : null}
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Tags */}
      <div className="mb-6">
        <label className="text-[12px] mb-2 block font-semibold tracking-wide"
          style={{ fontFamily: 'Literata, Georgia, serif', color: 'var(--color-text-muted)' }}>
          Tags
        </label>
        <TagInput tags={tags} onChange={setTags} />
      </div>

      {/* Editor toolbar */}
      <div className="flex items-center justify-between rounded-t-xl p-3" style={{
        background: `linear-gradient(180deg, var(--color-parchment-end) 0%, var(--color-hover-bg) 100%)`,
        border: '1px solid var(--color-border)',
        borderBottom: 'none',
      }}>
        <div className="flex items-center gap-1">
          <span className="px-4 py-1.5 text-[13px] font-semibold bg-primary text-white rounded-lg"
            style={{ fontFamily: 'Literata, Georgia, serif' }}>
            Write
          </span>
        </div>
        <span className="hidden sm:block text-[12px] italic"
          style={{ fontFamily: 'Literata, Georgia, serif', color: 'var(--color-text-muted)' }}>
          Markdown supported
        </span>
      </div>

      {/* Editor */}
      <div className="flex-1" style={{ border: '1px solid var(--color-border)', borderTop: 'none' }}>
        <MarkdownEditor value={content} onChange={setContent} height={600} />
      </div>
    </div>
  )
}
