// ============================================================
// MISSION MODELS
// ============================================================

export type MissionStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'ABORTED';
export type MissionPhase = 'TAKEOFF' | 'CLIMB' | 'CRUISE' | 'HIGH_ALT' | 'RETURN' | 'LANDED';

export interface AnomalyEvent {
  id: string;
  timestamp: string;     // ISO 8601
  mission_time_s: number; // Seconds into mission
  timeline_pct: number;  // 0–100 position on scrubber
  title: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
}

export interface MissionWaypoint {
  id: string;
  label: string;
  timeline_pct: number;  // 0–100
  completed: boolean;
  active: boolean;
}

export interface MissionData {
  id: string;
  name: string;
  status: MissionStatus;
  current_phase: MissionPhase;
  current_phase_label: string;
  timeline_pct: number;        // 0–100 replay position
  duration_s: number;
  elapsed_s: number;
  waypoints: MissionWaypoint[];
  anomaly_events: AnomalyEvent[];
}

export interface ReplayState {
  is_playing: boolean;
  speed: number;         // 1x, 2x, 4x
  position_pct: number;  // 0–100
  locked: boolean;
}
