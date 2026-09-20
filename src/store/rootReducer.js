import { combineReducers } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import telemetryReducer from '../features/dashboard/telemetrySlice'
import missionReducer from '../features/missions/missionSlice'
import alertReducer from '../features/alerts/alertSlice'

const rootReducer = combineReducers({
  auth: authReducer,
  telemetry: telemetryReducer,
  missions: missionReducer,
  alerts: alertReducer,
})

export default rootReducer
