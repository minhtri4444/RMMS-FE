import React from 'react'
import { Badge } from '../ui/Badge'
import { ROBOT_STATUS } from '../../constants/statuses'

export function RobotStatusBadge({ status, className }) {
  const config = {
    [ROBOT_STATUS.AVAILABLE]: { label: 'Available', variant: 'success', dot: true },
    [ROBOT_STATUS.IN_PROGRESS]: { label: 'In Mission', variant: 'primary', dot: true },
    [ROBOT_STATUS.CHARGING]: { label: 'Charging', variant: 'warning', dot: true },
    [ROBOT_STATUS.MAINTENANCE]: { label: 'Maintenance', variant: 'warning', dot: true },
    [ROBOT_STATUS.OFFLINE]: { label: 'Offline', variant: 'danger', dot: true },
    [ROBOT_STATUS.COMMISSIONING]: { label: 'Commissioning', variant: 'info', dot: true },
  }

  const current = config[status] || { label: status, variant: 'neutral', dot: true }

  return (
    <Badge variant={current.variant} dot={current.dot} className={className}>
      {current.label}
    </Badge>
  )
}
