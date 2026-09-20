import React from 'react'
import { Badge } from '../ui/Badge'
import { ALERT_SEVERITY } from '../../constants/statuses'
import { AlertCircle, AlertTriangle, Info } from 'lucide-react'

export function AlertSeverityBadge({ severity, className }) {
  const config = {
    [ALERT_SEVERITY.CRITICAL]: {
      label: 'CRITICAL',
      variant: 'danger',
      icon: AlertCircle,
    },
    [ALERT_SEVERITY.WARNING]: {
      label: 'WARNING',
      variant: 'warning',
      icon: AlertTriangle,
    },
    [ALERT_SEVERITY.INFO]: {
      label: 'INFO',
      variant: 'info',
      icon: Info,
    },
  }

  const current = config[severity] || { label: severity, variant: 'neutral', icon: null }
  const Icon = current.icon

  return (
    <Badge variant={current.variant} className={className}>
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{current.label}</span>
    </Badge>
  )
}
