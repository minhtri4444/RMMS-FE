import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  RefreshCw,
  Search,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  MapPin,
  Clock,
  RotateCcw,
  Pause,
  XCircle,
  Bot,
  CheckCircle2,
} from 'lucide-react'
import {
  selectAlert,
  setAlertFilters,
  resetAlertFilters,
  acknowledgeAlertRequest,
  resolveAlertRequest,
  executeRecoveryRequest,
} from '../alertSlice'
import { Card, CardHeader, CardContent } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Modal } from '../../../components/ui/Modal'
import { AlertSeverityBadge } from '../../../components/domain/AlertSeverityBadge'
import { BatteryIndicator } from '../../../components/domain/BatteryIndicator'
import { HeartbeatIndicator } from '../../../components/domain/HeartbeatIndicator'
import { RobotStatusBadge } from '../../../components/domain/RobotStatusBadge'
import { MissionPriorityBadge } from '../../../components/domain/MissionPriorityBadge'
import { ALERT_SEVERITY, ALERT_STATUS, RECOVERY_ACTIONS } from '../../../constants/statuses'
import { toast } from 'sonner'

export function AlertsPage() {
  const dispatch = useDispatch()
  const { items: alerts, selectedAlertId, filters } = useSelector((state) => state.alerts)
  const { robots } = useSelector((state) => state.telemetry)
  const { items: missions } = useSelector((state) => state.missions)
  const { user } = useSelector((state) => state.auth)

  // Expandable group state for deduplicated alerts
  const [expandedGroups, setExpandedGroups] = useState({ 'A-203': false })
  // Resolve modal state
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false)
  const [resolutionNote, setResolutionNote] = useState('')
  const [selectedRecovery, setSelectedRecovery] = useState(RECOVERY_ACTIONS.REASSIGN)

  const selectedAlert = alerts.find((a) => a.id === selectedAlertId) || alerts[0]
  const liveRobot = selectedAlert ? robots.find((r) => r.id === selectedAlert.robotId) : null
  const liveMission = selectedAlert ? missions.find((m) => m.id === selectedAlert.missionId) : null

  // 100% Derived Counters from shared alerts state
  const criticalCount = alerts.filter((a) => a.severity === ALERT_SEVERITY.CRITICAL && a.status !== ALERT_STATUS.RESOLVED).length
  const warningCount = alerts.filter((a) => a.severity === ALERT_SEVERITY.WARNING && a.status !== ALERT_STATUS.RESOLVED).length
  const unacknowledgedCount = alerts.filter((a) => a.status === ALERT_STATUS.ACTIVE).length
  const resolvedTodayCount = alerts.filter((a) => a.status === ALERT_STATUS.RESOLVED).length

  // Filter alerts
  const filteredAlerts = alerts.filter((alt) => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const matchId = alt.id.toLowerCase().includes(q)
      const matchTitle = alt.title.toLowerCase().includes(q)
      const matchRobot = alt.robotId?.toLowerCase().includes(q)
      if (!matchId && !matchTitle && !matchRobot) return false
    }
    if (filters.severity !== 'ALL' && alt.severity !== filters.severity) return false
    if (filters.status !== 'ALL' && alt.status !== filters.status) return false
    if (filters.robotId !== 'ALL' && alt.robotId !== filters.robotId) return false
    return true
  })

  const toggleGroup = (id) => {
    setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Handle Acknowledge
  const handleAcknowledge = (alertId) => {
    dispatch(
      acknowledgeAlertRequest({
        alertId,
        user: user?.name || 'Operator',
      })
    )
    toast.info(`Alert ${alertId} acknowledged.`)
  }

  // Handle Quick Recovery Action
  const handleQuickRecovery = (actionName) => {
    dispatch(
      executeRecoveryRequest({
        alertId: selectedAlert.id,
        recoveryAction: actionName,
        user: user?.name || 'Operator',
      })
    )
    toast.success(`Recovery policy ${actionName} applied to ${selectedAlert.id}.`)
  }

  // Handle Resolve Submit
  const handleConfirmResolve = () => {
    if (!resolutionNote.trim()) return
    dispatch(
      resolveAlertRequest({
        alertId: selectedAlert.id,
        resolutionNote,
        recoveryAction: selectedRecovery,
        user: user?.name || 'Operator',
      })
    )
    toast.success(`Alert ${selectedAlert.id} resolved and recorded in audit log.`)
    setIsResolveModalOpen(false)
    setResolutionNote('')
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Alerts Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor abnormal robot telemetry and mission conditions, dispatch recovery, and track SLA escalations.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={RefreshCw}
            onClick={() => toast.info('Alerts refreshed')}
          >
            Refresh
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={CheckCheck}
            onClick={() => toast.info('All active alerts marked as reviewed.')}
          >
            Mark All Read
          </Button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card className="p-3.5 border-red-200/90 bg-red-50/20">
          <div className="text-[11px] font-semibold text-red-700 uppercase tracking-wider">
            Critical Severity
          </div>
          <div className="text-2xl font-bold font-mono text-red-600 mt-0.5">{criticalCount}</div>
          <div className="text-[10px] text-red-600/80 mt-0.5 font-medium">Requires immediate response</div>
        </Card>

        <Card className="p-3.5 border-amber-200/90 bg-amber-50/20">
          <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
            Warning Severity
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-0.5">{warningCount}</div>
          <div className="text-[10px] text-amber-600/80 mt-0.5">Requires monitoring</div>
        </Card>

        <Card className="p-3.5">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Unacknowledged
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-0.5">{unacknowledgedCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Awaiting operator check</div>
        </Card>

        <Card className="p-3.5">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Resolved Today
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-0.5">{resolvedTodayCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">SLA verified & archived</div>
        </Card>
      </div>

      {/* Filter Row */}
      <Card className="p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          <div className="lg:col-span-2">
            <Input
              placeholder="Search by alert ID, title, or robot..."
              leftIcon={Search}
              value={filters.search}
              onChange={(e) => dispatch(setAlertFilters({ search: e.target.value }))}
              className="text-xs h-9"
            />
          </div>

          <Select
            value={filters.severity}
            onChange={(e) => dispatch(setAlertFilters({ severity: e.target.value }))}
            className="text-xs h-9"
          >
            <option value="ALL">All Severities</option>
            <option value={ALERT_SEVERITY.CRITICAL}>Critical</option>
            <option value={ALERT_SEVERITY.WARNING}>Warning</option>
            <option value={ALERT_SEVERITY.INFO}>Info</option>
          </Select>

          <Select
            value={filters.status}
            onChange={(e) => dispatch(setAlertFilters({ status: e.target.value }))}
            className="text-xs h-9"
          >
            <option value="ALL">All Statuses</option>
            <option value={ALERT_STATUS.ACTIVE}>Active</option>
            <option value={ALERT_STATUS.ACKNOWLEDGED}>Acknowledged</option>
            <option value={ALERT_STATUS.RESOLVED}>Resolved</option>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(resetAlertFilters())}
            className="text-xs text-slate-500 h-9"
          >
            Reset Filters
          </Button>
        </div>
      </Card>

      {/* Main Split Layout: Left Alert List + Right Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Alert List */}
        <div className="lg:col-span-7 space-y-3">
          {filteredAlerts.length === 0 ? (
            <Card className="p-12 text-center text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">No active alerts. Fleet is operating normally.</p>
              <p className="text-xs text-slate-400 mt-1">All telemetry is within nominal parameters.</p>
            </Card>
          ) : (
            filteredAlerts.map((alt) => {
              const isSelected = alt.id === selectedAlert?.id
              const isCritical = alt.severity === ALERT_SEVERITY.CRITICAL
              const isWarning = alt.severity === ALERT_SEVERITY.WARNING
              const isResolved = alt.status === ALERT_STATUS.RESOLVED

              return (
                <div key={alt.id} className="space-y-1">
                  <div
                    onClick={() => dispatch(selectAlert(alt.id))}
                    className={`p-4 rounded-lg border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/20 shadow-xs'
                        : isResolved
                        ? 'border-slate-200 bg-white/70 opacity-75 hover:bg-slate-50'
                        : isCritical
                        ? 'border-red-200 bg-white hover:border-red-300'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {/* Subtle left accent border for critical without flashing */}
                    {isCritical && !isResolved && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-l-lg" />
                    )}
                    {isWarning && !isResolved && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-l-lg" />
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-900">{alt.id}</span>
                          <AlertSeverityBadge severity={alt.severity} />
                          {alt.escalatedToSupervisor && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                              Escalated to Supervisor
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-bold uppercase font-mono px-1.5 py-0.2 rounded ${
                              alt.status === ALERT_STATUS.ACTIVE
                                ? 'bg-red-50 text-red-700'
                                : alt.status === ALERT_STATUS.ACKNOWLEDGED
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {alt.status}
                          </span>
                        </div>

                        <h3 className="text-sm font-semibold text-slate-900">{alt.title}</h3>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{alt.message}</p>
                      </div>

                      <div className="text-right shrink-0 text-xs">
                        <div className="font-mono font-bold text-slate-800">{alt.robotId}</div>
                        {alt.missionId && (
                          <div className="font-mono text-slate-400 text-[11px]">{alt.missionId}</div>
                        )}
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{alt.location}</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>
                          {alt.lastHeartbeatSecondsAgo
                            ? `${alt.lastHeartbeatSecondsAgo}s ago`
                            : new Date(alt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Grouped Alerts (e.g. 3 similar low-battery alerts) */}
                  {alt.similarAlertsCount && (
                    <div className="ml-4 pl-3 border-l-2 border-amber-200">
                      <button
                        type="button"
                        onClick={() => toggleGroup(alt.id)}
                        className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 py-1 cursor-pointer"
                      >
                        {expandedGroups[alt.id] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        <span>{alt.similarAlertsCount} similar low-battery warnings grouped</span>
                      </button>

                      {expandedGroups[alt.id] && (
                        <div className="space-y-1.5 mt-1 pb-2">
                          {alt.similarAlerts.map((sim) => (
                            <div
                              key={sim.id}
                              className="p-2 rounded bg-amber-50/50 border border-amber-200/60 text-xs flex items-center justify-between text-slate-700"
                            >
                              <span>{sim.note}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{sim.time}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Right Column: Selected Alert Detail Panel */}
        <div className="lg:col-span-5 sticky top-20">
          {selectedAlert ? (
            <Card className="shadow-sm">
              <CardHeader className="py-3 bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-slate-900">{selectedAlert.id}</span>
                  <AlertSeverityBadge severity={selectedAlert.severity} />
                </div>
                <span
                  className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                    selectedAlert.status === ALERT_STATUS.ACTIVE
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : selectedAlert.status === ALERT_STATUS.ACKNOWLEDGED
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {selectedAlert.status}
                </span>
              </CardHeader>

              <CardContent className="p-4 space-y-4 text-xs">
                {/* Title & Core Diagnostics */}
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedAlert.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedAlert.message}</p>
                </div>

                {/* Key Context Grid with Shared Live Telemetry & Mission State */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] space-y-2.5">
                  <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200/70">
                    <div>
                      <span className="text-slate-400 block">Affected Robot</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono font-bold text-slate-900">{selectedAlert.robotId}</span>
                        {liveRobot && <RobotStatusBadge status={liveRobot.status} />}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Live Battery & Heartbeat</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        {liveRobot ? (
                          <>
                            <BatteryIndicator battery={liveRobot.battery} isCharging={liveRobot.status === 'CHARGING'} />
                            <HeartbeatIndicator lastHeartbeat={liveRobot.lastHeartbeat} />
                          </>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block">Associated Mission</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {liveMission ? (
                          <>
                            <span className="font-mono font-semibold text-blue-600">{liveMission.id}</span>
                            <MissionPriorityBadge priority={liveMission.priority} showIcon={false} />
                          </>
                        ) : (
                          <span className="font-mono text-slate-500">{selectedAlert.missionId || 'None'}</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Location Node</span>
                      <span className="font-medium text-slate-800 mt-0.5 block">{selectedAlert.location}</span>
                    </div>
                  </div>
                </div>

                {/* Recommended Recovery Policy */}
                {selectedAlert.recommendedRecovery && (
                  <div className="p-3 rounded-md bg-blue-50/60 border border-blue-200 text-blue-950 text-xs">
                    <span className="font-bold">Recommended Recovery: </span>
                    <span className="font-mono font-semibold text-blue-800">
                      {selectedAlert.recommendedRecovery}
                    </span>
                    <p className="text-[11px] text-blue-900/80 mt-1">
                      {selectedAlert.recommendedRecovery === 'REASSIGN' &&
                        'Releases this mission back to PENDING queue and runs candidate assignment excluding the offline robot.'}
                      {selectedAlert.recommendedRecovery === 'RETURN_TO_CHARGE' &&
                        'Commands the AMR to immediately abort transit and route to the nearest inductive charging dock.'}
                      {selectedAlert.recommendedRecovery === 'PAUSE' &&
                        'Holds AMR motion in place until corridor obstruction is resolved.'}
                    </p>
                  </div>
                )}

                {/* Applicable Recovery Actions */}
                {selectedAlert.status !== ALERT_STATUS.RESOLVED &&
                  selectedAlert.availableRecoveryActions?.length > 0 && (
                    <div className="space-y-2 pt-1 border-t border-slate-100">
                      <div className="font-semibold text-slate-800 text-xs">Trigger Recovery Action:</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedAlert.availableRecoveryActions.map((act) => (
                          <Button
                            key={act}
                            variant={act === selectedAlert.recommendedRecovery ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => handleQuickRecovery(act)}
                            className="text-xs"
                          >
                            {act === 'PAUSE' && <Pause className="w-3.5 h-3.5 mr-1" />}
                            {act === 'REASSIGN' && <RotateCcw className="w-3.5 h-3.5 mr-1" />}
                            {act === 'CANCEL' && <XCircle className="w-3.5 h-3.5 mr-1" />}
                            {act === 'RETURN_TO_CHARGE' && <Bot className="w-3.5 h-3.5 mr-1" />}
                            {act}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Audit Trail Log */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Incident Audit Trail
                  </div>
                  <div className="space-y-1.5 text-[11px] font-mono">
                    {selectedAlert.auditLog?.map((log, idx) => (
                      <div key={idx} className="p-1.5 rounded bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-between">
                        <span>
                          [{log.action}] {log.user}
                        </span>
                        <span className="text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resolution note if already resolved */}
                {selectedAlert.status === ALERT_STATUS.RESOLVED && selectedAlert.resolutionNote && (
                  <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                    <strong>Resolution Record: </strong>
                    {selectedAlert.resolutionNote}
                  </div>
                )}

                {/* Primary Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  {selectedAlert.status === ALERT_STATUS.ACTIVE && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAcknowledge(selectedAlert.id)}
                    >
                      Acknowledge
                    </Button>
                  )}
                  {selectedAlert.status !== ALERT_STATUS.RESOLVED && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsResolveModalOpen(true)}
                    >
                      Resolve Incident
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-8 text-center text-slate-400 text-xs">
              Select an alert from the list to inspect details and coordinate recovery.
            </Card>
          )}
        </div>
      </div>

      {/* Resolve Incident Modal */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title="Resolve & Close Alert Incident"
        subtitle={`Audit sign-off for ${selectedAlert?.id}`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsResolveModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!resolutionNote.trim()}
              onClick={handleConfirmResolve}
            >
              Confirm Resolution
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700">
            Resolving an alert updates fleet health telemetry, timestamps the incident closure, and writes the operator sign-off to the audit database.
          </div>

          <Select
            label="Applied Recovery Strategy"
            value={selectedRecovery}
            onChange={(e) => setSelectedRecovery(e.target.value)}
          >
            <option value={RECOVERY_ACTIONS.REASSIGN}>REASSIGN (Queue reassigned to next candidate)</option>
            <option value={RECOVERY_ACTIONS.RETURN_TO_CHARGE}>RETURN_TO_CHARGE (Docked for recharge)</option>
            <option value={RECOVERY_ACTIONS.PAUSE}>PAUSE (Temporarily held)</option>
            <option value={RECOVERY_ACTIONS.CANCEL}>CANCEL (Aborted by operator)</option>
          </Select>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 tracking-wide">
              Resolution Note (Mandatory)
            </label>
            <textarea
              rows={3}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="e.g. Telemetry link re-established by service technician; cargo verified intact..."
              className="w-full rounded-md border border-slate-300 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
