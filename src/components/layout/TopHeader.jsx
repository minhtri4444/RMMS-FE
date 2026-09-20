import { useSelector, useDispatch } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import { Bell, RefreshCw, ChevronRight } from 'lucide-react'
import { refreshTelemetry } from '../../features/dashboard/telemetrySlice'
import { toast } from 'sonner'

export function TopHeader() {
  const dispatch = useDispatch()
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)
  const alertItems = useSelector((state) => state.alerts?.items || [])
  const unreadAlertsCount = alertItems.filter(a => a.status === 'ACTIVE').length

  const getBreadcrumbs = () => {
    const path = location.pathname
    if (path.startsWith('/dashboard')) return ['Fleet Overview', 'Dashboard']
    if (path.startsWith('/missions/create')) return ['Missions', 'Create Mission']
    if (path.startsWith('/missions')) return ['Missions', 'Mission Queue']
    if (path.startsWith('/alerts')) return ['Monitoring', 'Alerts Center']
    return ['RMMS', 'Control Center']
  }

  const breadcrumbs = getBreadcrumbs()

  const handleRefresh = () => {
    dispatch(refreshTelemetry())
    toast.success('Telemetry refreshed from fleet controller', {
      duration: 2000,
    })
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* Breadcrumbs & Title */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="font-medium text-slate-400">{breadcrumbs[0]}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <h1 className="text-sm font-bold text-slate-900 tracking-tight">{breadcrumbs[1]}</h1>
      </div>

      {/* Operations Controls & Status */}
      <div className="flex items-center gap-4">
        {/* Realtime Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-mono text-[11px] font-semibold tracking-wide">REALTIME CONNECTED</span>
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={handleRefresh}
          title="Refresh fleet telemetry"
          className="p-2 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Alerts Bell */}
        <Link
          to="/alerts"
          className="relative p-2 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
          title={`${unreadAlertsCount} active alerts`}
        >
          <Bell className="w-4 h-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
          )}
        </Link>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200" />

        {/* User Identity Chip */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-7 h-7 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-xs font-bold text-blue-700">
            {user?.avatar || 'OP'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name || 'Operator'}</p>
            <p className="text-[10px] text-slate-500 font-mono leading-tight">{user?.role || 'OPERATOR'}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
