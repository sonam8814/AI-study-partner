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
      background: `linear-gradient(180deg, var(--color-surface-elevated) 0%, var(--color-surface-elevated-end) 100%)`,
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div className="flex justify-between items-start mb-4">
        {tags[0] ? (
          <span className="text-primary px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-semibold"
            style={{ fontFamily: 'Literata, Georgia, serif', background: 'var(--color-hover-bg)' }}>
            {tags[0]}
          </span>
        ) : (
          <span />
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(material.id)}
            className="material-symbols-outlined transition-colors text-[20px] p-1 rounded"
            style={{ color: 'var(--color-placeholder)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-error)'; e.currentTarget.style.background = 'var(--color-error-badge-bg)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-placeholder)'; e.currentTarget.style.background = '' }}
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

      <div className="flex items-center justify-between mt-auto pt-4" style={{ borderTop: '1px solid var(--color-weakspot-border)' }}>
        <div className="flex items-center gap-4">
          <span className="text-[12px] italic" style={{ fontFamily: 'Literata, Georgia, serif', color: 'var(--color-text-faint)' }}>
            {formatRelative(material.updated_at)}
          </span>
          {material.word_count > 0 && (
            <span className="flex items-center gap-1 text-[12px]"
              style={{ fontFamily: 'Literata, Georgia, serif', color: 'var(--color-text-faint)' }}>
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
