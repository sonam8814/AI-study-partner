'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import MaterialCard from '@/components/library/MaterialCard'
import Spinner from '@/components/ui/Spinner'
import { api } from '@/lib/api'
import type { Material } from '@/types/material'
import type { PaginatedResponse } from '@/types/api'
import { toast } from 'react-hot-toast'

export default function LibraryPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const allTags = Array.from(new Set(materials.flatMap((m) => m.tags)))

  useEffect(() => {
    loadMaterials()
  }, [])

  async function loadMaterials() {
    setLoading(true)
    try {
      const data = await api<PaginatedResponse<Material>>('/materials')
      setMaterials(data.items)
    } catch {
      toast.error('Failed to load library')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this material? This cannot be undone.')) return
    try {
      await api(`/materials/${id}`, { method: 'DELETE' })
      setMaterials((prev) => prev.filter((m) => m.id !== id))
      toast.success('Material deleted')
    } catch {
      toast.error('Failed to delete material')
    }
  }

  const filtered = materials.filter((m) => {
    const matchSearch = !search || m.title.toLowerCase().includes(search.toLowerCase())
    const matchTag = !selectedTag || m.tags.includes(selectedTag)
    return matchSearch && matchTag
  })

  return (
    <div className="flex-1 px-4 md:px-[40px] py-8 max-w-content mx-auto mb-20 md:mb-0 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="text-[36px] text-on-surface font-bold"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            My Library
          </h2>
          <p className="font-body-md mt-1 italic"
            style={{ fontFamily: 'Literata, Georgia, serif', color: 'var(--color-text-muted)' }}>
            A personal archive of your gathered knowledge and manuscripts.
          </p>
        </div>
        <Link
          href="/library/new"
          className="flex items-center gap-2 text-white px-6 py-3 rounded-lg font-label-sm transition-all hover:opacity-90 self-start"
          style={{
            background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)`,
            boxShadow: 'var(--shadow-primary)',
          }}
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Material
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-8 group">
        <span className="material-symbols-outlined absolute left-0 bottom-3" style={{ color: 'var(--color-text-faint)' }}>search</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your materials..."
          className="w-full bg-transparent border-t-0 border-x-0 py-3 pl-8 focus:ring-0 transition-colors font-body-lg outline-none"
          style={{
            borderBottom: '1px solid var(--color-border)',
            color: 'var(--color-on-surface)',
          }}
          onFocus={(e) => e.currentTarget.style.borderBottomColor = 'var(--color-secondary)'}
          onBlur={(e) => e.currentTarget.style.borderBottomColor = 'var(--color-border)'}
        />
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-4 hide-scrollbar mb-10 whitespace-nowrap">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-5 py-2 rounded-full text-[13px] font-semibold transition-all duration-200 ${
              !selectedTag
                ? 'bg-primary text-white shadow-sm'
                : ''
            }`}
            style={{
              fontFamily: 'Literata, Georgia, serif',
              ...(!selectedTag ? {} : { border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }),
            }}
            onMouseEnter={(e) => { if (selectedTag) { e.currentTarget.style.background = 'var(--color-hover-bg)'; e.currentTarget.style.color = 'var(--color-primary)' } }}
            onMouseLeave={(e) => { if (selectedTag) { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--color-text-muted)' } }}
          >
            All Volumes
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-5 py-2 rounded-full text-[13px] font-semibold transition-all duration-200 ${
                selectedTag === tag
                  ? 'bg-primary text-white shadow-sm'
                  : ''
              }`}
              style={{
                fontFamily: 'Literata, Georgia, serif',
                ...(selectedTag !== tag ? { border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' } : {}),
              }}
              onMouseEnter={(e) => { if (selectedTag !== tag) { e.currentTarget.style.background = 'var(--color-hover-bg)'; e.currentTarget.style.color = 'var(--color-primary)' } }}
              onMouseLeave={(e) => { if (selectedTag !== tag) { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--color-text-muted)' } }}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((m) => (
            <MaterialCard key={m.id} material={m} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="mt-12 flex flex-col items-center text-center px-6 py-20 rounded-xl"
          style={{
            border: '2px dashed var(--color-border)',
            background: `linear-gradient(180deg, var(--color-surface-elevated) 0%, var(--color-surface-elevated-end) 100%)`,
          }}>
          <div className="mb-6 opacity-40">
            <span className="material-symbols-outlined text-primary text-[72px]">auto_stories</span>
          </div>
          <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            className="text-[22px] text-on-surface mb-2 font-semibold">Your library is empty</h3>
          <p className="max-w-sm mb-8 italic" style={{ fontFamily: 'Literata, Georgia, serif', color: 'var(--color-text-muted)' }}>
            Begin your scholarly journey by adding your first manuscript or lecture notes.
          </p>
          <Link
            href="/library/new"
            className="border-2 border-primary text-primary px-8 py-3 rounded-lg font-label-sm hover:bg-primary hover:text-white transition-all duration-200"
          >
            Add First Material
          </Link>
        </div>
      )}
    </div>
  )
}
