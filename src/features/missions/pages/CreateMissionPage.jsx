import React, { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import {
  PlusCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { createMissionRequest } from '../missionSlice'
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { HOSPITAL_LOCATIONS } from '../../../mocks/locations'
import { MISSION_TYPES, MISSION_TYPE_CONFIG } from '../../../constants/missionTypes'
import { toast } from 'sonner'

export function CreateMissionPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { submitting } = useSelector((state) => state.missions)

  // Default deadline 30 minutes in the future (formatted for datetime-local)
  const defaultDeadline = useMemo(() => {
    const d = new Date(Date.now() + 30 * 60 * 1000)
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    return d.toISOString().slice(0, 16)
  }, [])

  // Form State
  const [type, setType] = useState(MISSION_TYPES.STAT_MEDICINE)
  const [pickupLocation, setPickupLocation] = useState('Pharmacy Warehouse')
  const [destinationLocation, setDestinationLocation] = useState('Emergency Department')
  const [deadline, setDeadline] = useState(defaultDeadline)
  const [description, setDescription] = useState('Urgent stat antibiotic vials for trauma room 2')

  const currentTypeConfig = useMemo(() => MISSION_TYPE_CONFIG[type] || {}, [type])
  const requiresDestination = currentTypeConfig.requiresDestination !== false

  // Live System Checks
  const systemChecks = useMemo(() => {
    const checks = []

    // 1. Pickup location exists
    const pickupExists = HOSPITAL_LOCATIONS.some((loc) => loc.name === pickupLocation)
    checks.push({
      label: 'Pickup location exists',
      valid: pickupExists,
      message: pickupExists ? 'Valid hospital coordinate point' : 'Select a configured hospital location',
    })

    // 2. Destination valid
    if (requiresDestination) {
      const destExists = HOSPITAL_LOCATIONS.some((loc) => loc.name === destinationLocation)
      const isDifferent = pickupLocation !== destinationLocation
      checks.push({
        label: 'Destination valid',
        valid: destExists && isDifferent,
        message:
          destExists && isDifferent
            ? 'Valid transit corridor route'
            : !isDifferent
            ? 'Pickup and destination cannot be identical'
            : 'Select a valid delivery point',
      })
    } else {
      checks.push({
        label: 'Destination not required for scan/patrol',
        valid: true,
        message: 'Internal area scan routing applies',
      })
    }

    // 3. Deadline in future
    const isFuture = new Date(deadline).getTime() > Date.now()
    checks.push({
      label: 'Deadline in future',
      valid: isFuture,
      message: isFuture ? 'Valid execution time window' : 'Deadline must be set in the future',
    })

    // 4. Robot capability possible
    const possibleRobots = currentTypeConfig.allowedRobotTypes || []
    checks.push({
      label: 'Robot capability possible',
      valid: possibleRobots.length > 0,
      message: `Eligible AMR fleets: ${possibleRobots.join(', ')}`,
    })

    // 5. Payload / Description constraint
    const hasDesc = description.trim().length >= 5
    checks.push({
      label: 'Payload / Task description verified',
      valid: hasDesc,
      message: hasDesc ? 'Cargo description specified' : 'Provide cargo load or patrol instructions (min 5 chars)',
    })

    return checks
  }, [pickupLocation, destinationLocation, deadline, requiresDestination, currentTypeConfig, description])

  const isFormValid = systemChecks.every((c) => c.valid)

  const handleTypeChange = (newType) => {
    setType(newType)
    if (newType === MISSION_TYPES.STAT_MEDICINE) {
      setPickupLocation('Pharmacy Warehouse')
      setDestinationLocation('Emergency Department')
      setDescription('Urgent medication package for ICU bay')
    } else if (newType === MISSION_TYPES.SPECIMEN_TRANSPORT) {
      setPickupLocation('Laboratory')
      setDestinationLocation('Emergency Department')
      setDescription('Blood specimen container for immediate centrifuge')
    } else if (newType === MISSION_TYPES.ROUTINE_SUPPLY) {
      setPickupLocation('Central Supply Warehouse')
      setDestinationLocation('Nursing Desk 1')
      setDescription('Routine nursing sterile gauze and saline boxes')
    } else if (newType === MISSION_TYPES.STOCK_CHECK) {
      setPickupLocation('Central Supply Warehouse')
      setDestinationLocation('')
      setDescription('Check shelf inventory in aisle B')
    } else if (newType === MISSION_TYPES.CORRIDOR_PATROL) {
      setPickupLocation('Corridor Node Alpha')
      setDestinationLocation('')
      setDescription('Scheduled corridor sweep for night patrol')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isFormValid) {
      toast.error('Please resolve all system validation errors before submitting.')
      return
    }

    dispatch(
      createMissionRequest({
        type,
        pickupLocation,
        destinationLocation: requiresDestination ? destinationLocation : null,
        deadline: new Date(deadline).toISOString(),
        description,
      })
    )

    toast.success('Mission created successfully and queued as PENDING', {
      description: 'AI Scheduler has initiated priority prediction and candidate matching.',
    })
    navigate('/missions')
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Create Mission</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create a mission and send it to the priority and assignment workflow.
          </p>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
          <span>Workflow:</span>
          <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            WF-01 DISPATCH
          </span>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader className="py-3">
              <CardTitle>Mission Specification</CardTitle>
              <span className="text-[11px] text-slate-400">Step 1 of 1: Input Parameters</span>
            </CardHeader>

            <CardContent className="p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Field 1: Mission Type */}
                <Select
                  label="Mission Type"
                  value={type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="font-medium"
                >
                  <option value={MISSION_TYPES.STAT_MEDICINE}>STAT_MEDICINE (Urgent Medication)</option>
                  <option value={MISSION_TYPES.SPECIMEN_TRANSPORT}>SPECIMEN_TRANSPORT (Lab Samples)</option>
                  <option value={MISSION_TYPES.ROUTINE_SUPPLY}>ROUTINE_SUPPLY (Supplies / Linen)</option>
                  <option value={MISSION_TYPES.STOCK_CHECK}>STOCK_CHECK (Warehouse Inventory)</option>
                  <option value={MISSION_TYPES.CORRIDOR_PATROL}>CORRIDOR_PATROL (Autonomous Patrol)</option>
                </Select>

                {/* Field 2: Pickup Location */}
                <Select
                  label="Pickup Location"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                >
                  {HOSPITAL_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name} ({loc.type})
                    </option>
                  ))}
                </Select>

                {/* Field 3: Destination (Adapts for STOCK_CHECK & CORRIDOR_PATROL) */}
                {requiresDestination ? (
                  <Select
                    label="Destination Location"
                    value={destinationLocation}
                    onChange={(e) => setDestinationLocation(e.target.value)}
                  >
                    {HOSPITAL_LOCATIONS.filter((l) => l.name !== pickupLocation).map((loc) => (
                      <option key={loc.id} value={loc.name}>
                        {loc.name} ({loc.type})
                      </option>
                    ))}
                  </Select>
                ) : (
                  <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-500">
                    <strong>Destination: </strong>
                    Not required for this mission type. The robot executes an autonomous area scan at{' '}
                    <span className="font-semibold text-slate-700">{pickupLocation}</span>.
                  </div>
                )}

                {/* Field 4: Deadline */}
                <Input
                  label="Target Delivery Deadline"
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  helperText="AI Scheduler uses remaining time to evaluate deadline pressure."
                />

                {/* Field 5: Load / Task Description */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 tracking-wide">
                    Load / Task Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Specify package details, temperature requirements, or security notes..."
                    className="w-full rounded-md border border-slate-300 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <p className="text-[11px] text-slate-500">
                    Required for operator handover verification and compartment payload check.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <Link to="/missions">
                    <Button variant="outline" size="md">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={submitting}
                    disabled={!isFormValid || submitting}
                    leftIcon={PlusCircle}
                  >
                    {submitting ? 'Creating…' : 'Create Mission'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Validation + Mission Preview + AI Teaser */}
        <div className="lg:col-span-5 space-y-4">
          {/* Live Validation Panel */}
          <Card>
            <CardHeader className="py-2.5 bg-slate-50/60">
              <CardTitle>System Checks & Constraints</CardTitle>
              <span className="text-[10px] font-mono text-slate-500">Pre-Dispatch Gate</span>
            </CardHeader>
            <CardContent className="p-3.5 space-y-2.5 text-xs">
              {systemChecks.map((check) => (
                <div
                  key={check.label}
                  className={`flex items-start gap-2.5 p-2 rounded-md border transition-colors ${
                    check.valid
                      ? 'bg-emerald-50/40 border-emerald-200/80 text-emerald-950'
                      : 'bg-red-50/50 border-red-200 text-red-950'
                  }`}
                >
                  {check.valid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold">{check.label}</div>
                    <div className="text-[11px] opacity-80">{check.message}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Mission Preview */}
          <Card>
            <CardHeader className="py-2.5 bg-slate-50/60">
              <CardTitle>Mission Preview</CardTitle>
              <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                INITIAL: PENDING
              </span>
            </CardHeader>
            <CardContent className="p-3.5 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">Type</span>
                  <span className="font-mono font-bold text-slate-900">{type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Deadline</span>
                  <span className="font-mono text-slate-800">{deadline.replace('T', ' ')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">From</span>
                  <span className="font-semibold text-slate-800">{pickupLocation}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">To</span>
                  <span className="font-semibold text-slate-800">
                    {requiresDestination ? destinationLocation : 'Area Scan'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1 text-[11px]">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Priority Evaluation:</span>
                  <span className="font-semibold text-blue-600">AI Scheduler will evaluate</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>AMR Assignment:</span>
                  <span className="font-semibold text-teal-600">AI Scheduler will evaluate eligible robots</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Priority Teaser Box */}
          <Card className="border-blue-200/80 bg-blue-50/30">
            <CardHeader className="py-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <CardTitle className="text-blue-900">How priority is decided</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-3.5 space-y-2 text-xs text-blue-950">
              <p className="text-[11px] leading-relaxed text-blue-900/80">
                The AI Scheduler evaluates queued missions using the configured priority rules:
              </p>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-medium">
                <div className="p-1.5 rounded bg-white/70 border border-blue-100">• Mission type weight</div>
                <div className="p-1.5 rounded bg-white/70 border border-blue-100">• Time remaining to deadline</div>
                <div className="p-1.5 rounded bg-white/70 border border-blue-100">• Queue waiting duration</div>
                <div className="p-1.5 rounded bg-white/70 border border-blue-100">• Department / area urgency</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
