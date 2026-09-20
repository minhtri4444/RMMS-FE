import { all, fork } from 'redux-saga/effects'
import authSaga from '../features/auth/authSaga'
import telemetrySaga from '../features/dashboard/telemetrySaga'
import missionSaga from '../features/missions/missionSaga'
import alertSaga from '../features/alerts/alertSaga'

export default function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(telemetrySaga),
    fork(missionSaga),
    fork(alertSaga),
  ])
}
