import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'error' | 'success' | 'warn' | 'gold'
  className?: string
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded font-label-sm text-caption uppercase tracking-wider',
        {
          'bg-primary-container text-on-primary-container': variant === 'default',
          'bg-error text-on-error': variant === 'error',
          'bg-primary-fixed text-primary': variant === 'success',
          'bg-secondary-fixed text-on-secondary-fixed': variant === 'warn',
          'bg-secondary-fixed text-on-secondary-fixed': variant === 'gold',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
