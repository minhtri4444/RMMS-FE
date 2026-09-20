import { takeLatest, put, delay } from 'redux-saga/effects'
import {
  createMissionRequest,
  createMissionSuccess,
  createMissionFailure,
  overridePriorityRequest,
  overridePrioritySuccess,
  overrideAssignmentRequest,
  overrideAssignmentSuccess,
} from './missionSlice'
import { MISSION_TYPE_CONFIG } from '../../constants/missionTypes'
import { MISSION_STATUS } from '../../constants/statuses'

function* handleCreateMission(action) {
  try {
    yield delay(600) // Simulated backend validation & AI priority scoring
    const payload = action.payload

    const config = MISSION_TYPE_CONFIG[payload.type] || {}
    const defaultPriority = config.defaultPriority || 'MEDIUM'

    // Compute AI Score heuristic
    let aiScore = 50
    if (payload.type === 'STAT_MEDICINE') aiScore = 95
    else if (payload.type === 'SPECIMEN_TRANSPORT') aiScore = 80
    else if (payload.type === 'ROUTINE_SUPPLY') aiScore = 60
    else aiScore = 40

    // Build candidates eligibility based on mission type and requirements
    let suggestedRobot = null
    const candidates = [
      {
        robotId: 'MED-01',
        type: 'MED_CART',
        status: 'AVAILABLE',
        battery: 80,
        eligible: payload.type === 'STAT_MEDICINE' || payload.type === 'SPECIMEN_TRANSPORT',
        reason: payload.type === 'STAT_MEDICINE' || payload.type === 'SPECIMEN_TRANSPORT'
          ? 'Secure lockable compartment match ✓'
          : 'Reserved for medical priority deliveries',
        distanceMeters: 25,
      },
      {
        robotId: 'SUP-01',
        type: 'SUPPLY_CART',
        status: 'CHARGING',
        battery: 43,
        eligible: payload.type === 'ROUTINE_SUPPLY' || payload.type === 'SPECIMEN_TRANSPORT' || payload.type === 'STOCK_CHECK',
        reason: payload.type === 'STAT_MEDICINE'
          ? 'Locked medicine compartment required (Not eligible)'
          : 'High payload capacity match (100 kg) ✓',
        distanceMeters: 34,
      },
      {
        robotId: 'PAT-01',
        type: 'PATROL_BOT',
        status: 'AVAILABLE',
        battery: 91,
        eligible: payload.type === 'CORRIDOR_PATROL' || payload.type === 'STOCK_CHECK',
        reason: payload.type === 'CORRIDOR_PATROL' || payload.type === 'STOCK_CHECK'
          ? 'Autonomous sensor array match ✓'
          : 'Cargo transport not supported by Patrol Bot',
        distanceMeters: 12,
      },
    ]

    const firstEligible = candidates.find(c => c.eligible)
    if (firstEligible) {
      suggestedRobot = firstEligible.robotId
    }

    const newMission = {
      id: `MIS-${Math.floor(1050 + Math.random() * 900)}`,
      type: payload.type,
      priority: defaultPriority,
      status: MISSION_STATUS.PENDING,
      pickupLocation: payload.pickupLocation,
      destinationLocation: payload.destinationLocation || null,
      deadline: payload.deadline,
      description: payload.description,
      aiScore,
      suggestedRobotId: suggestedRobot,
      assignedRobotId: null, // As required: pending AI scheduler evaluation
      assignmentStatus: 'Pending assignment',
      createdAt: new Date().toISOString(),
      aiExplanation: {
        score: aiScore,
        factors: [
          { name: 'Mission type', value: defaultPriority, weight: 40 },
          { name: 'Time to deadline', value: 'Calculated from SLA', weight: 30 },
          { name: 'Waiting time', value: 'New submission', weight: 15 },
          { name: 'Area / context', value: 'Normal priority zone', weight: 15 },
        ],
        reason: `AI Scheduler queued as ${defaultPriority} based on category rules and remaining window.`,
      },
      candidates,
    }

    yield put(createMissionSuccess(newMission))
  } catch (error) {
    yield put(createMissionFailure(error.message || 'Failed to create mission'))
  }
}

function* handleOverridePriority(action) {
  yield delay(400)
  yield put(overridePrioritySuccess(action.payload))
}

function* handleOverrideAssignment(action) {
  yield delay(400)
  yield put(overrideAssignmentSuccess(action.payload))
}

export default function* missionSaga() {
  yield takeLatest(createMissionRequest.type, handleCreateMission)
  yield takeLatest(overridePriorityRequest.type, handleOverridePriority)
  yield takeLatest(overrideAssignmentRequest.type, handleOverrideAssignment)
}
