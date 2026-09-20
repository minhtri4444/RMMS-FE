import { put, delay, take, race } from 'redux-saga/effects'
import { tickTelemetry } from './telemetrySlice'
import { TELEMETRY_TICK_INTERVAL_MS } from '../../constants/telemetry'

function* telemetryTicker() {
  while (true) {
    yield delay(TELEMETRY_TICK_INTERVAL_MS)
    yield put(tickTelemetry())
  }
}

export default function* telemetrySaga() {
  // Run live ticker loop concurrently
  yield race({
    ticker: telemetryTicker(),
    stop: take('STOP_TELEMETRY_STREAM'),
  })
}
