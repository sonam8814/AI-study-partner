'use client'
import Link from 'next/link'
import type { Material } from '@/types/material'
import { formatRelative, estimateReadTime } from '@/lib/utils'

interface MaterialCardProps {
  material: Material
  onDelete?: (id: string) => void
}

export default function MaterialCard({ material, onDelete }: MaterialCardProps) {
  const tags = material.tags ?? []

  return (
    <article className="card-hover rounded-xl p-6 group" style={{
      background: 'linear-gradient(180deg, #FDFBF7 0%, #F9F5EC 100%)',
      border: '1px solid #D4C9A8',
      boxShadow: '0 1px 4px rgba(92, 61, 30, 0.04)',
    }}>
      <div className="flex justify-between items-start mb-4">
        {tags[0] ? (
          <span className="bg-[#EDE7D9] text-primary px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-semibold"
            style={{ fontFamily: 'Literata, Georgia, serif' }}>
            {tags[0]}
          </span>
        ) : (
          <span />
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(material.id)}
            className="material-symbols-outlined text-[#C0B8A8] group-hover:text-[#C62828] transition-colors text-[20px] p-1 rounded hover:bg-[#FFEBEE]"
            aria-label="Delete material"
          >
            delete
          </button>
        )}
      </div>

      <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
        className="text-[20px] text-on-surface mb-3 leading-tight line-clamp-2 font-semibold group-hover:text-primary transition-colors">
        {material.title}
      </h3>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#E8D5B0]">
        <div className="flex items-center gap-4">
          <span className="text-[#A09888] text-[12px] italic" style={{ fontFamily: 'Literata, Georgia, serif' }}>
            {formatRelative(material.updated_at)}
          </span>
          {material.word_count > 0 && (
            <span className="flex items-center gap-1 text-[#A09888] text-[12px]"
              style={{ fontFamily: 'Literata, Georgia, serif' }}>
              <span className="material-symbols-outlined text-[13px]">schedule</span>
              {estimateReadTime(material.word_count)}
            </span>
          )}
        </div>
        <Link
          href={`/materials/${material.id}/study`}
          className="text-primary font-bold flex items-center gap-1 group/link text-[13px] hover:underline"
          style={{ fontFamily: 'Literata, Georgia, serif' }}
        >
          Study
          <span className="material-symbols-outlined text-[16px] group-hover/link:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </Link>
      </div>
    </article>
  )
}
