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
          style={{ background: 'linear-gradient(135deg, #FFF5F5 0%, #FFEBEE 100%)', border: '1px solid #FFCDD2' }}>
          <span className="material-symbols-outlined text-[#C62828] text-[20px]">warning</span>
        </div>
        <h1 className="text-[28px] font-bold text-primary"
          style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
          Weak Spots
        </h1>
      </div>
      <p className="text-[#7A7067] italic mb-8" style={{ fontFamily: 'Literata, Georgia, serif' }}>
        Topics that need extra attention based on your study sessions.
      </p>

      {/* Filter toggle */}
      <div className="flex justify-center mb-10">
        <div className="flex p-1 rounded-full gap-0.5" style={{
          background: '#F0E8D4',
          border: '1px solid #D4C9A8',
        }}>
          <button
            onClick={() => setFilter('unresolved')}
            className={`px-6 py-2.5 rounded-full text-[13px] font-semibold transition-all duration-200 ${
              filter === 'unresolved'
                ? 'bg-primary text-white shadow-sm'
                : 'text-[#7A7067] hover:bg-[#E8DFC8]'
            }`}
            style={{
              fontFamily: 'Literata, Georgia, serif',
              ...(filter === 'unresolved' ? { boxShadow: '0 1px 4px rgba(3,51,39,0.2)' } : {}),
            }}
          >
            Unresolved
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2.5 rounded-full text-[13px] font-semibold transition-all duration-200 ${
              filter === 'all'
                ? 'bg-primary text-white shadow-sm'
                : 'text-[#7A7067] hover:bg-[#E8DFC8]'
            }`}
            style={{
              fontFamily: 'Literata, Georgia, serif',
              ...(filter === 'all' ? { boxShadow: '0 1px 4px rgba(3,51,39,0.2)' } : {}),
            }}
          >
            All
          </button>
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
                <span className="material-symbols-outlined text-[#C62828]">priority_high</span>
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
              background: 'linear-gradient(180deg, #F5FFF5 0%, #F0F9F0 100%)',
              border: '1px solid #C8E6C9',
            }}>
              <span className="material-symbols-outlined text-[#2E7D32] text-[48px] mb-3 block opacity-50"
                style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <p className="text-[#7A7067] italic" style={{ fontFamily: 'Literata, Georgia, serif' }}>
                No unresolved weak spots - excellent work!
              </p>
            </div>
          )}

          {/* Resolved section */}
          {filter === 'all' && resolved.length > 0 && (
            <section className="mt-16 pt-8 border-t border-[#D4C9A8] opacity-70">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-[#A09888]">task_alt</span>
                <h2 className="text-[18px] text-[#7A7067] font-semibold"
                  style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                  Recently Resolved
                </h2>
              </div>
              <div className="space-y-3">
                {resolved.slice(0, 5).map((spot) => (
                  <div key={spot.id} className="p-4 rounded-xl flex items-center justify-between"
                    style={{
                      background: 'linear-gradient(180deg, #FAFAFA 0%, #F5F5F5 100%)',
                      border: '1px solid #E0E0E0',
                    }}>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-[20px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}>
                        verified
                      </span>
                      <div>
                        <h3 className="text-[14px] font-bold text-[#7A7067]">{spot.topic}</h3>
                        <p className="text-[11px] text-[#A09888]">Resolved</p>
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
