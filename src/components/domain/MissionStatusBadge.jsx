import React from 'react'
import { Badge } from '../ui/Badge'
import { MISSION_STATUS } from '../../constants/statuses'

export function MissionStatusBadge({ status, className }) {
  const config = {
    [MISSION_STATUS.PENDING]: { label: 'PENDING', variant: 'warning', dot: true },
    [MISSION_STATUS.IN_PROGRESS]: { label: 'IN PROGRESS', variant: 'primary', dot: true },
    [MISSION_STATUS.COMPLETED]: { label: 'COMPLETED', variant: 'success', dot: false },
    [MISSION_STATUS.FAILED]: { label: 'FAILED', variant: 'danger', dot: false },
    [MISSION_STATUS.CANCELLED]: { label: 'CANCELLED', variant: 'neutral', dot: false },
  }

  const current = config[status] || { label: status, variant: 'neutral', dot: false }

  return (
    <Badge variant={current.variant} dot={current.dot} className={className}>
      {current.label}
    </Badge>
  )
}
