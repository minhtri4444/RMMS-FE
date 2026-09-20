import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  Bot,
  CheckCircle2,
  PlayCircle,
  BatteryCharging,
  AlertTriangle,
  ArrowRight,
  Plus,
  ChevronRight,
} from 'lucide-react'
import { selectRobot } from '../telemetrySlice'
import { FleetMap } from '../components/FleetMap'
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { RobotStatusBadge } from '../../../components/domain/RobotStatusBadge'
import { MissionPriorityBadge } from '../../../components/domain/MissionPriorityBadge'
import { AlertSeverityBadge } from '../../../components/domain/AlertSeverityBadge'
import { BatteryIndicator } from '../../../components/domain/BatteryIndicator'
import { HeartbeatIndicator } from '../../../components/domain/HeartbeatIndicator'
import { ALERT_SEVERITY, ALERT_STATUS } from '../../../constants/statuses'

export function DashboardPage() {
  const dispatch = useDispatch()
  const { robots, selectedRobotId } = useSelector((state) => state.telemetry)
  const { items: missions } = useSelector((state) => state.missions)
  const { items: alerts } = useSelector((state) => state.alerts)

  // 100% Derived KPI Calculations from shared state
  const totalRobots = robots.length
  const availableRobots = robots.filter((r) => r.status === 'AVAILABLE').length
  const inMissionRobots = robots.filter((r) => r.status === 'IN_PROGRESS').length
  const chargingRobots = robots.filter((r) => r.status === 'CHARGING').length
  const offlineRobots = robots.filter((r) => r.status === 'OFFLINE').length

  const activeAlerts = alerts.filter((a) => a.status === ALERT_STATUS.ACTIVE)
  const criticalAlertsCount = activeAlerts.filter((a) => a.severity === ALERT_SEVERITY.CRITICAL).length
  const warningAlertsCount = activeAlerts.filter((a) => a.severity === ALERT_SEVERITY.WARNING).length

  // Filter top active missions from shared missions state
  const activeMissions = missions
    .filter((m) => m.status === 'IN_PROGRESS' || m.status === 'PENDING')
    .slice(0, 2)

  // Filter top active alerts from shared alerts state
  const criticalAlerts = activeAlerts.slice(0, 2)

  return (
    <div className="space-y-5">
      {/* 5 Compact KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* KPI 1: Total Robots */}
        <Card className="p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Robots
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 leading-tight">
              {totalRobots}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {totalRobots} registered AMRs
            </div>
          </div>
        </Card>

        {/* KPI 2: Available */}
        <Card className="p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Available
            </div>
            <div className="text-xl font-bold font-mono text-emerald-700 leading-tight">
              {availableRobots}
            </div>
            <div className="text-[10px] text-emerald-600 mt-0.5 font-medium">
              Ready for dispatch
            </div>
          </div>
        </Card>

        {/* KPI 3: In Mission */}
        <Card className="p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
            <PlayCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              In Mission
            </div>
            <div className="text-xl font-bold font-mono text-blue-700 leading-tight">
              {inMissionRobots}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {inMissionRobots > 0 ? `${activeMissions[0]?.id || 'In transit'} active` : 'No active transit'}
            </div>
          </div>
        </Card>

        {/* KPI 4: Charging / Docked */}
        <Card className="p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <BatteryCharging className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Charging
            </div>
            <div className="text-xl font-bold font-mono text-amber-700 leading-tight">
              {chargingRobots}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {chargingRobots > 0
                ? `${chargingRobots} AMR docked`
                : offlineRobots > 0
                  ? `${offlineRobots} offline at dock`
                  : 'Docks available'}
            </div>
          </div>
        </Card>

        {/* KPI 5: Active Alerts */}
        <Card className="p-3.5 flex items-center gap-3 border-red-200/80 bg-red-50/20">
          <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Active Alerts
            </div>
            <div className="text-xl font-bold font-mono text-red-600 leading-tight">
              {activeAlerts.length}
            </div>
            <div className="text-[10px] text-red-600 mt-0.5 font-medium">
              {criticalAlertsCount} Critical, {warningAlertsCount} Warning
            </div>
          </div>
        </Card>
      </div>

      {/* Main Monitoring Row: Centerpiece Real-Time Map + Right Operations Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Real-time Map Centerpiece */}
        <div className="lg:col-span-8 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="py-2.5">
              <div className="flex items-center gap-2">
                <CardTitle>Real-Time Hospital Ground Floor Map</CardTitle>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  22 Waypoints Active
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[11px]">Telemetry Stream: 1 Hz</span>
              </div>
            </CardHeader>
            <div className="p-2 flex-1">
              <FleetMap
                robots={robots}
                selectedRobotId={selectedRobotId}
                onSelectRobot={(id) => dispatch(selectRobot(id))}
              />
            </div>
          </Card>
        </div>

        {/* Right Operations Panels */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          {/* Panel 1: Active Missions */}
          <Card className="flex-1">
            <CardHeader className="py-2.5">
              <CardTitle>Active Missions</CardTitle>
              <Link
                to="/missions"
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
              >
                Queue <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent className="p-3 space-y-2.5">
              {activeMissions.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-md bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{m.id}</span>
                      <MissionPriorityBadge priority={m.priority} showIcon={false} />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">
                      {m.assignedRobotId || 'Unassigned'}
                    </span>
                  </div>
                  <div className="text-slate-600 truncate font-medium">
                    {m.pickupLocation} → {m.destinationLocation || 'Internal Area'}
                  </div>
                  {m.progress > 0 && (
                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                      <span>Progress: {m.progress}%</span>
                      <span className="font-mono text-blue-600 font-semibold">
                        {m.progress >= 90 ? 'Arriving at bay' : 'ETA 06 min'}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => (window.location.href = '/missions')}
                >
                  View Queue
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={Plus}
                  className="w-full text-xs"
                  onClick={() => (window.location.href = '/missions/create')}
                >
                  Create Mission
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Panel 2: Critical Alerts */}
          <Card className="flex-1">
            <CardHeader className="py-2.5">
              <div className="flex items-center gap-2">
                <CardTitle>Critical Alerts</CardTitle>
                <span className="px-1.5 py-0.2 rounded-full bg-red-100 text-red-700 text-[10px] font-bold font-mono">
                  {activeAlerts.length}
                </span>
              </div>
              <Link
                to="/alerts"
                className="text-xs text-red-600 hover:text-red-700 font-semibold inline-flex items-center gap-1"
              >
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent className="p-3 space-y-2.5">
              {criticalAlerts.map((alt) => (
                <div
                  key={alt.id}
                  className="p-3 rounded-md bg-red-50/40 border border-red-200/70 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900">{alt.id}</span>
                    <AlertSeverityBadge severity={alt.severity} />
                  </div>
                  <div className="font-semibold text-slate-800">{alt.title}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span className="font-mono font-semibold text-slate-700">{alt.robotId}</span>
                    <span className="font-mono">
                      {alt.lastHeartbeatSecondsAgo ? `${alt.lastHeartbeatSecondsAgo}s ago` : 'Active'}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Section: Compact Fleet Status Table */}
      <Card>
        <CardHeader className="py-3">
          <div className="flex items-center gap-2">
            <CardTitle>Fleet Telemetry & Status</CardTitle>
            <span className="text-xs text-slate-500">Live operational readout</span>
          </div>
          <span className="text-xs font-mono text-slate-400">Refreshed live (1 Hz)</span>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="px-4 py-2.5">Robot ID</th>
                <th className="px-4 py-2.5">Type</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Battery</th>
                <th className="px-4 py-2.5">Current Mission</th>
                <th className="px-4 py-2.5">Progress</th>
                <th className="px-4 py-2.5">Speed</th>
                <th className="px-4 py-2.5">Last Heartbeat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {robots.map((r) => {
                const isSelected = r.id === selectedRobotId
                return (
                  <tr
                    key={r.id}
                    onClick={() => dispatch(selectRobot(r.id))}
                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${isSelected ? 'bg-blue-50/40' : ''
                      }`}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{r.id}</td>
                    <td className="px-4 py-3 text-slate-600 font-medium">{r.type}</td>
                    <td className="px-4 py-3">
                      <RobotStatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3">
                      <BatteryIndicator battery={r.battery} isCharging={r.status === 'CHARGING'} />
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {r.currentMissionId ? (
                        <span className="text-blue-600 font-semibold">{r.currentMissionId}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {r.progress > 0 ? (
                        <div className="flex items-center gap-2 max-w-[120px]">
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full transition-all duration-300"
                              style={{ width: `${r.progress}%` }}
                            />
                          </div>
                          <span className="font-mono text-slate-500 text-[10px]">{r.progress}%</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700">{r.speed} m/s</td>
                    <td className="px-4 py-3">
                      <HeartbeatIndicator lastHeartbeat={r.lastHeartbeat} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
