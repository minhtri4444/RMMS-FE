import { takeLatest, put, delay } from 'redux-saga/effects'
import {
  acknowledgeAlertRequest,
  acknowledgeAlertSuccess,
  resolveAlertRequest,
  resolveAlertSuccess,
  executeRecoveryRequest,
  executeRecoverySuccess,
} from './alertSlice'

function* handleAcknowledge(action) {
  yield delay(350)
  yield put(acknowledgeAlertSuccess(action.payload))
}

function* handleResolve(action) {
  yield delay(450)
  yield put(resolveAlertSuccess(action.payload))
}

function* handleRecovery(action) {
  yield delay(400)
  yield put(executeRecoverySuccess(action.payload))
}

export default function* alertSaga() {
  yield takeLatest(acknowledgeAlertRequest.type, handleAcknowledge)
  yield takeLatest(resolveAlertRequest.type, handleResolve)
  yield takeLatest(executeRecoveryRequest.type, handleRecovery)
}
