export const ROBOT_TYPES = {
  MED_CART: 'MED_CART',
  SUPPLY_CART: 'SUPPLY_CART',
  PATROL_BOT: 'PATROL_BOT',
}

export const ROBOT_TYPE_CONFIG = {
  [ROBOT_TYPES.MED_CART]: {
    label: 'Med Cart',
    maxPayloadKg: 30,
    hasLockedCompartment: true,
    description: 'Medicine transport, max 30 kg, lockable compartments',
    color: 'blue',
  },
  [ROBOT_TYPES.SUPPLY_CART]: {
    label: 'Supply Cart',
    maxPayloadKg: 100,
    hasLockedCompartment: false,
    description: 'Supplies / linen, max 100 kg',
    color: 'emerald',
  },
  [ROBOT_TYPES.PATROL_BOT]: {
    label: 'Patrol Bot',
    maxPayloadKg: 0,
    hasLockedCompartment: false,
    description: 'Patrol / monitoring, no cargo transport',
    color: 'amber',
  },
}
