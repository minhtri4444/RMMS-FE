import { ROBOT_TYPES, ROBOT_TYPE_CONFIG } from '../constants/robotTypes'
import { ROBOT_STATUS } from '../constants/statuses'

export const INITIAL_ROBOTS = [
  {
    id: 'MED-01',
    name: 'Med Cart 01',
    type: ROBOT_TYPES.MED_CART,
    typeConfig: ROBOT_TYPE_CONFIG[ROBOT_TYPES.MED_CART],
    status: ROBOT_STATUS.IN_PROGRESS,
    battery: 18, // 18% triggers Alert A-203 (Low Battery Warning)
    speed: 0.8,
    currentMissionId: 'MIS-1042',
    progress: 62,
    coords: [10.7766, 106.7016],
    heading: 45,
    nearestLocation: 'Corridor Node Delta',
    lastHeartbeat: Date.now() - 1000,
    isHealthy: true,
    totalDistanceMeters: 4120,
    firmware: 'v2.4.1-arm',
  },
  {
    id: 'SUP-01',
    name: 'Supply Cart 01',
    type: ROBOT_TYPES.SUPPLY_CART,
    typeConfig: ROBOT_TYPE_CONFIG[ROBOT_TYPES.SUPPLY_CART],
    status: ROBOT_STATUS.OFFLINE, // Exceeded 5s offline threshold, triggers Alert A-204
    battery: 43,
    speed: 0.0,
    currentMissionId: null,
    progress: 0,
    coords: [10.7772, 106.7008],
    heading: 180,
    nearestLocation: 'Charging Station 2',
    lastHeartbeat: Date.now() - 8000, // 8s ago (> 5s threshold)
    isHealthy: false,
    totalDistanceMeters: 8940,
    firmware: 'v2.3.9-arm',
  },
  {
    id: 'PAT-01',
    name: 'Patrol Bot 01',
    type: ROBOT_TYPES.PATROL_BOT,
    typeConfig: ROBOT_TYPE_CONFIG[ROBOT_TYPES.PATROL_BOT],
    status: ROBOT_STATUS.AVAILABLE,
    battery: 91,
    speed: 0.0,
    currentMissionId: null,
    progress: 0,
    coords: [10.7758, 106.7010],
    heading: 90,
    nearestLocation: 'Corridor Node Alpha',
    lastHeartbeat: Date.now() - 1000,
    isHealthy: true,
    totalDistanceMeters: 14200,
    firmware: 'v3.1.0-lidar',
  },
]
