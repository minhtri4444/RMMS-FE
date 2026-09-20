import { takeLatest, put, delay } from 'redux-saga/effects'
import { loginRequest, loginSuccess, loginFailure, DEMO_USERS } from './authSlice'

function* handleLogin(action) {
  const { email, password } = action.payload
  yield delay(500) // Realistic control room network latency

  if (!email || !password) {
    yield put(loginFailure('Email and password are required.'))
    return
  }

  const user = DEMO_USERS[email.trim().toLowerCase()]
  if (user) {
    yield put(loginSuccess(user))
  } else {
    yield put(loginFailure('Invalid email or password. Please use a demo control room account.'))
  }
}

export default function* authSaga() {
  yield takeLatest(loginRequest.type, handleLogin)
}
