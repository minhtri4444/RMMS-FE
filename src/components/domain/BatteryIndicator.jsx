import React from 'react'
import { Battery, BatteryCharging, BatteryLow, BatteryWarning } from 'lucide-react'
import { cn } from '../../utils/cn'

export function BatteryIndicator({ battery = 100, isCharging = false, className }) {
  let colorClass = 'text-emerald-600'
  let Icon = Battery

  if (isCharging) {
    Icon = BatteryCharging
    colorClass = 'text-blue-600'
  } else if (battery <= 20) {
    Icon = BatteryLow
    colorClass = 'text-red-600'
  } else if (battery <= 50) {
    Icon = BatteryWarning
    colorClass = 'text-amber-600'
  }

  return (
    <div className={cn('inline-flex items-center gap-1.5 tabular-nums text-xs font-medium', className)}>
      <Icon className={cn('w-4 h-4 shrink-0', colorClass)} />
      <span className={cn('text-slate-700', battery <= 20 && 'text-red-700 font-bold')}>
        {battery}%
      </span>
    </div>
  )
}
