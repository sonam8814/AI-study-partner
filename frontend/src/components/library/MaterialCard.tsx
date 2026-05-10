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
    <article className="bg-surface-container-low border border-aged-paper p-6 rounded-lg group hover:border-outline transition-all">
      <div className="flex justify-between items-start mb-4">
        {tags[0] ? (
          <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded font-label-sm text-[11px] uppercase tracking-wider">
            {tags[0]}
          </span>
        ) : (
          <span />
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(material.id)}
            className="material-symbols-outlined text-outline group-hover:text-error transition-colors text-[20px]"
            aria-label="Delete material"
          >
            delete
          </button>
        )}
      </div>

      <h3 className="font-headline-md text-headline-md text-on-surface mb-3 leading-tight line-clamp-2">
        {material.title}
      </h3>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-aged-paper">
        <div className="flex items-center gap-4">
          <span className="text-outline text-label-sm italic">{formatRelative(material.updated_at)}</span>
          {material.word_count > 0 && (
            <span className="flex items-center gap-1 text-outline font-label-sm">
              <span className="material-symbols-outlined text-[14px]">query_builder</span>
              {estimateReadTime(material.word_count)}
            </span>
          )}
        </div>
        <Link
          href={`/materials/${material.id}/study`}
          className="text-primary font-bold flex items-center gap-1 group/link font-label-sm"
        >
          Study
          <span className="material-symbols-outlined text-[18px] group-hover/link:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </Link>
      </div>
    </article>
  )
}
