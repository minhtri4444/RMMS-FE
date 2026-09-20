import React from 'react'
import { Badge } from '../ui/Badge'
import { MISSION_PRIORITY } from '../../constants/statuses'
import { AlertCircle, ArrowUp, ArrowDown } from 'lucide-react'

export function MissionPriorityBadge({ priority, showIcon = true, className }) {
  const config = {
    [MISSION_PRIORITY.CRITICAL]: {
      label: 'CRITICAL',
      variant: 'danger',
      icon: AlertCircle,
    },
    [MISSION_PRIORITY.HIGH]: {
      label: 'HIGH',
      variant: 'warning',
      icon: ArrowUp,
    },
    [MISSION_PRIORITY.MEDIUM]: {
      label: 'MEDIUM',
      variant: 'primary',
      icon: null,
    },
    [MISSION_PRIORITY.LOW]: {
      label: 'LOW',
      variant: 'neutral',
      icon: ArrowDown,
    },
  }

  const current = config[priority] || { label: priority, variant: 'neutral', icon: null }
  const Icon = showIcon ? current.icon : null

  return (
    <Badge variant={current.variant} className={className}>
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{current.label}</span>
    </Badge>
  )
}
