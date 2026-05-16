'use client'
import { useEffect, useState } from 'react'
import WeakSpotItem from '@/components/weakspots/WeakSpotItem'
import Spinner from '@/components/ui/Spinner'
import { api } from '@/lib/api'
import type { WeakSpot } from '@/types/bookshelf'
import type { PaginatedResponse } from '@/types/api'
import { toast } from 'react-hot-toast'

export default function WeakSpotsPage() {
  const [spots, setSpots] = useState<WeakSpot[]>([])
  const [resolved, setResolved] = useState<WeakSpot[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'unresolved' | 'all'>('unresolved')

  useEffect(() => {
    loadSpots()
  }, [])

  async function loadSpots() {
    setLoading(true)
    try {
      const [unresolved, all] = await Promise.allSettled([
        api<PaginatedResponse<WeakSpot>>('/weakspots?resolved=false&limit=50'),
        api<PaginatedResponse<WeakSpot>>('/weakspots?limit=50'),
      ])
      if (unresolved.status === 'fulfilled') setSpots(unresolved.value.items)
      if (all.status === 'fulfilled') {
        const allItems = all.value.items
        setResolved(allItems.filter((s) => s.resolved))
      }
    } catch {
      toast.error('Failed to load weak spots')
    } finally {
      setLoading(false)
    }
  }

  async function handleResolve(id: string) {
    try {
      await api(`/weakspots/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ resolved: true }),
      })
      const resolvedSpot = spots.find((s) => s.id === id)
      setSpots((prev) => prev.filter((s) => s.id !== id))
      if (resolvedSpot) setResolved((prev) => [{ ...resolvedSpot, resolved: true }, ...prev])
      toast.success('Resolved!')
    } catch {
      toast.error('Failed to resolve')
    }
  }

  return (
    <div className="px-4 md:px-[40px] py-8 max-w-content mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, var(--color-error-bg-start) 0%, var(--color-error-badge-bg) 100%)`, border: '1px solid var(--color-error-border)' }}>
          <span className="material-symbols-outlined text-[20px]" style={{ color: 'var(--color-error)' }}>warning</span>
        </div>
        <h1 className="text-[28px] font-bold text-primary"
          style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
          Weak Spots
        </h1>
      </div>
      <p className="italic mb-8" style={{ fontFamily: 'Literata, Georgia, serif', color: 'var(--color-text-muted)' }}>
        Topics that need extra attention based on your study sessions.
      </p>

      {/* Filter toggle */}
      <div className="flex justify-center mb-10">
        <div className="flex p-1 rounded-full gap-0.5" style={{
          background: 'var(--color-parchment-end)',
          border: '1px solid var(--color-border)',
        }}>
          {(['unresolved', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-full text-[13px] font-semibold transition-all duration-200 ${
                filter === f ? 'text-white shadow-sm' : ''
              }`}
              style={{
                fontFamily: 'Literata, Georgia, serif',
                ...(filter === f
                  ? { background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)`, boxShadow: 'var(--shadow-primary)', color: 'white' }
                  : { color: 'var(--color-text-muted)' }),
              }}
              onMouseEnter={(e) => { if (filter !== f) { e.currentTarget.style.background = 'var(--color-hover-bg)' } }}
              onMouseLeave={(e) => { if (filter !== f) { e.currentTarget.style.background = '' } }}
            >
              {f === 'unresolved' ? 'Unresolved' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      ) : (
        <>
          {/* Priority Focus */}
          {spots.length > 0 && (
            <section className="space-y-6 mb-12">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined" style={{ color: 'var(--color-error)' }}>priority_high</span>
                <h2 className="text-[20px] text-primary font-semibold"
                  style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                  Priority Focus
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {spots.map((spot) => (
                  <WeakSpotItem key={spot.id} spot={spot} onResolve={handleResolve} />
                ))}
              </div>
            </section>
          )}

          {spots.length === 0 && (
            <div className="text-center py-16 rounded-xl" style={{
              background: 'linear-gradient(180deg, rgba(46,125,50,0.05) 0%, rgba(46,125,50,0.02) 100%)',
              border: '1px solid rgba(46,125,50,0.2)',
            }}>
              <span className="material-symbols-outlined text-[48px] mb-3 block opacity-50"
                style={{ fontVariationSettings: "'FILL' 1", color: '#2E7D32' }}>verified</span>
              <p className="italic" style={{ fontFamily: 'Literata, Georgia, serif', color: 'var(--color-text-muted)' }}>
                No unresolved weak spots - excellent work!
              </p>
            </div>
          )}

          {/* Resolved section */}
          {filter === 'all' && resolved.length > 0 && (
            <section className="mt-16 pt-8 opacity-70" style={{ borderTop: '1px solid var(--color-border)' }}>
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined" style={{ color: 'var(--color-text-faint)' }}>task_alt</span>
                <h2 className="text-[18px] font-semibold"
                  style={{ fontFamily: 'Playfair Display, Georgia, serif', color: 'var(--color-text-muted)' }}>
                  Recently Resolved
                </h2>
              </div>
              <div className="space-y-3">
                {resolved.slice(0, 5).map((spot) => (
                  <div key={spot.id} className="p-4 rounded-xl flex items-center justify-between"
                    style={{
                      background: `linear-gradient(180deg, var(--color-surface-container) 0%, var(--color-surface-container-high) 100%)`,
                      border: '1px solid var(--color-border)',
                    }}>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-[20px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}>
                        verified
                      </span>
                      <div>
                        <h3 className="text-[14px] font-bold" style={{ color: 'var(--color-text-muted)' }}>{spot.topic}</h3>
                        <p className="text-[11px]" style={{ color: 'var(--color-text-faint)' }}>Resolved</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
