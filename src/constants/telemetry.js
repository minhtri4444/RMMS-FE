// Centralized Realtime & Offline Thresholds for RMMS Fleet
export const HEARTBEAT_OFFLINE_THRESHOLD_MS = 5000 // 5 seconds maximum heartbeat age before OFFLINE
export const HEARTBEAT_WARN_THRESHOLD_MS = 3000    // 3 seconds warning threshold
export const TELEMETRY_TICK_INTERVAL_MS = 1000     // 1 second controlled ticker interval (safe for 5s threshold)
