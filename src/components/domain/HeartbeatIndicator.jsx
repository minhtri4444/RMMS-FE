import React from 'react'
import { cn } from '../../utils/cn'
import {
  HEARTBEAT_OFFLINE_THRESHOLD_MS,
  HEARTBEAT_WARN_THRESHOLD_MS,
} from '../../constants/telemetry'

export function HeartbeatIndicator({ lastHeartbeat, className }) {
  const diffMs = Math.max(0, Date.now() - (lastHeartbeat || Date.now()))
  const diffSeconds = Math.max(1, Math.floor(diffMs / 1000))

  const isOffline = diffMs >= HEARTBEAT_OFFLINE_THRESHOLD_MS
  const isStale = !isOffline && diffMs >= HEARTBEAT_WARN_THRESHOLD_MS

  let label = `${diffSeconds}s ago`

  if (isOffline) {
    label = `${diffSeconds}s (Offline)`
  } else if (isStale) {
    label = `${diffSeconds}s (Stale)`
  }

  return (
    <div className={cn('inline-flex items-center gap-1.5 text-xs text-slate-500 tabular-nums', className)}>
      <span className="relative flex h-2 w-2">
        {!isOffline && (
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              isStale ? 'bg-amber-400' : 'bg-emerald-400'
            )}
          />
        )}
        <span
          className={cn(
            'relative inline-flex rounded-full h-2 w-2',
            isOffline ? 'bg-red-500' : isStale ? 'bg-amber-500' : 'bg-emerald-500'
          )}
        />
      </span>
      <span className={cn(isOffline && 'text-red-600 font-semibold', isStale && 'text-amber-600 font-medium')}>
        {label}
      </span>
    </div>
  )
}
