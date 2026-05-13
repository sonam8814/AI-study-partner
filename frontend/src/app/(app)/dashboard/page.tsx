'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import DigitalGarden from '@/components/garden/DigitalGarden'
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
    <div className="px-4 md:px-[40px] py-8 max-w-content mx-auto animate-fade-in-up">
      {/* Header */}
      <section className="mb-8">
        <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
          className="text-[28px] text-primary leading-tight font-bold">
          {greeting()}, {displayName}
        </h2>
        <p className="font-body-md text-[#7A7067] italic mt-1">{today}</p>
      </section>

      {/* Stats row */}
      <section className="mb-10 overflow-x-auto hide-scrollbar -mx-4 px-4">
        <div className="flex space-x-4 min-w-max pb-2">
          {gardenStats && (
            <>
              <div className="stat-card rounded-xl p-5 w-44 flex flex-col justify-between"
                style={{
                  background: 'linear-gradient(135deg, #033327 0%, #1F4A3D 100%)',
                  boxShadow: '0 4px 16px rgba(3, 51, 39, 0.2)',
                }}>
                <span className="text-[11px] text-[#8CB9A8] uppercase tracking-[0.12em] font-semibold"
                  style={{ fontFamily: 'Literata, Georgia, serif' }}>
                  Day Streak
                </span>
                <div className="flex items-end gap-1.5 mt-4">
                  <span className="text-[36px] text-white font-bold leading-none"
                    style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                    {gardenStats.current_streak}
                  </span>
                  <span className="text-[20px] mb-1">&#128293;</span>
                </div>
              </div>
              <div className="stat-card rounded-xl p-5 w-44 flex flex-col justify-between"
                style={{
                  background: 'linear-gradient(135deg, #F9F3E3 0%, #F0E8D4 100%)',
                  border: '1px solid #D4C9A8',
                  boxShadow: '0 2px 12px rgba(92, 61, 30, 0.06)',
                }}>
                <span className="text-[11px] text-[#7A7067] uppercase tracking-[0.12em] font-semibold"
                  style={{ fontFamily: 'Literata, Georgia, serif' }}>
                  Total Study
                </span>
                <div className="mt-4">
                  <span className="text-[36px] text-primary font-bold leading-none"
                    style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                    {gardenStats.total_minutes_studied}
                  </span>
                  <span className="text-[12px] text-[#7A7067] ml-1.5 font-semibold">min</span>
                </div>
              </div>
            </>
          )}
          <div className="stat-card rounded-xl p-5 w-44 flex flex-col justify-between"
            style={{
              background: weakSpots.length > 0
                ? 'linear-gradient(135deg, #FFF5F5 0%, #FFE8E8 100%)'
                : 'linear-gradient(135deg, #F9F3E3 0%, #F0E8D4 100%)',
              border: `1px solid ${weakSpots.length > 0 ? '#FFCDD2' : '#D4C9A8'}`,
              boxShadow: '0 2px 12px rgba(92, 61, 30, 0.06)',
            }}>
            <span className="text-[11px] uppercase tracking-[0.12em] font-semibold"
              style={{
                fontFamily: 'Literata, Georgia, serif',
                color: weakSpots.length > 0 ? '#C62828' : '#7A7067',
              }}>
              Weak Spots
            </span>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-[36px] font-bold leading-none" style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                color: weakSpots.length > 0 ? '#C62828' : '#033327',
              }}>
                {weakSpots.length}
              </span>
              {weakSpots.length > 0 && (
                <span className="material-symbols-outlined text-[#C62828] text-[20px]">warning</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Digital Garden / Bookshelf */}
      {gardenStats && <DigitalGarden stats={gardenStats} />}

      {/* Weak Spots + Recent Materials */}
      <section className="space-y-6">
        {/* Weak Spots */}
        {weakSpots.length > 0 && (
          <div className="rounded-xl p-5" style={{
            background: 'linear-gradient(180deg, #FFFBF5 0%, #FFF8EE 100%)',
            border: '1px solid #E8D5B0',
            boxShadow: '0 2px 12px rgba(92, 61, 30, 0.05)',
          }}>
            <div className="flex justify-between items-center mb-5">
              <h4 style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                className="text-[20px] text-primary font-semibold">Focus Required</h4>
              <Link
                href="/weakspots"
                className="flex items-center gap-1.5 text-[12px] font-semibold text-white bg-[#C62828] px-3 py-1.5 rounded-full hover:bg-[#B71C1C] transition-colors"
                style={{ fontFamily: 'Literata, Georgia, serif' }}
              >
                {weakSpots.length} Issues
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
            <div className="space-y-3">
              {weakSpots.slice(0, 5).map((spot) => (
                <div key={spot.id} className="flex items-center justify-between py-3 border-b border-[#E8D5B0] last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#C62828] shadow-sm" />
                    <span className="font-body-md text-on-surface font-medium">{spot.topic}</span>
                    <span className="text-[11px] text-[#C62828] font-bold bg-[#FFEBEE] px-2 py-0.5 rounded-full">
                      x{spot.miss_count}
                    </span>
                  </div>
                  {spot.material_id && (
                    <Link
                      href={`/materials/${spot.material_id}/study?mode=tutor&focus=${encodeURIComponent(spot.topic)}`}
                      className="text-primary font-bold text-[13px] hover:underline flex items-center gap-1"
                      style={{ fontFamily: 'Literata, Georgia, serif' }}
                    >
                      Practice
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Materials */}
        {recentMaterials.length > 0 && (
          <div className="rounded-xl p-5" style={{
            background: 'linear-gradient(180deg, #F9F5EC 0%, #F3EDE0 100%)',
            border: '1px solid #D4C9A8',
            boxShadow: '0 2px 12px rgba(92, 61, 30, 0.05)',
          }}>
            <div className="flex justify-between items-center mb-5">
              <h4 style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                className="text-[20px] text-primary font-semibold">Resume Reading</h4>
              <Link href="/library"
                className="text-[13px] text-secondary font-semibold hover:underline flex items-center gap-1"
                style={{ fontFamily: 'Literata, Georgia, serif' }}>
                View all
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentMaterials.map((m) => (
                <Link key={m.id} href={`/materials/${m.id}/study`}
                  className="flex gap-4 items-center p-3 rounded-lg hover:bg-[#EDE7D9] transition-all duration-200 group">
                  <div className="w-12 h-16 rounded flex items-center justify-center shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #1F4A3D 0%, #033327 100%)',
                      boxShadow: '2px 2px 6px rgba(3, 51, 39, 0.15)',
                    }}>
                    <span className="material-symbols-outlined text-[#8CB9A8] text-[20px]">auto_stories</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body-md font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                      {m.title}
                    </p>
                    <p className="text-[12px] text-[#7A7067]" style={{ fontFamily: 'Literata, Georgia, serif' }}>
                      {m.word_count} words
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[#D4C9A8] group-hover:text-primary group-hover:translate-x-1 transition-all text-[18px]">
                    arrow_forward
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {recentMaterials.length === 0 && weakSpots.length === 0 && (
          <div className="text-center py-16 rounded-xl" style={{
            border: '2px dashed #D4C9A8',
            background: 'linear-gradient(180deg, #FDFBF7 0%, #F9F5EC 100%)',
          }}>
            <span className="material-symbols-outlined text-primary text-[56px] mb-4 block opacity-30">
              local_library
            </span>
            <p className="font-body-lg text-[#7A7067] italic mb-6 max-w-sm mx-auto">
              Your library awaits its first manuscript. Begin your scholarly journey.
            </p>
            <Link
              href="/library/new"
              className="inline-flex items-center gap-2 text-white px-8 py-3 rounded-lg font-label-sm transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #033327 0%, #1F4A3D 100%)',
                boxShadow: '0 4px 12px rgba(3, 51, 39, 0.2)',
              }}
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Material
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
