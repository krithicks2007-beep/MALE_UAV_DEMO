// ============================================================
// TELEMETRY MODELS — Canonical Schema v1.0.0
// Field names MUST match across TypeScript, Mock Adapters,
// Zustand stores, and API definitions. Do NOT rename.
// ============================================================

export interface TelemetryData {
  timestamp: string;          // ISO 8601 UTC string
  frame_id: number;           // Monotonic sequence counter
  rpm: number;                // Engine RPM (e.g. 2850)
  map: number;                // Manifold Absolute Pressure (bar)
  cht: number[];              // Cylinder Head Temperatures [C1,C2,C3,C4] °C
  egt: number[];              // Exhaust Gas Temperatures [C1,C2,C3,C4] °C
  oil_pressure: number;       // Oil pressure (bar)
  oil_temperature: number;    // Oil temperature (°C)
  fuel_flow: number;          // Fuel flow rate (L/h)
  vibration: number;          // Engine vibration magnitude (mm/s)
  battery_voltage: number;    // Electrical system voltage (V)
  alternator_current: number; // Alternator current output (A)
  injection_timing: number;   // Fuel injection timing (°BTDC)
}

export interface EngineConfiguration {
  engine_id: string;                  // e.g. "AERO-PISTON-MALE-01"
  engine_model: string;               // e.g. "TAPAS Pusher Piston"
  cylinder_count: number;             // Default: 4
  telemetry_schema_version: string;   // e.g. "1.0.0"
  unit_system: 'SI' | 'METRIC';
}

/** Context telemetry (optional, may be null if unavailable) */
export interface FlightContext {
  altitude_m: number | null;
  airspeed_kmh: number | null;
  ambient_temp_c: number | null;
  ambient_pressure_hpa: number | null;
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
