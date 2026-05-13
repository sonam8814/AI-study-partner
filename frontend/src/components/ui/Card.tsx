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
          ? 'linear-gradient(180deg, #F9F3E3 0%, #F0E8D4 100%)'
          : 'linear-gradient(180deg, #FDFBF7 0%, #F9F5EC 100%)',
        border: '1px solid #D4C9A8',
        boxShadow: elevated
          ? '0 4px 16px rgba(92, 61, 30, 0.06)'
          : '0 1px 4px rgba(92, 61, 30, 0.04)',
      }}
      {...props}
    >
      {children}
    </div>
  )
}
