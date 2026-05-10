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
        'border border-aged-paper rounded-xl p-6',
        elevated ? 'bg-elevated-panels' : 'bg-surface-container-low',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
