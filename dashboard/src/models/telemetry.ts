// ============================================================
// TELEMETRY MODELS — Canonical Schema v0.2
// SI-consistent telemetry contract.
// Field names MUST match the live telemetry API.
// ============================================================

export interface TelemetryData {
  timestamp: string;          // ISO 8601 UTC string
  frame_id: number;           // Monotonic sequence counter
  rpm: number;                // Engine RPM (e.g. 2850)
  map: number;                // Manifold Absolute Pressure (Pa)
  cht: number[];              // Cylinder Head Temperatures [C1,C2,C3,C4] K
  egt: number[];              // Exhaust Gas Temperatures [C1,C2,C3,C4] K
  oil_pressure: number;       // Oil pressure (Pa)
  oil_temperature: number;    // Oil temperature (K)
  fuel_flow: number;          // Fuel flow rate (L/h)
  vibration: number;          // Engine vibration acceleration magnitude (m/s²)
  battery_voltage: number;    // Electrical system voltage (V)
  alternator_current: number; // Alternator current output (A)
  injection_timing: number;   // Fuel injection timing (°BTDC)
}

export interface EngineConfiguration {
  engine_id: string;                  // e.g. "AERO-PISTON-MALE-01"
  engine_model: string;               // e.g. "TAPAS Pusher Piston"
  cylinder_count: number;             // Default: 4
  telemetry_schema_version: string;   // e.g. "1.0.0"
  unit_system: 'METRIC' | 'IMPERIAL';
}

/** Context telemetry (optional, may be null if unavailable) */
export interface FlightContext {
  altitude_m: number | null;
  airspeed_kmh?: number | null;
  airspeed_mps?: number | null;
  ambient_temp_c?: number | null;
  ambient_temperature_k?: number | null;
  ambient_pressure_hpa?: number | null;
  ambient_pressure_pa?: number | null;
  fuel_quantity_pct: number | null;
  mission_phase: string | null;
  throttle_pct: number | null;
}

/** Historical telemetry sample for trend buffers */
export interface TelemetrySample {
  t: number;         // Unix timestamp in seconds
  value: number;
}

export type TelemetryChannel = keyof Omit<TelemetryData, 'timestamp' | 'frame_id'>;
