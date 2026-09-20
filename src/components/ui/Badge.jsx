import React from 'react'
import { cn } from '../../utils/cn'

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  dotColor,
  className,
  ...props
}) {
  const variants = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    accent: 'bg-teal-50 text-teal-800 border-teal-200',
  }

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5 font-medium',
    md: 'text-xs px-2 py-0.5 font-semibold',
    lg: 'text-xs px-2.5 py-1 font-semibold',
  }

  const dotColors = {
    neutral: 'bg-slate-400',
    primary: 'bg-blue-600',
    success: 'bg-emerald-600',
    warning: 'bg-amber-600',
    danger: 'bg-rose-600',
    info: 'bg-sky-600',
    accent: 'bg-teal-600',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border tracking-wide select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            dotColor || dotColors[variant] || 'bg-current'
          )}
        />
      )}
      {children}
    </span>
  )
}
