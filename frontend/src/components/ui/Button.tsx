'use client'
import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-label-sm text-label-sm rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-primary text-on-primary hover:opacity-90 active:scale-[0.98]': variant === 'primary',
          'bg-secondary-fixed text-on-secondary-fixed hover:brightness-110': variant === 'secondary',
          'border border-primary text-primary hover:bg-primary-fixed/20': variant === 'outline',
          'text-primary hover:bg-surface-container': variant === 'ghost',
        },
        {
          'px-3 py-1.5 text-body-sm': size === 'sm',
          'px-6 py-3': size === 'md',
          'px-10 py-4 text-body-md': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
