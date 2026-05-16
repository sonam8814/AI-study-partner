import { cn } from '@/lib/utils'
import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  elevated?: boolean
}

export default function Card({ children, elevated, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl p-6',
        className
      )}
      style={{
        background: elevated
          ? `linear-gradient(180deg, var(--color-parchment-start) 0%, var(--color-parchment-end) 100%)`
          : `linear-gradient(180deg, var(--color-surface-elevated) 0%, var(--color-surface-elevated-end) 100%)`,
        border: '1px solid var(--color-border)',
        boxShadow: elevated ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      }}
      {...props}
    >
      {children}
    </div>
  )
}
