import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip as LeafletTooltip } from 'react-leaflet'
import L from 'leaflet'
import { HOSPITAL_LOCATIONS } from '../../../mocks/locations'
import { RobotStatusBadge } from '../../../components/domain/RobotStatusBadge'
import { BatteryIndicator } from '../../../components/domain/BatteryIndicator'
import { HeartbeatIndicator } from '../../../components/domain/HeartbeatIndicator'
import { Crosshair } from 'lucide-react'

// Controller component to handle "Fit Fleet" button
function MapController({ robots, fitTrigger }) {
  const map = useMap()

  useEffect(() => {
    if (robots && robots.length > 0) {
      const bounds = L.latLngBounds(robots.map(r => r.coords))
      // Extend bounds to include a few key hospital locations
      bounds.extend([10.7750, 106.7000])
      bounds.extend([10.7790, 106.7032])
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 })
    }
  }, [fitTrigger, map, robots])

  return null
}

export function FleetMap({ robots = [], selectedRobotId, onSelectRobot }) {
  const [fitCounter, setFitCounter] = React.useState(0)
  const defaultCenter = [10.7770, 106.7015]

  // Create custom marker icons for robots
  const createRobotIcon = (robot) => {
    const isSelected = robot.id === selectedRobotId
    let statusBg = 'bg-blue-600'
    let ringColor = 'ring-blue-400'

    if (robot.status === 'AVAILABLE') {
      statusBg = 'bg-emerald-600'
      ringColor = 'ring-emerald-400'
    } else if (robot.status === 'CHARGING') {
      statusBg = 'bg-amber-500'
      ringColor = 'ring-amber-300'
    } else if (robot.status === 'OFFLINE') {
      statusBg = 'bg-red-600'
      ringColor = 'ring-red-400'
    }

    const html = `
      <div class="relative flex items-center justify-center cursor-pointer group">
        <div class="w-8 h-8 rounded-full ${statusBg} text-white font-mono text-[10px] font-bold flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
      isSelected ? `ring-4 ring-offset-2 ${ringColor} scale-110` : 'ring-2 ring-white'
    }">
          ${robot.id.split('-')[0]}
        </div>
        <div class="absolute -bottom-4 bg-slate-900/90 text-white font-mono text-[9px] font-semibold px-1.5 py-0.2 rounded shadow-xs whitespace-nowrap">
          ${robot.id}
        </div>
      </div>
    `
    return L.divIcon({
      html,
      className: 'custom-robot-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    })
  }

  // Create custom location node icons
  const createLocationIcon = (loc) => {
    let dotColor = '#94a3b8'
    if (loc.type === 'CHARGER') dotColor = '#f59e0b'
    else if (loc.type === 'CLINICAL') dotColor = '#3b82f6'
    else if (loc.type === 'WAREHOUSE') dotColor = '#8b5cf6'

    const html = `
      <div class="w-2.5 h-2.5 rounded-full border-2 border-white shadow-xs" style="background-color: ${dotColor}"></div>
    `
    return L.divIcon({
      html,
      className: 'custom-loc-icon',
      iconSize: [10, 10],
      iconAnchor: [5, 5],
    })
  }

  return (
    <div className="relative w-full h-[460px] rounded-lg overflow-hidden border border-slate-200 shadow-xs bg-slate-100">
      <MapContainer
        center={defaultCenter}
        zoom={16}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapController robots={robots} fitTrigger={fitCounter} />

        {/* Clean, high-contrast basemap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="grayscale-20 contrast-105"
        />

        {/* 22 Hospital Reference Locations */}
        {HOSPITAL_LOCATIONS.map((loc) => (
          <Marker
            key={loc.id}
            position={loc.coords}
            icon={createLocationIcon(loc)}
          >
            <LeafletTooltip direction="top" offset={[0, -6]} opacity={0.9}>
              <div className="font-sans text-xs">
                <div className="font-semibold text-slate-800">{loc.name}</div>
                <div className="text-[10px] text-slate-500 font-mono">{loc.type}</div>
              </div>
            </LeafletTooltip>
          </Marker>
        ))}

        {/* Robot Fleet Markers */}
        {robots.map((robot) => (
          <Marker
            key={robot.id}
            position={robot.coords}
            icon={createRobotIcon(robot)}
            eventHandlers={{
              click: () => onSelectRobot?.(robot.id),
            }}
          >
            <Popup className="rmms-map-popup">
              <div className="p-3 w-60 space-y-2.5 text-slate-800">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-900">{robot.id}</span>
                    <span className="text-[10px] text-slate-500 font-mono font-medium">{robot.type}</span>
                  </div>
                  <RobotStatusBadge status={robot.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Battery</span>
                    <BatteryIndicator battery={robot.battery} isCharging={robot.status === 'CHARGING'} />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Speed</span>
                    <span className="font-mono font-semibold text-slate-700">{robot.speed} m/s</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Current Mission</span>
                    <span className="font-mono font-semibold text-blue-600">
                      {robot.currentMissionId || 'None (Idle / Staging)'}
                    </span>
                    {robot.progress > 0 && (
                      <div className="mt-1 flex items-center gap-2">
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${robot.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">{robot.progress}%</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Heartbeat:</span>
                  <HeartbeatIndicator lastHeartbeat={robot.lastHeartbeat} />
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Map Controls & Overlays */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => setFitCounter(c => c + 1)}
          className="bg-white/95 backdrop-blur-xs text-slate-700 hover:text-slate-900 p-2 rounded-md shadow-md border border-slate-200 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
          title="Fit fleet and service area into view"
        >
          <Crosshair className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">Fit Fleet</span>
        </button>
      </div>

      {/* Live Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs px-3 py-2 rounded-md shadow-md border border-slate-200 text-xs">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
          Fleet Legend
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-700">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>In Mission</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Charging</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>Offline</span>
          </div>
        </div>
      </div>
    </div>
  )
}
