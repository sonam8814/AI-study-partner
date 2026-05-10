'use client'
import { useEffect, useState } from 'react'
import WeakSpotItem from '@/components/weakspots/WeakSpotItem'
import Spinner from '@/components/ui/Spinner'
import { api } from '@/lib/api'
import type { WeakSpot } from '@/types/garden'
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

  const displayed = filter === 'unresolved' ? spots : [...spots, ...resolved]

  return (
    <div className="px-4 md:px-[40px] py-8 max-w-content mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <span className="material-symbols-outlined text-error">warning</span>
        <h1 className="font-headline-md text-headline-md font-bold text-primary">Weak Spots</h1>
      </div>

      {/* Filter toggle */}
      <div className="flex justify-center mb-10">
        <div className="flex border border-outline p-1 rounded-lg bg-surface-container-low">
          <button
            onClick={() => setFilter('unresolved')}
            className={`px-6 py-2 rounded-lg font-label-sm transition-colors ${
              filter === 'unresolved' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            Unresolved
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg font-label-sm transition-colors ${
              filter === 'all' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'
            }`}
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
                <span className="material-symbols-outlined text-error">warning</span>
                <h2 className="font-headline-md text-primary">Priority Focus</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {spots.map((spot) => (
                  <WeakSpotItem key={spot.id} spot={spot} onResolve={handleResolve} />
                ))}
              </div>
            </section>
          )}

          {spots.length === 0 && (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-primary text-[48px] mb-3 block opacity-40">verified</span>
              <p className="font-body-md text-on-surface-variant italic">
                No unresolved weak spots — excellent work!
              </p>
            </div>
          )}

          {/* Resolved section */}
          {filter === 'all' && resolved.length > 0 && (
            <section className="mt-16 pt-8 border-t border-outline-variant opacity-60">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-outline">task_alt</span>
                <h2 className="font-headline-md text-on-surface-variant">Recently Resolved</h2>
              </div>
              <div className="space-y-4">
                {resolved.slice(0, 5).map((spot) => (
                  <div key={spot.id} className="border border-aged-paper bg-surface-dim p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                        verified
                      </span>
                      <div>
                        <h3 className="font-body-md font-bold text-on-surface-variant">{spot.topic}</h3>
                        <p className="text-label-sm text-outline">Resolved</p>
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
