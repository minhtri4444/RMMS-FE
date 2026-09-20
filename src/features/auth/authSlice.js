import { createSlice } from '@reduxjs/toolkit'
import { ROLES } from '../../constants/permissions'

const DEMO_USERS = {
  'admin@rmms.local': {
    id: 'USR-01',
    email: 'admin@rmms.local',
    name: 'Dr. Sarah Chen',
    role: ROLES.ADMIN,
    department: 'Hospital Fleet Administration',
    avatar: 'SC',
  },
  'operator@rmms.local': {
    id: 'USR-02',
    email: 'operator@rmms.local',
    name: 'Alex Rivera',
    role: ROLES.OPERATOR,
    department: 'Control Room Operations',
    avatar: 'AR',
  },
  'supervisor@rmms.local': {
    id: 'USR-03',
    email: 'supervisor@rmms.local',
    name: 'Elena Rostova',
    role: ROLES.SUPERVISOR,
    department: 'Clinical Logistics & Dispatch',
    avatar: 'ER',
  },
}

// Check localStorage for persisted session
const storedUser = (() => {
  try {
    const raw = localStorage.getItem('rmms_user')
    return raw ? JSON.parse(raw) : DEMO_USERS['operator@rmms.local'] // Default to operator for quick evaluation if desired, or null
  } catch {
    return DEMO_USERS['operator@rmms.local']
  }
})()

const initialState = {
  user: storedUser,
  isAuthenticated: !!storedUser,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginRequest: (state) => {
      state.loading = true
      state.error = null
    },
    loginSuccess: (state, action) => {
      state.loading = false
      state.isAuthenticated = true
      state.user = action.payload
      state.error = null
      try {
        localStorage.setItem('rmms_user', JSON.stringify(action.payload))
      } catch (e) {
        console.error(e)
      }
    },
    loginFailure: (state, action) => {
      state.loading = false
      state.isAuthenticated = false
      state.error = action.payload
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.loading = false
      state.error = null
      try {
        localStorage.removeItem('rmms_user')
      } catch (e) {
        console.error(e)
      }
    },
    clearAuthError: (state) => {
      state.error = null
    },
  },
})

export const { loginRequest, loginSuccess, loginFailure, logout, clearAuthError } = authSlice.actions
export { DEMO_USERS }
export default authSlice.reducer
