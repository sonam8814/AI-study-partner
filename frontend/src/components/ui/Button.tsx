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
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'text-white hover:opacity-90 active:scale-[0.98]': variant === 'primary',
          'bg-[#C8A472] text-[#1A1A1A] hover:brightness-110 active:scale-[0.98]': variant === 'secondary',
          'border-2 border-primary text-primary hover:bg-primary hover:text-white': variant === 'outline',
          'text-primary hover:bg-[#EDE7D9]': variant === 'ghost',
        },
        {
          'px-3 py-1.5 text-[12px]': size === 'sm',
          'px-6 py-3 text-[14px]': size === 'md',
          'px-10 py-4 text-[16px]': size === 'lg',
        },
        className
      )}
      style={{
        fontFamily: 'Literata, Georgia, serif',
        ...(variant === 'primary' ? {
          background: 'linear-gradient(135deg, #033327 0%, #1F4A3D 100%)',
          boxShadow: '0 2px 8px rgba(3, 51, 39, 0.2)',
        } : {}),
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  )
}
