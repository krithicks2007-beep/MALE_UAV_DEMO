// ============================================================
// ENGINE / TWIN VISUALIZATION MODELS
// ============================================================

export type ThermalState = 'NOMINAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
export type CombustionState = 'NOMINAL' | 'ABNORMAL' | 'MISFIRE';
export type LubricationState = 'NOMINAL' | 'DEGRADED' | 'CRITICAL';
export type VibrationState = 'NOMINAL' | 'ELEVATED' | 'HIGH';

/** Normalized state consumed by the 3D Twin renderer.
 *  The renderer maps these states to visual behavior.
 *  It does NOT decide the diagnosis — that belongs to DiagnosticsData.
 */
export interface TwinVisualizationState {
  engine_state: 'NOMINAL' | 'WARNING' | 'DEGRADED' | 'CRITICAL';
  health_index: number;
  rpm: number;
  thermal_state: ThermalState;
  combustion_state: CombustionState;
  lubrication_state: LubricationState;
  vibration_state: VibrationState;
  active_fault: string | null;
  affected_cylinders: number[];  // 0-indexed cylinder numbers
  twin_sync_status: 'SYNCED' | 'DELAYED' | 'DISCONNECTED';
  last_sync_timestamp: string;
  model_version: string;
}

export type ScenarioId =
  | 'NORMAL'
  | 'MISFIRE'
  | 'INJECTOR_ABNORMALITY'
  | 'LUBRICATION_ISSUE'
  | 'OVERHEATING'
  | 'SENSOR_DRIFT'
  | 'ABNORMAL_VIBRATION';

export interface ScenarioDefinition {
  id: ScenarioId;
  name: string;
  description: string;
  severity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affected_subsystem: string | null;
}

export const SCENARIO_DEFINITIONS: ScenarioDefinition[] = [
  { id: 'NORMAL', name: 'Normal', description: 'Engine operating within all nominal parameters.', severity: 'NONE', affected_subsystem: null },
  { id: 'MISFIRE', name: 'Misfire', description: 'Combustion abnormality in Cylinder 2. RPM disturbance and EGT imbalance.', severity: 'MEDIUM', affected_subsystem: 'COMBUSTION' },
  { id: 'INJECTOR_ABNORMALITY', name: 'Injector Abnormality', description: 'Fuel injector deviation on Cylinder 3. Thermal and combustion residuals elevated.', severity: 'HIGH', affected_subsystem: 'FUEL_SYSTEM' },
  { id: 'LUBRICATION_ISSUE', name: 'Lubrication Issue', description: 'Oil pressure degradation. Engine lubrication health compromised.', severity: 'HIGH', affected_subsystem: 'LUBRICATION' },
  { id: 'OVERHEATING', name: 'Overheating', description: 'CHT and EGT elevated across all cylinders. Thermal margin reducing.', severity: 'HIGH', affected_subsystem: 'THERMAL' },
  { id: 'SENSOR_DRIFT', name: 'Sensor Drift', description: 'EGT sensor on Cylinder 1 exhibiting bias drift. Physical engine unaffected.', severity: 'MEDIUM', affected_subsystem: 'SENSORS' },
  { id: 'ABNORMAL_VIBRATION', name: 'Abnormal Vibration', description: 'Engine vibration magnitude elevated above baseline.', severity: 'MEDIUM', affected_subsystem: 'MECHANICAL' },
];
