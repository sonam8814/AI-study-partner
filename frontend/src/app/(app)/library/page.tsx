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
    <div className="flex-1 px-4 md:px-[40px] py-8 max-w-content mx-auto mb-20 md:mb-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="font-display-lg text-[36px] text-on-surface" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            My Library
          </h2>
          <p className="text-on-surface-variant font-body-md mt-2">
            A personal archive of your gathered knowledge and manuscripts.
          </p>
        </div>
        <Link
          href="/library/new"
          className="bg-primary text-on-primary px-6 py-3 rounded-lg flex items-center gap-2 font-label-sm hover:opacity-90 transition-opacity self-start"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Material
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-8 group">
        <span className="material-symbols-outlined absolute left-0 bottom-3 text-outline">search</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your materials..."
          className="w-full bg-transparent border-t-0 border-x-0 border-b border-on-surface py-3 pl-8 focus:ring-0 focus:border-secondary transition-colors font-body-lg placeholder:text-outline-variant outline-none"
        />
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-4 hide-scrollbar mb-10 whitespace-nowrap">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-4 py-1.5 rounded-full font-label-sm transition-colors ${
              !selectedTag ? 'bg-primary text-on-primary' : 'border border-aged-paper text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            All Volumes
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-4 py-1.5 rounded-full font-label-sm transition-colors ${
                selectedTag === tag
                  ? 'bg-primary text-on-primary'
                  : 'border border-aged-paper text-on-surface-variant hover:bg-surface-container'
              }`}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((m) => (
            <MaterialCard key={m.id} material={m} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="mt-12 flex flex-col items-center text-center px-6 py-16 border-2 border-dashed border-aged-paper rounded-xl bg-surface-container-lowest">
          <div className="mb-6 opacity-60">
            <span className="material-symbols-outlined text-primary text-[80px]">auto_stories</span>
          </div>
          <h3 className="font-headline-md text-on-surface mb-2">Your library is empty</h3>
          <p className="text-on-surface-variant max-w-sm mb-8">
            Begin your scholarly journey by adding your first manuscript or lecture notes.
          </p>
          <Link
            href="/library/new"
            className="border border-primary text-primary px-8 py-2.5 rounded-lg font-label-sm hover:bg-primary-container hover:text-on-primary-container transition-all"
          >
            Add First Material
          </Link>
        </div>
      )}
    </div>
  )
}
