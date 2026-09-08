// ============================================================
// HEALTH MODELS
// ============================================================

export type EngineState = 'NOMINAL' | 'WARNING' | 'DEGRADED' | 'CRITICAL';

export interface SubsystemHealth {
  mechanical: number;    // 0–100
  thermal: number;       // 0–100
  lubrication: number;   // 0–100
  combustion: number;    // 0–100
}

export interface HealthState {
  index: number;               // Overall health index 0–100
  engine_state: EngineState;
  subsystems: SubsystemHealth;
  degradation_trend: number[]; // Array of historical health index values
  last_updated: string;        // ISO 8601
}
