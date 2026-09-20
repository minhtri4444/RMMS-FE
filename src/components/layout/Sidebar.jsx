import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  LayoutDashboard,
  ListOrdered,
  PlusCircle,
  Bell,
  Bot,
  Calendar,
  BarChart3,
  ShieldCheck,
  LogOut,
  Cpu,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { logout } from '../../features/auth/authSlice'

export function Sidebar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const alertItems = useSelector((state) => state.alerts?.items || [])
  const activeAlertsCount = alertItems.filter(a => a.status === 'ACTIVE').length

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Mission Queue', path: '/missions', icon: ListOrdered },
    { label: 'Create Mission', path: '/missions/create', icon: PlusCircle },
    {
      label: 'Alerts',
      path: '/alerts',
      icon: Bell,
      badge: activeAlertsCount > 0 ? activeAlertsCount : null,
      badgeVariant: 'danger',
    },
    { label: 'Robots', path: '/robots', icon: Bot, disabled: true, tag: 'Phase 2' },
    { label: 'Schedule', path: '/schedules', icon: Calendar, disabled: true, tag: 'Phase 2' },
    { label: 'Reports', path: '/reports', icon: BarChart3, disabled: true, tag: 'Phase 2' },
    { label: 'Administration', path: '/admin/users', icon: ShieldCheck, disabled: true, tag: 'Phase 2' },
  ]

  return (
    <aside className="w-64 bg-[#0B1220] text-slate-300 flex flex-col shrink-0 h-screen sticky top-0 border-r border-slate-800 select-none z-30">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-800/80">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
          <Cpu className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white text-base tracking-tight font-mono">RMMS</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
              FLEET
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium truncate">AMR Operations Center</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-300">
          Control Center
        </div>
        {navItems.map((item) => {
          const Icon = item.icon
          if (item.disabled) {
            return (
              <div
                key={item.label}
                className="flex items-center justify-between px-3 py-2 rounded-md text-xs text-slate-400 cursor-not-allowed opacity-70 hover:bg-slate-900/30"
                title="Coming in subsequent milestone"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{item.label}</span>
                </div>
                {item.tag && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                    {item.tag}
                  </span>
                )}
              </div>
            )
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all group',
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-[#162238]'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={cn('w-4 h-4 shrink-0 transition-colors', isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200')} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={cn(
                        'text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums',
                        item.badgeVariant === 'danger'
                          ? 'bg-red-500 text-white'
                          : 'bg-blue-500 text-white'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* User Info & Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-[#080d17]">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0">
              {user?.avatar || 'OP'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Operator'}</p>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider truncate">
                  {user?.role || 'OPERATOR'}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Sign out of RMMS"
            className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
