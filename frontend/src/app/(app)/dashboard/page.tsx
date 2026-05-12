'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import DigitalGarden from '@/components/garden/DigitalGarden'
import WeakSpotItem from '@/components/weakspots/WeakSpotItem'
import MaterialCard from '@/components/library/MaterialCard'
import Spinner from '@/components/ui/Spinner'
import { api } from '@/lib/api'
import { createClient } from '@/lib/supabase/client'
import type { GardenStats, WeakSpot } from '@/types/garden'
import type { Material } from '@/types/material'
import type { PaginatedResponse } from '@/types/api'
import { toast } from 'react-hot-toast'

export default function DashboardPage() {
  const [gardenStats, setGardenStats] = useState<GardenStats | null>(null)
  const [weakSpots, setWeakSpots] = useState<WeakSpot[]>([])
  const [recentMaterials, setRecentMaterials] = useState<Material[]>([])
  const [displayName, setDisplayName] = useState('Scholar')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const meta = user.user_metadata
      setDisplayName(meta?.display_name || user.email?.split('@')[0] || 'Scholar')
    }

    try {
      const [garden, spots, materials] = await Promise.allSettled([
        api<GardenStats>('/garden'),
        api<PaginatedResponse<WeakSpot>>('/weakspots?resolved=false&limit=5'),
        api<PaginatedResponse<Material>>('/materials?limit=4'),
      ])

      if (garden.status === 'fulfilled') setGardenStats(garden.value)
      if (spots.status === 'fulfilled') setWeakSpots(spots.value.items)
      if (materials.status === 'fulfilled') setRecentMaterials(materials.value.items)
    } catch {
      // Partial failures are okay
    } finally {
      setLoading(false)
    }
  }

  async function handleResolveSpot(id: string) {
    try {
      await api(`/weakspots/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ resolved: true }),
      })
      setWeakSpots((prev) => prev.filter((s) => s.id !== id))
      toast.success('Weak spot resolved!')
    } catch {
      toast.error('Failed to resolve')
    }
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  }).format(new Date())

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="px-4 md:px-[40px] py-8 max-w-content mx-auto">
      {/* Header */}
      <section className="mb-8">
        <h2 className="font-[Playfair_Display] text-[28px] text-primary leading-tight">
          {greeting()}, {displayName}
        </h2>
        <p className="font-body-md text-on-surface-variant italic">{today}</p>
      </section>

      {/* Stats row */}
      <section className="mb-10 overflow-x-auto hide-scrollbar -mx-4 px-4">
        <div className="flex space-x-4 min-w-max pb-2">
          {gardenStats && (
            <>
              <div className="bg-surface-container-low border border-aged-paper rounded-lg p-4 w-40 flex flex-col justify-between">
                <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">Day Streak</span>
                <div className="flex items-end gap-1 mt-4">
                  <span className="text-[32px] text-primary font-bold" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                    {gardenStats.current_streak}
                  </span>
                  <span className="mb-1">🔥</span>
                </div>
              </div>
              <div className="bg-surface-container-low border border-aged-paper rounded-lg p-4 w-40 flex flex-col justify-between">
                <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">Total Study</span>
                <div className="mt-4">
                  <span className="text-[32px] text-primary font-bold" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                    {gardenStats.total_minutes_studied}
                  </span>
                  <span className="font-label-sm text-on-surface-variant ml-1">min</span>
                </div>
              </div>
            </>
          )}
          <div className="bg-surface-container-low border border-aged-paper rounded-lg p-4 w-40 flex flex-col justify-between">
            <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">Weak Spots</span>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-[32px] font-bold" style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                color: weakSpots.length > 0 ? '#ba1a1a' : '#033327',
              }}>
                {weakSpots.length}
              </span>
              {weakSpots.length > 0 && (
                <span className="material-symbols-outlined text-error text-[20px]">warning</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Digital Garden */}
      {gardenStats && <DigitalGarden stats={gardenStats} />}

      {/* Weak Spots + Recent Materials */}
      <section className="space-y-6">
        {/* Weak Spots */}
        {weakSpots.length > 0 && (
          <div className="bg-surface-container-low border border-aged-paper rounded-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-headline-md text-primary">Focus Required</h4>
              <Link
                href="/weakspots"
                className="font-label-sm text-secondary hover:underline flex items-center gap-1"
              >
                <span className="bg-error text-on-error px-2 py-1 rounded font-label-sm text-[11px]">
                  {weakSpots.length} Issues
                </span>
              </Link>
            </div>
            <div className="space-y-3">
              {weakSpots.slice(0, 5).map((spot) => (
                <div key={spot.id} className="flex items-center justify-between border-b border-aged-paper pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-error" />
                    <span className="font-body-md">{spot.topic}</span>
                    <span className="font-label-sm text-[11px] text-error">×{spot.miss_count}</span>
                  </div>
                  {spot.material_id && (
                    <Link
                      href={`/materials/${spot.material_id}/study?mode=tutor&focus=${encodeURIComponent(spot.topic)}`}
                      className="text-primary font-bold font-label-sm hover:underline"
                    >
                      Practice →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Materials */}
        {recentMaterials.length > 0 && (
          <div className="bg-surface-container-low border border-aged-paper rounded-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-headline-md text-primary">Resume Reading</h4>
              <Link href="/library" className="font-label-sm text-secondary hover:underline">View all →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentMaterials.map((m) => (
                <div key={m.id} className="flex gap-4 items-center">
                  <div className="w-12 h-16 bg-surface-container-highest border border-aged-paper flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">auto_stories</span>
                  </div>
                  <div>
                    <p className="font-body-md font-bold text-on-surface line-clamp-1">{m.title}</p>
                    <p className="font-label-sm text-on-surface-variant">{m.word_count} words</p>
                    <Link
                      href={`/materials/${m.id}/study`}
                      className="font-label-sm text-primary hover:underline"
                    >
                      Study →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {recentMaterials.length === 0 && weakSpots.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-aged-paper rounded-xl">
            <span className="material-symbols-outlined text-primary text-[48px] mb-3 block opacity-40">
              local_library
            </span>
            <p className="font-body-lg text-on-surface-variant italic">
              Start by adding your first material to study.
            </p>
            <Link
              href="/library/new"
              className="mt-4 inline-block bg-primary text-on-primary px-6 py-2 rounded-lg font-label-sm hover:opacity-90"
            >
              Add Material
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
