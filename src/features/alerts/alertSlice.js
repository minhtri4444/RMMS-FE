import { createSlice } from '@reduxjs/toolkit'
import { INITIAL_ALERTS } from '../../mocks/alerts'
import { ALERT_STATUS } from '../../constants/statuses'

const initialState = {
  items: INITIAL_ALERTS,
  selectedAlertId: 'A-204',
  filters: {
    search: '',
    severity: 'ALL',
    status: 'ALL',
    robotId: 'ALL',
  },
  loading: false,
  submitting: false,
  error: null,
}

const alertSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    selectAlert: (state, action) => {
      state.selectedAlertId = action.payload
    },
    setAlertFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetAlertFilters: (state) => {
      state.filters = initialState.filters
    },
    // Acknowledge
    acknowledgeAlertRequest: (state) => {
      state.submitting = true
    },
    acknowledgeAlertSuccess: (state, action) => {
      state.submitting = false
      const { alertId, user } = action.payload
      const alert = state.items.find(a => a.id === alertId)
      if (alert && alert.status === ALERT_STATUS.ACTIVE) {
        alert.status = ALERT_STATUS.ACKNOWLEDGED
        alert.auditLog.push({
          timestamp: new Date().toISOString(),
          action: 'ACKNOWLEDGED',
          user: user || 'Operator',
        })
      }
    },
    // Resolve
    resolveAlertRequest: (state) => {
      state.submitting = true
    },
    resolveAlertSuccess: (state, action) => {
      state.submitting = false
      const { alertId, resolutionNote, recoveryAction, user } = action.payload
      const alert = state.items.find(a => a.id === alertId)
      if (alert) {
        alert.status = ALERT_STATUS.RESOLVED
        alert.resolvedAt = new Date().toISOString()
        alert.resolutionNote = resolutionNote
        alert.selectedRecoveryAction = recoveryAction
        alert.auditLog.push({
          timestamp: new Date().toISOString(),
          action: 'RESOLVED',
          note: resolutionNote,
          recoveryAction,
          user: user || 'Operator',
        })
      }
    },
    // Quick Recovery Action
    executeRecoveryRequest: (state) => {
      state.submitting = true
    },
    executeRecoverySuccess: (state, action) => {
      state.submitting = false
      const { alertId, recoveryAction, user } = action.payload
      const alert = state.items.find(a => a.id === alertId)
      if (alert) {
        alert.auditLog.push({
          timestamp: new Date().toISOString(),
          action: `RECOVERY_${recoveryAction}`,
          user: user || 'Operator',
        })
      }
    },
  },
})

export const {
  selectAlert,
  setAlertFilters,
  resetAlertFilters,
  acknowledgeAlertRequest,
  acknowledgeAlertSuccess,
  resolveAlertRequest,
  resolveAlertSuccess,
  executeRecoveryRequest,
  executeRecoverySuccess,
} = alertSlice.actions

export default alertSlice.reducer
