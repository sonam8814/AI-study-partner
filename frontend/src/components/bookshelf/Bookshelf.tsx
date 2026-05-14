'use client'
import { useMemo } from 'react'
import type { BookshelfStats } from '@/types/bookshelf'

interface BookshelfProps {
  stats: BookshelfStats
}

const BOOK_COLORS = [
  '#2E4A3E', '#5C3D1E', '#1A3A2A', '#6B4226', '#3B5249',
  '#4A2C17', '#2C5545', '#7A4B2A', '#1F4A3D', '#8B5E3C',
  '#33634E', '#5A3318', '#264D3B', '#6E4422', '#3E6B56',
]

const BOOK_HEIGHTS = [62, 68, 58, 72, 64, 70, 60, 66, 74, 63, 69, 57, 71, 65, 67]

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export default function Bookshelf({ stats }: BookshelfProps) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const totalDays = getDaysInMonth(year, month)
  const today = now.getDate()

  const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(now)

  const studiedDaysSet = useMemo(() => {
    const set = new Set<number>()
    for (const dateStr of stats.monthly_study_dates ?? []) {
      const d = new Date(dateStr + 'T00:00:00')
      if (d.getFullYear() === year && d.getMonth() === month) {
        set.add(d.getDate())
      }
    }
    return set
  }, [stats.monthly_study_dates, year, month])

  const studiedCount = studiedDaysSet.size

  // Calculate SVG dimensions
  const bookWidth = 13
  const bookGap = 2
  const totalBookSlotWidth = bookWidth + bookGap
  const shelfPadding = 16
  const svgWidth = shelfPadding * 2 + totalDays * totalBookSlotWidth
  const svgHeight = 110

  return (
    <section className="mb-10 rounded-xl overflow-hidden" style={{
      background: 'linear-gradient(180deg, #F9F3E3 0%, #F0E8D4 100%)',
      border: '1px solid #C8B88A',
      boxShadow: '0 4px 24px rgba(92, 61, 30, 0.08), 0 1px 4px rgba(92, 61, 30, 0.04)',
    }}>
      {/* Header */}
      <div className="px-6 pt-5 pb-4 flex justify-between items-center">
        <div>
          <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            className="text-[18px] text-[#1A1A1A] font-semibold tracking-tight">
            Your Library Shelf
          </h3>
          <p className="text-[12px] text-[#7A7067] mt-0.5" style={{ fontFamily: 'Literata, Georgia, serif' }}>
            {monthLabel} &mdash; {studiedCount} of {totalDays} days
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#1F4A3D] text-white px-4 py-2 rounded-lg" style={{
          boxShadow: '0 2px 8px rgba(31, 74, 61, 0.3)',
        }}>
          <span className="text-[18px]">&#128293;</span>
          <span style={{ fontFamily: 'Playfair Display, Georgia, serif' }} className="font-bold text-[16px]">
            {stats.current_streak}
          </span>
          <span className="text-[11px] opacity-80 uppercase tracking-wider">day streak</span>
        </div>
      </div>

      {/* The Shelf Visual */}
      <div className="px-4 pb-2 overflow-x-auto hide-scrollbar">
        <svg
          className="w-full"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          xmlns="http://www.w3.org/2000/svg"
          style={{ minWidth: `${Math.max(svgWidth, 500)}px` }}
        >
          <defs>
            <linearGradient id="shelfWood" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A0744E" />
              <stop offset="40%" stopColor="#8B6340" />
              <stop offset="100%" stopColor="#5C3D1E" />
            </linearGradient>
            <linearGradient id="shelfFront" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#C8A472" />
              <stop offset="100%" stopColor="#8B6340" />
            </linearGradient>
            <filter id="bookShadow" x="-20%" y="-10%" width="140%" height="130%">
              <feDropShadow dx="1" dy="1" stdDeviation="1" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Shelf plank - top surface */}
          <rect x="0" y="88" width={svgWidth} height="6" fill="url(#shelfWood)" rx="1" />
          {/* Shelf front edge */}
          <rect x="0" y="94" width={svgWidth} height="10" fill="url(#shelfFront)" rx="1" />
          {/* Shelf shadow */}
          <rect x="2" y="104" width={svgWidth - 4} height="3" fill="#5C3D1E" opacity="0.1" rx="1" />

          {/* Book slots */}
          {Array.from({ length: totalDays }).map((_, i) => {
            const day = i + 1
            const studied = studiedDaysSet.has(day)
            const isFuture = day > today
            const isToday = day === today
            const x = shelfPadding + i * totalBookSlotWidth
            const h = BOOK_HEIGHTS[i % BOOK_HEIGHTS.length]
            const y = 88 - h
            const color = BOOK_COLORS[i % BOOK_COLORS.length]

            if (studied) {
              // Filled book
              return (
                <g key={day} filter="url(#bookShadow)">
                  {/* Book body */}
                  <rect x={x} y={y} width={bookWidth} height={h} rx="1.5" fill={color}
                    style={isToday ? { filter: 'brightness(1.15)' } : {}} />
                  {/* Spine highlight */}
                  <rect x={x} y={y} width={2} height={h} rx="0.5" fill="rgba(255,255,255,0.12)" />
                  {/* Gold title plate */}
                  <rect x={x + 2.5} y={y + 6} width={8} height={10} rx="0.5" fill="#C8A472" opacity="0.9" />
                  <text x={x + bookWidth / 2} y={y + 14} textAnchor="middle"
                    fontSize="6" fontWeight="bold" fill={color}>{day}</text>
                  {/* Bottom detail line */}
                  <rect x={x + 2} y={y + h - 4} width={9} height="0.5" fill="rgba(200,164,114,0.4)" />
                  {/* Today indicator */}
                  {isToday && (
                    <circle cx={x + bookWidth / 2} cy={y - 5} r="2.5" fill="#C8A472" stroke="#8B6340" strokeWidth="0.5" />
                  )}
                </g>
              )
            }

            if (isFuture) {
              // Future day - very faint outline
              return (
                <g key={day} opacity="0.25">
                  <rect x={x} y={y} width={bookWidth} height={h} rx="1.5"
                    fill="none" stroke="#C8B88A" strokeWidth="0.75" strokeDasharray="3,2" />
                </g>
              )
            }

            // Missed day - empty slot with subtle indication
            return (
              <g key={day} opacity="0.45">
                <rect x={x} y={y} width={bookWidth} height={h} rx="1.5"
                  fill="none" stroke="#C8B88A" strokeWidth="1" />
                <text x={x + bookWidth / 2} y={y + h / 2 + 2} textAnchor="middle"
                  fontSize="5" fill="#C8B88A">{day}</text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend + Stats footer */}
      <div className="px-6 pb-5 pt-3 border-t border-[#D4C9A8]">
        {/* Legend */}
        <div className="flex items-center gap-5 mb-4 text-[11px]" style={{ fontFamily: 'Literata, Georgia, serif', color: '#7A7067' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-4 rounded-[1px] bg-[#2E4A3E]" />
            <span>Studied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-4 rounded-[1px] border border-[#C8B88A]" />
            <span>Missed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-4 rounded-[1px] border border-[#C8B88A] opacity-40 border-dashed" />
            <span>Upcoming</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-8">
          <div>
            <p className="text-[11px] text-[#7A7067] mb-0.5" style={{ fontFamily: 'Literata, Georgia, serif' }}>Longest streak</p>
            <p style={{ fontFamily: 'Playfair Display, Georgia, serif' }} className="text-[16px] text-[#1F4A3D] font-bold">
              {stats.longest_streak} days
            </p>
          </div>
          <div>
            <p className="text-[11px] text-[#7A7067] mb-0.5" style={{ fontFamily: 'Literata, Georgia, serif' }}>Total study days</p>
            <p style={{ fontFamily: 'Playfair Display, Georgia, serif' }} className="text-[16px] text-[#1F4A3D] font-bold">
              {stats.total_study_days}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-[#7A7067] mb-0.5" style={{ fontFamily: 'Literata, Georgia, serif' }}>Study minutes</p>
            <p style={{ fontFamily: 'Playfair Display, Georgia, serif' }} className="text-[16px] text-[#1F4A3D] font-bold">
              {stats.total_minutes_studied}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
