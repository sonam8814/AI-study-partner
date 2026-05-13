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
            className="text-primary hover:bg-[#EDE7D9] p-2 rounded-lg transition-all duration-200"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title your manuscript..."
            maxLength={200}
            className="bg-transparent border-none p-0 focus:ring-0 text-[24px] font-bold text-primary w-full outline-none border-b border-[#D4C9A8] focus:border-secondary transition-colors pb-1 placeholder:text-[#C0B8A8]"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 text-white text-[13px] font-semibold rounded-lg transition-all disabled:opacity-50 hover:opacity-90"
          style={{
            fontFamily: 'Literata, Georgia, serif',
            background: 'linear-gradient(135deg, #033327 0%, #1F4A3D 100%)',
            boxShadow: '0 2px 8px rgba(3, 51, 39, 0.2)',
          }}
        >
          {saving ? <Spinner className="w-4 h-4" /> : null}
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Tags */}
      <div className="mb-6">
        <label className="text-[12px] text-[#7A7067] mb-2 block font-semibold tracking-wide"
          style={{ fontFamily: 'Literata, Georgia, serif' }}>
          Tags
        </label>
        <TagInput tags={tags} onChange={setTags} />
      </div>

      {/* Editor toolbar */}
      <div className="flex items-center justify-between rounded-t-xl p-3" style={{
        background: 'linear-gradient(180deg, #F0E8D4 0%, #EDE7D9 100%)',
        border: '1px solid #D4C9A8',
        borderBottom: 'none',
      }}>
        <div className="flex items-center gap-1">
          <span className="px-4 py-1.5 text-[13px] font-semibold bg-primary text-white rounded-lg"
            style={{ fontFamily: 'Literata, Georgia, serif' }}>
            Write
          </span>
        </div>
        <span className="hidden sm:block text-[12px] text-[#7A7067] italic"
          style={{ fontFamily: 'Literata, Georgia, serif' }}>
          Markdown supported
        </span>
      </div>

      {/* Editor */}
      <div className="flex-1" style={{ border: '1px solid #D4C9A8', borderTop: 'none' }}>
        <MarkdownEditor value={content} onChange={setContent} height={600} />
      </div>
    </div>
  )
}
