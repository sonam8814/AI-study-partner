'use client'
import type { GardenStats } from '@/types/garden'

interface DigitalGardenProps {
  stats: GardenStats
}

// Colors for book spines
const BOOK_COLORS = [
  '#3c6658', '#244e41', '#3c6658', '#44433e', '#2e2d29',
  '#44433e', '#2e2d29', '#1f4a3d', '#033327',
]

export default function DigitalGarden({ stats }: DigitalGardenProps) {
  const booksOwned = stats.plants_grown_total + 1 // current + harvested
  const ghostCount = Math.max(0, 21 - booksOwned)

  return (
    <section className="mb-10 bg-[#F5EFE0] border border-[#D4C9A8] rounded-[8px] p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-[Playfair_Display] text-[18px] text-[#1A1A1A] font-semibold">Your Library Shelf</h3>
        <span className="font-bold text-[22px] text-[#1F4A3D]">🔥 Day {stats.current_streak}</span>
      </div>

      {/* The Shelf Visual */}
      <div className="relative w-full h-40 flex items-end justify-center px-2 mb-6">
        <svg className="w-full h-full" viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="shelfGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#8B6340', stopOpacity: 1 }} />
              <stop offset="30%" style={{ stopColor: '#A0744E', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#5C3D1E', stopOpacity: 1 }} />
            </linearGradient>
          </defs>

          {/* Oak Plank */}
          <rect fill="url(#shelfGradient)" height="15" rx="2" width="400" x="0" y="100" />

          {/* Bookends */}
          <path d="M20 100 L20 60 L15 60" fill="none" stroke="#7A7A7A" strokeWidth="3" />
          <path d="M380 100 L380 60 L385 60" fill="none" stroke="#7A7A7A" strokeWidth="3" />

          {/* Filled books */}
          {Array.from({ length: Math.min(booksOwned, 21) }).map((_, i) => {
            const x = 25 + i * 17
            const color = BOOK_COLORS[i % BOOK_COLORS.length]
            const heights = [80, 85, 75, 90, 80, 85, 80, 82, 88]
            const h = heights[i % heights.length]
            const y = 100 - h
            const isActive = i === booksOwned - 1

            return (
              <g key={i} transform={`translate(${x}, ${y})`}
                style={isActive ? { filter: 'drop-shadow(0 0 4px rgba(184,134,11,0.6))' } : {}}>
                <rect fill={color} height={h} rx="1" width="15" />
                <rect fill="#B8860B" height="10" rx="0.5" width="9" x="3" y="8" />
                <text fill={color} fontSize="7" fontWeight="bold" textAnchor="middle" x="7.5" y="16">
                  {String.fromCharCode(65 + (i % 26))}
                </text>
              </g>
            )
          })}

          {/* Ghost books */}
          {Array.from({ length: Math.min(ghostCount, 21 - booksOwned) }).map((_, i) => {
            const x = 25 + (booksOwned + i) * 17
            const heights = [80, 85, 75, 90, 80, 85, 80]
            const h = heights[i % heights.length]
            const y = 100 - h
            if (x > 365) return null
            return (
              <rect
                key={`ghost-${i}`}
                fill="none"
                height={h}
                rx="1"
                stroke="#D4C9A8"
                strokeDasharray="4,2"
                strokeWidth="1"
                width="15"
                x={x}
                y={y}
              />
            )
          })}
        </svg>
      </div>

      {/* Stats footer */}
      <div className="border-t border-[#D4C9A8] pt-4">
        <div className="flex justify-between items-end">
          <div className="flex gap-8">
            <div>
              <p className="font-[Literata] text-[12px] text-on-surface-variant mb-1">Longest streak</p>
              <p className="font-[Playfair_Display] text-[16px] text-[#1F4A3D] font-bold">
                {stats.longest_streak} days
              </p>
            </div>
            <div>
              <p className="font-[Literata] text-[12px] text-on-surface-variant mb-1">Books collected</p>
              <p className="font-[Playfair_Display] text-[16px] text-[#1F4A3D] font-bold">
                {stats.plants_grown_total}
              </p>
            </div>
            <div>
              <p className="font-[Literata] text-[12px] text-on-surface-variant mb-1">Study minutes</p>
              <p className="font-[Playfair_Display] text-[16px] text-[#1F4A3D] font-bold">
                {stats.total_minutes_studied}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
