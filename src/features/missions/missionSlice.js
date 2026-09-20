import { createSlice } from '@reduxjs/toolkit'
import { INITIAL_MISSIONS } from '../../mocks/missions'
import { MISSION_STATUS } from '../../constants/statuses'

const initialState = {
  items: INITIAL_MISSIONS,
  selectedMissionId: null,
  filters: {
    search: '',
    missionType: 'ALL',
    status: 'ALL',
    priority: 'ALL',
  },
  loading: false,
  submitting: false,
  error: null,
  lastCreatedId: null,
}

const missionSlice = createSlice({
  name: 'missions',
  initialState,
  reducers: {
    fetchMissionsRequest: (state) => {
      state.loading = true
      state.error = null
    },
    fetchMissionsSuccess: (state, action) => {
      state.loading = false
      state.items = action.payload
    },
    fetchMissionsFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
    },
    selectMission: (state, action) => {
      state.selectedMissionId = action.payload
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetFilters: (state) => {
      state.filters = initialState.filters
    },
    // Create Mission
    createMissionRequest: (state) => {
      state.submitting = true
      state.error = null
    },
    createMissionSuccess: (state, action) => {
      state.submitting = false
      state.items.unshift(action.payload)
      state.lastCreatedId = action.payload.id
    },
    createMissionFailure: (state, action) => {
      state.submitting = false
      state.error = action.payload
    },
    clearLastCreatedId: (state) => {
      state.lastCreatedId = null
    },
    // Supervisor Priority Override
    overridePriorityRequest: (state) => {
      state.submitting = true
    },
    overridePrioritySuccess: (state, action) => {
      state.submitting = false
      const { missionId, newPriority, reason, user } = action.payload
      const index = state.items.findIndex((m) => m.id === missionId)
      if (index !== -1) {
        state.items[index].priority = newPriority
        state.items[index].priorityOverridden = true
        state.items[index].overrideReason = reason
        state.items[index].overriddenBy = user
        state.items[index].overriddenAt = new Date().toISOString()
      }
    },
    // Operator Assignment Override
    overrideAssignmentRequest: (state) => {
      state.submitting = true
    },
    overrideAssignmentSuccess: (state, action) => {
      state.submitting = false
      const { missionId, robotId, reason, user } = action.payload
      const index = state.items.findIndex((m) => m.id === missionId)
      if (index !== -1) {
        state.items[index].assignedRobotId = robotId
        state.items[index].suggestedRobotId = robotId
        state.items[index].status = MISSION_STATUS.IN_PROGRESS
        state.items[index].assignmentStatus = 'Manually overridden'
        state.items[index].assignmentOverrideReason = reason
        state.items[index].assignmentOverriddenBy = user
      }
    },
  },
  extraReducers: (builder) => {
    // Synchronize active mission progress with telemetry ticker
    builder.addCase('telemetry/tickTelemetry', (state) => {
      const activeMission = state.items.find(
        (m) => m.id === 'MIS-1042' && m.status === MISSION_STATUS.IN_PROGRESS
      )
      if (activeMission) {
        activeMission.progress = activeMission.progress >= 99 ? 45 : activeMission.progress + 1
      }
    })
    // When recovery action REASSIGN is executed from an alert
    builder.addCase('alerts/executeRecoverySuccess', (state, action) => {
      const { recoveryAction } = action.payload
      if (recoveryAction === 'REASSIGN') {
        const mission = state.items.find((m) => m.id === 'MIS-1043')
        if (mission) {
          mission.status = MISSION_STATUS.PENDING
          mission.assignedRobotId = null
          mission.assignmentStatus = 'Reassignment queued'
        }
      }
    })
  },
})

export const {
  fetchMissionsRequest,
  fetchMissionsSuccess,
  fetchMissionsFailure,
  selectMission,
  setFilters,
  resetFilters,
  createMissionRequest,
  createMissionSuccess,
  createMissionFailure,
  clearLastCreatedId,
  overridePriorityRequest,
  overridePrioritySuccess,
  overrideAssignmentRequest,
  overrideAssignmentSuccess,
} = missionSlice.actions

export default missionSlice.reducer
