import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  Plus,
  RefreshCw,
  Search,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Clock,
  Sparkles,
  Bot,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import {
  selectMission,
  setFilters,
  resetFilters,
  overridePriorityRequest,
  overrideAssignmentRequest,
} from '../missionSlice'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Drawer } from '../../../components/ui/Drawer'
import { Modal } from '../../../components/ui/Modal'
import { MissionPriorityBadge } from '../../../components/domain/MissionPriorityBadge'
import { MissionStatusBadge } from '../../../components/domain/MissionStatusBadge'
import { BatteryIndicator } from '../../../components/domain/BatteryIndicator'
import { MISSION_TYPES } from '../../../constants/missionTypes'
import { MISSION_PRIORITY } from '../../../constants/statuses'
import { ROLES } from '../../../constants/permissions'
import { toast } from 'sonner'

export function MissionQueuePage() {
  const dispatch = useDispatch()
  const { items: missions, selectedMissionId, filters } = useSelector((state) => state.missions)
  const { robots } = useSelector((state) => state.telemetry)
  const { user } = useSelector((state) => state.auth)

  // Modals state
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false)
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false)
  const [overridePriorityValue, setOverridePriorityValue] = useState('CRITICAL')
  const [overridePriorityReason, setOverridePriorityReason] = useState('')
  const [overrideRobotValue, setOverrideRobotValue] = useState('MED-01')
  const [overrideAssignmentReason, setOverrideAssignmentReason] = useState('')

  const selectedMission = missions.find((m) => m.id === selectedMissionId)

  // 100% Derived Queue Metrics from shared state
  const pendingCount = missions.filter((m) => m.status === 'PENDING').length
  const inProgressCount = missions.filter((m) => m.status === 'IN_PROGRESS').length
  const highPriorityCount = missions.filter((m) => m.priority === 'CRITICAL' || m.priority === 'HIGH').length
  const unassignedCount = missions.filter((m) => !m.assignedRobotId).length

  // Filter application
  const filteredMissions = missions.filter((m) => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const matchId = m.id.toLowerCase().includes(q)
      const matchDesc = m.description.toLowerCase().includes(q)
      const matchPickup = m.pickupLocation.toLowerCase().includes(q)
      if (!matchId && !matchDesc && !matchPickup) return false
    }
    if (filters.missionType !== 'ALL' && m.type !== filters.missionType) return false
    if (filters.status !== 'ALL' && m.status !== filters.status) return false
    if (filters.priority !== 'ALL' && m.priority !== filters.priority) return false
    return true
  })

  // Format countdown remaining
  const formatCountdown = (isoDeadline) => {
    const remainingMs = new Date(isoDeadline).getTime() - Date.now()
    if (remainingMs <= 0) return 'Overdue'
    const totalSec = Math.floor(remainingMs / 1000)
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    if (m >= 60) {
      const h = Math.floor(m / 60)
      const remM = m % 60
      return `${String(h).padStart(2, '0')}:${String(remM).padStart(2, '0')}:00`
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  // Handle Supervisor Priority Override Submit
  const handleConfirmPriorityOverride = () => {
    if (!overridePriorityReason.trim()) return
    dispatch(
      overridePriorityRequest({
        missionId: selectedMission.id,
        newPriority: overridePriorityValue,
        reason: overridePriorityReason,
        user: user?.name || 'Supervisor',
      })
    )
    toast.success(`Priority for ${selectedMission.id} overridden to ${overridePriorityValue}`)
    setIsPriorityModalOpen(false)
    setOverridePriorityReason('')
  }

  // Handle Operator Assignment Override Submit
  const handleConfirmAssignmentOverride = () => {
    if (!overrideAssignmentReason.trim()) return
    dispatch(
      overrideAssignmentRequest({
        missionId: selectedMission.id,
        robotId: overrideRobotValue,
        reason: overrideAssignmentReason,
        user: user?.name || 'Operator',
      })
    )
    toast.success(`Robot assignment for ${selectedMission.id} overridden to ${overrideRobotValue}`)
    setIsAssignmentModalOpen(false)
    setOverrideAssignmentReason('')
  }

  const isSupervisor = user?.role === ROLES.SUPERVISOR || user?.role === ROLES.ADMIN
  const isOperator = user?.role === ROLES.OPERATOR || user?.role === ROLES.ADMIN

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Mission Queue</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Prioritized clinical and transport missions waiting for AI assignment and fleet execution.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={RefreshCw}
            onClick={() => toast.info('Queue refreshed')}
          >
            Refresh
          </Button>
          <Link to="/missions/create">
            <Button variant="primary" size="sm" leftIcon={Plus}>
              Create Mission
            </Button>
          </Link>
        </div>
      </div>

      {/* Top 4 Compact Queue Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card className="p-3.5">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Pending in Queue
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-0.5">{pendingCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Awaiting dispatch</div>
        </Card>

        <Card className="p-3.5">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            In Progress
          </div>
          <div className="text-2xl font-bold font-mono text-blue-600 mt-0.5">{inProgressCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Active transit</div>
        </Card>

        <Card className="p-3.5 border-red-200 bg-red-50/20">
          <div className="text-[11px] font-semibold text-red-700 uppercase tracking-wider">
            High / Critical Priority
          </div>
          <div className="text-2xl font-bold font-mono text-red-600 mt-0.5">{highPriorityCount}</div>
          <div className="text-[10px] text-red-600/80 mt-0.5 font-medium">Immediate response needed</div>
        </Card>

        <Card className="p-3.5">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Unassigned
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-0.5">{unassignedCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Evaluating candidates</div>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search */}
          <div className="lg:col-span-2">
            <Input
              placeholder="Search by mission ID, load, or location..."
              leftIcon={Search}
              value={filters.search}
              onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
              className="text-xs h-9"
            />
          </div>

          {/* Mission Type */}
          <Select
            value={filters.missionType}
            onChange={(e) => dispatch(setFilters({ missionType: e.target.value }))}
            className="text-xs h-9"
          >
            <option value="ALL">All Mission Types</option>
            <option value={MISSION_TYPES.STAT_MEDICINE}>Stat Medicine</option>
            <option value={MISSION_TYPES.SPECIMEN_TRANSPORT}>Specimen Transport</option>
            <option value={MISSION_TYPES.ROUTINE_SUPPLY}>Routine Supply</option>
            <option value={MISSION_TYPES.STOCK_CHECK}>Stock Check</option>
            <option value={MISSION_TYPES.CORRIDOR_PATROL}>Corridor Patrol</option>
          </Select>

          {/* Priority */}
          <Select
            value={filters.priority}
            onChange={(e) => dispatch(setFilters({ priority: e.target.value }))}
            className="text-xs h-9"
          >
            <option value="ALL">All Priorities</option>
            <option value={MISSION_PRIORITY.CRITICAL}>Critical</option>
            <option value={MISSION_PRIORITY.HIGH}>High</option>
            <option value={MISSION_PRIORITY.MEDIUM}>Medium</option>
            <option value={MISSION_PRIORITY.LOW}>Low</option>
          </Select>

          {/* Reset Filters */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(resetFilters())}
            className="text-xs text-slate-500 h-9"
          >
            Reset Filters
          </Button>
        </div>
      </Card>

      {/* Mission Queue Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Mission ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3">To</th>
                <th className="px-4 py-3">Due / Countdown</th>
                <th className="px-4 py-3 text-center">AI Score</th>
                <th className="px-4 py-3">Candidate / Robot</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMissions.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-12 text-center text-slate-500">
                    <p className="text-sm font-semibold">No pending missions match the current filters.</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting the filters or create a new mission.</p>
                  </td>
                </tr>
              ) : (
                filteredMissions.map((m) => {
                  const isSelected = m.id === selectedMissionId
                  return (
                    <tr
                      key={m.id}
                      onClick={() => dispatch(selectMission(m.id))}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer group ${
                        isSelected ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <MissionPriorityBadge priority={m.priority} />
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 group-hover:text-blue-600">
                        {m.id}
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">{m.type}</td>
                      <td className="px-4 py-3 text-slate-700 truncate max-w-[140px] font-medium">
                        {m.pickupLocation}
                      </td>
                      <td className="px-4 py-3 text-slate-700 truncate max-w-[140px]">
                        {m.destinationLocation || <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                        <div className="inline-flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatCountdown(m.deadline)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                          {m.aiScore}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {m.assignedRobotId ? (
                          <span className="font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {m.assignedRobotId}
                          </span>
                        ) : m.suggestedRobotId ? (
                          <span className="font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            ~{m.suggestedRobotId}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <MissionStatusBadge status={m.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            dispatch(selectMission(m.id))
                          }}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          Inspect <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Priority & Assignment Explanation Drawer */}
      <Drawer
        isOpen={!!selectedMissionId}
        onClose={() => dispatch(selectMission(null))}
        title={selectedMission ? `Mission Inspection: ${selectedMission.id}` : ''}
        subtitle="AI Priority Scoring & Robot Candidate Match Analysis"
        footer={
          selectedMission && (
            <div className="flex items-center gap-2">
              {isSupervisor && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={ShieldCheck}
                  onClick={() => setIsPriorityModalOpen(true)}
                  className="text-amber-700 border-amber-300 hover:bg-amber-50"
                >
                  Override Priority
                </Button>
              )}
              {isOperator && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={UserCheck}
                  onClick={() => setIsAssignmentModalOpen(true)}
                >
                  Override Assignment
                </Button>
              )}
            </div>
          )
        }
      >
        {selectedMission && (
          <div className="space-y-6 text-xs text-slate-700">
            {/* Mission Overview Card */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-slate-900">{selectedMission.id}</span>
                <div className="flex items-center gap-2">
                  <MissionPriorityBadge priority={selectedMission.priority} />
                  <MissionStatusBadge status={selectedMission.status} />
                </div>
              </div>
              <p className="text-slate-600 font-medium">{selectedMission.description}</p>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Pickup</span>
                  <span className="font-semibold text-slate-800">{selectedMission.pickupLocation}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Destination</span>
                  <span className="font-semibold text-slate-800">
                    {selectedMission.destinationLocation || 'Internal Area Scan'}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Priority Scoring Explanation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Why is this mission prioritized?
                </h4>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold text-xs">
                  <span>Score:</span>
                  <span>{selectedMission.aiExplanation?.score || selectedMission.aiScore}</span>
                </div>
              </div>

              {/* Contributing factors */}
              <div className="space-y-2">
                {selectedMission.aiExplanation?.factors.map((f) => (
                  <div key={f.name} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-medium">{f.name}</span>
                    <span className="font-semibold text-slate-800 font-mono">{f.value}</span>
                  </div>
                ))}
              </div>

              {/* Explanatory text */}
              <div className="p-3 rounded-md bg-blue-50/60 border border-blue-200/80 text-blue-900 text-[11px] leading-relaxed">
                <strong>Operational Reason: </strong>
                {selectedMission.aiExplanation?.reason}
              </div>

              {selectedMission.priorityOverridden && (
                <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                  <span className="font-bold">Manual Supervisor Override: </span>
                  {selectedMission.overrideReason} (by {selectedMission.overriddenBy})
                </div>
              )}
            </div>

            {/* Candidate Robots & Assignment Status */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-teal-600" />
                  Candidate Robot Suitability
                </h4>
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  {selectedMission.assignmentStatus}
                </span>
              </div>

              <div className="space-y-2.5">
                {selectedMission.candidates && selectedMission.candidates.length > 0 ? (
                  selectedMission.candidates.map((cand) => {
                    const liveRobot = robots.find((r) => r.id === cand.robotId)
                    const liveBattery = liveRobot ? liveRobot.battery : cand.battery
                    const isLiveOffline = liveRobot ? liveRobot.status === 'OFFLINE' : cand.status === 'OFFLINE'

                    return (
                      <div
                        key={cand.robotId}
                        className={`p-3 rounded-lg border transition-all ${
                          cand.eligible && !isLiveOffline
                            ? 'bg-white border-slate-200 shadow-xs'
                            : 'bg-slate-50 border-slate-200/60 opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900">{cand.robotId}</span>
                            <span className="text-[10px] font-mono text-slate-500">{cand.type}</span>
                          </div>
                          {cand.eligible && !isLiveOffline ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Eligible
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                              <XCircle className="w-3 h-3" /> Not Eligible
                            </span>
                          )}
                        </div>

                        <div className="pt-2 text-[11px] space-y-1">
                          <div className="flex items-center justify-between text-slate-600">
                            <span>Battery Margin:</span>
                            <BatteryIndicator battery={liveBattery} />
                          </div>
                          {cand.distanceMeters && (
                            <div className="flex items-center justify-between text-slate-600">
                              <span>Transit Distance:</span>
                              <span className="font-mono">{cand.distanceMeters} m</span>
                            </div>
                          )}
                          <div className="pt-1 text-slate-500">
                            <strong>Evaluation: </strong>
                            {isLiveOffline ? 'Telemetry link offline (offline threshold exceeded)' : cand.reason}
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-slate-400 italic">No specific candidates evaluated yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Supervisor Priority Override Modal */}
      <Modal
        isOpen={isPriorityModalOpen}
        onClose={() => setIsPriorityModalOpen(false)}
        title="Supervisor Priority Override"
        subtitle={`Adjust operational queue priority for ${selectedMission?.id}`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsPriorityModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!overridePriorityReason.trim()}
              onClick={handleConfirmPriorityOverride}
            >
              Confirm Override
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <strong>Audit Requirement: </strong>
            Overriding the priority assigned by the AI Scheduler requires an explicit clinical or operational justification. This action will be permanently recorded in the audit activity log.
          </div>

          <Select
            label="New Mission Priority"
            value={overridePriorityValue}
            onChange={(e) => setOverridePriorityValue(e.target.value)}
          >
            <option value="CRITICAL">CRITICAL (Immediate Dispatch)</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </Select>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 tracking-wide">
              Justification / Reason (Mandatory)
            </label>
            <textarea
              rows={3}
              value={overridePriorityReason}
              onChange={(e) => setOverridePriorityReason(e.target.value)}
              placeholder="e.g. Operating room 2 emergency re-supply request communicated by Dr. Lee..."
              className="w-full rounded-md border border-slate-300 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </Modal>

      {/* Operator Assignment Override Modal */}
      <Modal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        title="Operator Manual Robot Assignment"
        subtitle={`Manually bind robot to mission ${selectedMission?.id}`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsAssignmentModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!overrideAssignmentReason.trim()}
              onClick={handleConfirmAssignmentOverride}
            >
              Confirm Manual Assignment
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Select AMR Candidate"
            value={overrideRobotValue}
            onChange={(e) => setOverrideRobotValue(e.target.value)}
          >
            <option value="MED-01">MED-01 (Med Cart - 80% Batt, Locked Box)</option>
            <option value="SUP-01">SUP-01 (Supply Cart - 43% Batt, 100 kg)</option>
            <option value="PAT-01">PAT-01 (Patrol Bot - 91% Batt, Sensor only)</option>
          </Select>

          <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div className="font-semibold text-slate-800">Robot Capability Constraint Check:</div>
            <div className="text-slate-600">
              Ensure selected robot conforms to mission payload and lock requirements before dispatch.
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 tracking-wide">
              Manual Override Reason (Mandatory)
            </label>
            <textarea
              rows={3}
              value={overrideAssignmentReason}
              onChange={(e) => setOverrideAssignmentReason(e.target.value)}
              placeholder="e.g. Proximity to pharmacy staging area makes MED-01 preferable..."
              className="w-full rounded-md border border-slate-300 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
