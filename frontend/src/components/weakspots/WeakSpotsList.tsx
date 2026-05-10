'use client'
import WeakSpotItem from './WeakSpotItem'
import type { WeakSpot } from '@/types/garden'

interface WeakSpotsListProps {
  spots: WeakSpot[]
  onResolve: (id: string) => void
}

export default function WeakSpotsList({ spots, onResolve }: WeakSpotsListProps) {
  if (spots.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-primary text-[48px] mb-3 block opacity-40">verified</span>
        <p className="font-body-md text-on-surface-variant italic">No weak spots — you&apos;re on top of it!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {spots.map((spot) => (
        <WeakSpotItem key={spot.id} spot={spot} onResolve={onResolve} />
      ))}
    </div>
  )
}
