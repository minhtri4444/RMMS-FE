import React from 'react'
import { cn } from '../../utils/cn'

export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden transition-all',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={cn('px-4 py-3 border-b border-slate-100 flex items-center justify-between', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3 className={cn('text-sm font-semibold text-slate-800 tracking-tight', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn('p-4', className)} {...props}>
      {children}
    </div>
  )
}
