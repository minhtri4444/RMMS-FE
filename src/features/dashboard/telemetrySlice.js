import { createSlice } from '@reduxjs/toolkit'
import { INITIAL_ROBOTS } from '../../mocks/robots'
import { ROBOT_STATUS } from '../../constants/statuses'

const initialState = {
  robots: INITIAL_ROBOTS,
  selectedRobotId: 'MED-01',
  connectionStatus: 'CONNECTED', // 'CONNECTED' | 'RECONNECTING' | 'STALE'
  lastSyncAt: Date.now(),
  loading: false,
  error: null,
}

const telemetrySlice = createSlice({
  name: 'telemetry',
  initialState,
  reducers: {
    fetchRobotsRequest: (state) => {
      state.loading = true
      state.error = null
    },
    fetchRobotsSuccess: (state, action) => {
      state.loading = false
      state.robots = action.payload
      state.lastSyncAt = Date.now()
    },
    fetchRobotsFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
    },
    selectRobot: (state, action) => {
      state.selectedRobotId = action.payload
    },
    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload
    },
    tickTelemetry: (state) => {
      // 1-second controlled ticker interval (safe for 5s offline threshold)
      state.lastSyncAt = Date.now()
      state.robots = state.robots.map((robot) => {
        let { battery, progress, speed, coords, status, lastHeartbeat } = robot

        // Only online robots update their heartbeat
        if (status !== ROBOT_STATUS.OFFLINE) {
          lastHeartbeat = Date.now()
        }

        if (robot.id === 'MED-01' && status === ROBOT_STATUS.IN_PROGRESS) {
          // Advance progress slightly every few ticks
          progress = progress >= 99 ? 45 : progress + 1
          speed = +(0.7 + (Math.random() > 0.5 ? 0.1 : -0.1)).toFixed(1)
          // Micro position jitter along corridor
          coords = [
            coords[0] + (Math.random() - 0.5) * 0.00002,
            coords[1] + (Math.random() - 0.5) * 0.00002,
          ]
        } else if (robot.id === 'SUP-01' && status === ROBOT_STATUS.CHARGING) {
          speed = 0.0
        }

        return {
          ...robot,
          battery,
          progress,
          speed,
          coords,
          lastHeartbeat,
        }
      })
    },
    refreshTelemetry: (state) => {
      state.lastSyncAt = Date.now()
    },
    reconnectRobot: (state, action) => {
      const { robotId, newStatus = ROBOT_STATUS.CHARGING } = action.payload
      const robot = state.robots.find((r) => r.id === robotId)
      if (robot) {
        robot.status = newStatus
        robot.lastHeartbeat = Date.now()
        robot.isHealthy = true
      }
    },
    assignRobot: (state, action) => {
      const { robotId, missionId } = action.payload
      const robot = state.robots.find((r) => r.id === robotId)
      if (robot) {
        robot.status = ROBOT_STATUS.IN_PROGRESS
        robot.currentMissionId = missionId
        robot.progress = 0
      }
    },
    releaseRobot: (state, action) => {
      const { robotId } = action.payload
      const robot = state.robots.find((r) => r.id === robotId)
      if (robot) {
        robot.status = ROBOT_STATUS.AVAILABLE
        robot.currentMissionId = null
        robot.progress = 0
      }
    },
  },
  extraReducers: (builder) => {
    // When assignment is overridden in Mission Queue
    builder.addCase('missions/overrideAssignmentSuccess', (state, action) => {
      const { robotId, missionId } = action.payload
      const robot = state.robots.find((r) => r.id === robotId)
      if (robot) {
        robot.status = ROBOT_STATUS.IN_PROGRESS
        robot.currentMissionId = missionId
      }
    })
    // When alert A-204 (SUP-01 offline) is resolved or recovery action executed
    builder.addCase('alerts/resolveAlertSuccess', (state, action) => {
      if (action.payload.alertId === 'A-204') {
        const sup = state.robots.find((r) => r.id === 'SUP-01')
        if (sup) {
          sup.status = ROBOT_STATUS.CHARGING
          sup.lastHeartbeat = Date.now()
          sup.isHealthy = true
        }
      }
    })
    builder.addCase('alerts/executeRecoverySuccess', (state, action) => {
      if (action.payload.alertId === 'A-204') {
        const sup = state.robots.find((r) => r.id === 'SUP-01')
        if (sup) {
          sup.status = ROBOT_STATUS.CHARGING
          sup.lastHeartbeat = Date.now()
          sup.isHealthy = true
        }
      }
    })
  },
})

export const {
  fetchRobotsRequest,
  fetchRobotsSuccess,
  fetchRobotsFailure,
  selectRobot,
  setConnectionStatus,
  tickTelemetry,
  refreshTelemetry,
  reconnectRobot,
  assignRobot,
  releaseRobot,
} = telemetrySlice.actions

export default telemetrySlice.reducer
