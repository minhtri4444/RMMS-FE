import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginRequest, clearAuthError } from '../authSlice'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import {
  Cpu,
  Eye,
  EyeOff,
  Radio,
  Zap,
  Lock,
  Mail,
  AlertCircle,
  Activity,
  Workflow,
} from 'lucide-react'

export function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth)

  const [email, setEmail] = useState('operator@rmms.local')
  const [password, setPassword] = useState('rmms-pass-2026')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [localErrors, setLocalErrors] = useState({})

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const validate = () => {
    const errs = {}
    if (!email.trim()) {
      errs.email = 'Email is required.'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Enter a valid email address.'
    }
    if (!password.trim()) {
      errs.password = 'Password is required.'
    }
    setLocalErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(clearAuthError())
    if (!validate()) return
    dispatch(loginRequest({ email, password }))
  }

  const handleSelectDemo = (demoEmail) => {
    setEmail(demoEmail)
    setPassword('rmms-demo-pass')
    setLocalErrors({})
    dispatch(clearAuthError())
  }

  return (
    <div className="min-h-screen w-screen flex flex-col lg:flex-row bg-slate-50 font-sans">
      {/* Left Column: Mission Control Branding & Capabilities */}
      <div className="lg:w-1/2 bg-[#0B1220] text-white p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden border-r border-slate-800">
        {/* Subtle grid background pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top Wordmark */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-mono tracking-wider">RMMS</span>
                <span className="text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  AUTONOMOUS FLEET
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Hospital Logistics Control Hub</p>
            </div>
          </div>
        </div>

        {/* Center: System Title & Core Capabilities */}
        <div className="my-10 lg:my-0 relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-teal-400 text-xs font-medium mb-6">
            <Radio className="w-3.5 h-3.5 animate-pulse text-teal-400" />
            <span>Industrial AMR Mission & Dispatch Engine</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Robot Mission <br className="hidden sm:inline" />
            Management System
          </h1>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            Centralized operations cockpit coordinating autonomous mobile robots across clinical departments, pharmacy distribution, and diagnostic corridors.
          </p>

          {/* Three Capabilities */}
          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3.5 p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <div className="w-8 h-8 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">Real-Time Fleet Monitoring</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sub-second AMR localization, battery telemetry, and corridor status tracking.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <div className="w-8 h-8 rounded-md bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                <Workflow className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">Mission Scheduling & Auto-Assignment</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Intelligent priority prediction with compartment and payload constraint checks.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <div className="w-8 h-8 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">Alerts & Autonomous Recovery</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Instant detection of offline events, rerouting obstacles, and rapid reassignments.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-6 border-t border-slate-800/60 text-xs text-slate-500 flex items-center justify-between">
          <span>RMMS Control Suite v2.4</span>
          <span className="font-mono">Ground Floor Scenario (22 Nodes)</span>
        </div>
      </div>

      {/* Right Column: Authentication Panel */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-14">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-left space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to RMMS</h2>
            <p className="text-sm text-slate-500">
              Enter your authorized hospital operator credentials to access the control center.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <div className="font-medium">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              id="login-email"
              label="Work Email"
              type="email"
              placeholder="e.g. operator@rmms.local"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (localErrors.email) setLocalErrors({ ...localErrors, email: null })
              }}
              error={localErrors.email}
              leftIcon={Mail}
              autoComplete="email"
              autoFocus
            />

            <div className="space-y-1.5">
              <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 tracking-wide">
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (localErrors.password) setLocalErrors({ ...localErrors, password: null })
                  }}
                  className={`w-full rounded-md border border-slate-300 bg-white px-3 py-2 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    localErrors.password ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {localErrors.password && (
                <p className="text-xs text-red-600 font-medium">{localErrors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span>Remember me on this workstation</span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full text-sm font-semibold tracking-wide py-2.5 mt-2"
            >
              Sign In to Fleet Control
            </Button>
          </form>

          {/* Quick Demo Accounts Helper */}
          <div className="pt-4 border-t border-slate-200/80">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Demo Accounts Quick-Switch
              </span>
              <span className="text-[10px] text-blue-600 font-medium">Click to populate</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectDemo('operator@rmms.local')}
                className={`p-2 text-left rounded-md border transition-all text-xs cursor-pointer ${
                  email === 'operator@rmms.local'
                    ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-500/30'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="font-semibold text-slate-800">Operator</div>
                <div className="text-[10px] text-slate-500 truncate">Alex Rivera</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemo('supervisor@rmms.local')}
                className={`p-2 text-left rounded-md border transition-all text-xs cursor-pointer ${
                  email === 'supervisor@rmms.local'
                    ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-500/30'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="font-semibold text-slate-800">Supervisor</div>
                <div className="text-[10px] text-slate-500 truncate">Elena Rostova</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemo('admin@rmms.local')}
                className={`p-2 text-left rounded-md border transition-all text-xs cursor-pointer ${
                  email === 'admin@rmms.local'
                    ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-500/30'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="font-semibold text-slate-800">Admin</div>
                <div className="text-[10px] text-slate-500 truncate">Dr. Sarah Chen</div>
              </button>
            </div>
          </div>

          {/* Support Notice */}
          <p className="text-[11px] text-center text-slate-400">
            Contact your hospital system administrator if you cannot access your account or need role privilege updates.
          </p>
        </div>
      </div>
    </div>
  )
}
