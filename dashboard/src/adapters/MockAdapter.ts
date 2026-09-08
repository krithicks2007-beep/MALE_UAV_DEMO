// ============================================================
// MOCK ADAPTER — Deterministic scenario-aware telemetry generator
// Implements all adapter interfaces. The UI never knows this is mock.
// Physics/scenario logic lives HERE, never in UI components.
// ============================================================

import type { TelemetryData, FlightContext } from '../models/telemetry';
import type { HealthState } from '../models/health';
import type { DiagnosticsData, TwinAnalysisData } from '../models/diagnostics';
import type { Alert } from '../models/alerts';
import type { MissionData } from '../models/mission';
import type { TwinVisualizationState, ScenarioId } from '../models/engine';
import { useTelemetryStore } from '../stores/telemetryStore';
import { useHealthStore } from '../stores/healthStore';
import { useDiagnosticsStore } from '../stores/diagnosticsStore';
import { useAlertStore } from '../stores/alertStore';
import { useMissionStore } from '../stores/missionStore';
import { useTwinStore } from '../stores/twinStore';
import { useConnectionStore } from '../stores/connectionStore';

let intervalId: ReturnType<typeof setInterval> | null = null;
let frameId = 0;
let currentScenario: ScenarioId = 'NORMAL';
let tick = 0;

// ── Noise helpers ──────────────────────────────────────────────────────────────
const jitter = (base: number, amplitude: number) =>
  base + (Math.random() - 0.5) * 2 * amplitude;

const sine = (t: number, freq: number, amp: number) =>
  Math.sin(t * freq) * amp;

// ── Scenario telemetry generators ─────────────────────────────────────────────
function generateTelemetry(scenario: ScenarioId, t: number): TelemetryData {
  const base: TelemetryData = {
    timestamp: new Date().toISOString(),
    frame_id: ++frameId,
    rpm: jitter(2850, 30) + sine(t, 0.3, 25),
    map: jitter(1.38, 0.02),
    cht: [
      jitter(178, 3), jitter(181, 3), jitter(176, 3), jitter(180, 3),
    ],
    egt: [
      jitter(692, 8), jitter(698, 8), jitter(689, 8), jitter(695, 8),
    ],
    oil_pressure: jitter(4.2, 0.08),
    oil_temperature: jitter(96, 1.5),
    fuel_flow: jitter(18.2, 0.3),
    vibration: jitter(2.4, 0.15),
    battery_voltage: jitter(28.4, 0.1),
    alternator_current: jitter(12.2, 0.4),
    injection_timing: jitter(18.5, 0.2),
  };

  switch (scenario) {
    case 'MISFIRE':
      base.cht[1] = jitter(155, 6); // Cylinder 2 CHT drops (incomplete combustion)
      base.egt[1] = jitter(620, 15);
      base.rpm = jitter(2760, 60) + sine(t, 2, 40);
      base.vibration = jitter(4.8, 0.4);
      break;

    case 'INJECTOR_ABNORMALITY':
      base.cht[2] = jitter(205, 6); // Cylinder 3 overheating
      base.egt[2] = jitter(748, 12);
      base.fuel_flow = jitter(21.4, 0.5);
      base.injection_timing = jitter(22.5, 0.5);
      break;

    case 'LUBRICATION_ISSUE':
      base.oil_pressure = jitter(2.6, 0.2);
      base.oil_temperature = jitter(118, 3);
      break;

    case 'OVERHEATING':
      base.cht = base.cht.map(v => jitter(v + 38, 5));
      base.egt = base.egt.map(v => jitter(v + 52, 10));
      break;

    case 'SENSOR_DRIFT':
      base.egt[0] = jitter(750, 8); // EGT sensor 1 biased high (sensor fault, not engine)
      break;

    case 'ABNORMAL_VIBRATION':
      base.vibration = jitter(8.6, 0.8) + Math.abs(sine(t, 1.5, 2));
      base.rpm = jitter(2840, 50) + sine(t, 1.2, 35);
      break;
  }

  return base;
}

function generateHealth(scenario: ScenarioId): HealthState {
  const healthMap: Record<ScenarioId, Partial<HealthState['subsystems']> & { index: number }> = {
    NORMAL:               { index: 94, mechanical: 96, thermal: 91, lubrication: 95, combustion: 92 },
    MISFIRE:              { index: 74, mechanical: 85, thermal: 88, lubrication: 95, combustion: 62 },
    INJECTOR_ABNORMALITY: { index: 71, mechanical: 90, thermal: 75, lubrication: 94, combustion: 68 },
    LUBRICATION_ISSUE:    { index: 68, mechanical: 88, thermal: 90, lubrication: 55, combustion: 90 },
    OVERHEATING:          { index: 65, mechanical: 88, thermal: 52, lubrication: 82, combustion: 78 },
    SENSOR_DRIFT:         { index: 88, mechanical: 96, thermal: 91, lubrication: 95, combustion: 92 },
    ABNORMAL_VIBRATION:   { index: 76, mechanical: 68, thermal: 91, lubrication: 92, combustion: 88 },
  };
  const h = healthMap[scenario];
  return {
    index: h.index + (Math.random() - 0.5) * 2,
    engine_state:
      h.index >= 90 ? 'NOMINAL' :
      h.index >= 75 ? 'WARNING' :
      h.index >= 60 ? 'DEGRADED' : 'CRITICAL',
    subsystems: {
      mechanical:  h.mechanical!,
      thermal:     h.thermal!,
      lubrication: h.lubrication!,
      combustion:  h.combustion!,
    },
    degradation_trend: Array.from({ length: 20 }, (_, i) => h.index + (20 - i) * 0.06 + (Math.random() - 0.5)),
    last_updated: new Date().toISOString(),
  };
}

function generateDiagnostics(scenario: ScenarioId): DiagnosticsData {
  const diagMap: Record<ScenarioId, Partial<DiagnosticsData>> = {
    NORMAL:               { anomaly_score: 0.04, primary_fault: 'NONE', confidence: 0, severity: 'NOMINAL', degradation_status: 'NOMINAL', rul_value: 1240, rul_confidence: 87, failure_risk_pct: 0.4, evidence: ['All parameters within nominal bounds'] },
    MISFIRE:              { anomaly_score: 0.72, primary_fault: 'CYLINDER_MISFIRE', confidence: 87, severity: 'HIGH', degradation_status: 'MODERATE', rul_value: 840, rul_confidence: 72, failure_risk_pct: 8.4, evidence: ['CHT Cylinder 2 low (-23°C vs expected)', 'EGT Cylinder 2 low (-72°C vs expected)', 'RPM instability ±40 RPM', 'Vibration elevated +100%'] },
    INJECTOR_ABNORMALITY: { anomaly_score: 0.82, primary_fault: 'INJECTOR_ABNORMALITY', confidence: 91, severity: 'HIGH', degradation_status: 'MODERATE', rul_value: 760, rul_confidence: 68, failure_risk_pct: 3.2, evidence: ['EGT Cylinder 3 elevated (+56°C)', 'CHT Cylinder 3 elevated (+27°C)', 'Fuel flow above nominal (+3.2 L/h)', 'Injection timing shifted +4°'] },
    LUBRICATION_ISSUE:    { anomaly_score: 0.68, primary_fault: 'LUBRICATION_PRESSURE_LOW', confidence: 89, severity: 'HIGH', degradation_status: 'MODERATE', rul_value: 620, rul_confidence: 75, failure_risk_pct: 12.1, evidence: ['Oil pressure below nominal (2.6 bar vs 4.2 bar nominal)', 'Oil temperature elevated (+22°C)'] },
    OVERHEATING:          { anomaly_score: 0.76, primary_fault: 'OVERHEATING', confidence: 93, severity: 'HIGH', degradation_status: 'MODERATE', rul_value: 540, rul_confidence: 61, failure_risk_pct: 18.6, evidence: ['CHT all cylinders elevated (+38°C)', 'EGT all cylinders elevated (+52°C)', 'Thermal safety margin reduced'] },
    SENSOR_DRIFT:         { anomaly_score: 0.38, primary_fault: 'SENSOR_DRIFT_EGT_C1', confidence: 76, severity: 'WARNING', degradation_status: 'SLIGHT', rul_value: 1180, rul_confidence: 82, failure_risk_pct: 1.2, evidence: ['EGT Sensor 1 bias drift detected (+58°C vs cross-channel)', 'Physical engine thermal state nominal', 'Sensor channel discrepancy exceeds calibration threshold'] },
    ABNORMAL_VIBRATION:   { anomaly_score: 0.61, primary_fault: 'ABNORMAL_VIBRATION', confidence: 84, severity: 'HIGH', degradation_status: 'MODERATE', rul_value: 680, rul_confidence: 70, failure_risk_pct: 6.8, evidence: ['Vibration magnitude elevated (+260% baseline)', 'RPM instability correlated with vibration frequency', 'Mechanical subsystem health degraded'] },
  };
  const d = diagMap[scenario];
  return {
    anomaly_score: d.anomaly_score! + (Math.random() - 0.5) * 0.02,
    primary_fault: d.primary_fault!,
    confidence: d.confidence!,
    severity: d.severity!,
    degradation_status: d.degradation_status!,
    rul_value: d.rul_value!,
    rul_unit: 'HOURS',
    rul_confidence: d.rul_confidence!,
    evidence: d.evidence!,
    failure_risk_pct: d.failure_risk_pct!,
    last_updated: new Date().toISOString(),
  };
}

function generateTwinAnalysis(scenario: ScenarioId, telemetry: TelemetryData): TwinAnalysisData {
  // Expected values are based on nominal physics model
  const expected_egt_avg = 695;
  const expected_cht_avg = 180;
  const actual_egt_avg = telemetry.egt.reduce((a, b) => a + b, 0) / telemetry.egt.length;
  const actual_cht_avg = telemetry.cht.reduce((a, b) => a + b, 0) / telemetry.cht.length;

  return {
    expected: {
      rpm: 2850,
      map: 1.38,
      cht_avg: expected_cht_avg,
      egt_avg: expected_egt_avg,
      oil_pressure: 4.2,
      oil_temperature: 94,
      vibration: 2.4,
    },
    residuals: {
      rpm: telemetry.rpm - 2850,
      map: parseFloat((telemetry.map - 1.38).toFixed(3)),
      cht_avg: parseFloat((actual_cht_avg - expected_cht_avg).toFixed(1)),
      egt_avg: parseFloat((actual_egt_avg - expected_egt_avg).toFixed(1)),
      oil_pressure: parseFloat((telemetry.oil_pressure - 4.2).toFixed(2)),
      oil_temperature: parseFloat((telemetry.oil_temperature - 94).toFixed(1)),
      vibration: parseFloat((telemetry.vibration - 2.4).toFixed(2)),
    },
    prediction_error_pct: scenario === 'NORMAL' ? 2.8 : 8.4,
    model_version: 'TWIN-PHYSICS-v1.0.0',
    last_updated: new Date().toISOString(),
  };
}

function generateTwinVisualizationState(scenario: ScenarioId, telemetry: TelemetryData, health: HealthState): TwinVisualizationState {
  const stateMap: Record<ScenarioId, Partial<TwinVisualizationState>> = {
    NORMAL:               { thermal_state: 'NOMINAL', combustion_state: 'NOMINAL', lubrication_state: 'NOMINAL', vibration_state: 'NOMINAL', active_fault: null, affected_cylinders: [] },
    MISFIRE:              { thermal_state: 'NOMINAL', combustion_state: 'MISFIRE', lubrication_state: 'NOMINAL', vibration_state: 'ELEVATED', active_fault: 'CYLINDER_MISFIRE', affected_cylinders: [1] },
    INJECTOR_ABNORMALITY: { thermal_state: 'ELEVATED', combustion_state: 'ABNORMAL', lubrication_state: 'NOMINAL', vibration_state: 'NOMINAL', active_fault: 'INJECTOR_ABNORMALITY', affected_cylinders: [2] },
    LUBRICATION_ISSUE:    { thermal_state: 'NOMINAL', combustion_state: 'NOMINAL', lubrication_state: 'DEGRADED', vibration_state: 'NOMINAL', active_fault: 'LUBRICATION_PRESSURE_LOW', affected_cylinders: [] },
    OVERHEATING:          { thermal_state: 'HIGH', combustion_state: 'NOMINAL', lubrication_state: 'NOMINAL', vibration_state: 'NOMINAL', active_fault: 'OVERHEATING', affected_cylinders: [0, 1, 2, 3] },
    SENSOR_DRIFT:         { thermal_state: 'NOMINAL', combustion_state: 'NOMINAL', lubrication_state: 'NOMINAL', vibration_state: 'NOMINAL', active_fault: 'SENSOR_DRIFT_EGT_C1', affected_cylinders: [] }, // NOTE: No physical distortion
    ABNORMAL_VIBRATION:   { thermal_state: 'NOMINAL', combustion_state: 'NOMINAL', lubrication_state: 'NOMINAL', vibration_state: 'HIGH', active_fault: 'ABNORMAL_VIBRATION', affected_cylinders: [] },
  };
  const s = stateMap[scenario];
  return {
    engine_state: health.engine_state,
    health_index: health.index,
    rpm: telemetry.rpm,
    twin_sync_status: 'SYNCED',
    last_sync_timestamp: new Date().toISOString(),
    model_version: 'TWIN-3D-v1.0.0',
    ...s,
  } as TwinVisualizationState;
}

function generateAlerts(scenario: ScenarioId): Alert[] {
  if (scenario === 'NORMAL') return [];
  const alertMap: Record<ScenarioId, Omit<Alert, 'id' | 'timestamp' | 'acknowledged' | 'active'>[]> = {
    MISFIRE: [{ severity: 'HIGH', title: 'Cylinder Misfire Detected', description: 'Combustion abnormality in Cylinder 2. CHT and EGT deviations exceed threshold.', source: 'AI_DIAGNOSTICS', related_parameter: 'egt', related_subsystem: 'COMBUSTION', current_value: 620, threshold_value: 690 }],
    INJECTOR_ABNORMALITY: [{ severity: 'HIGH', title: 'Injector Abnormality — Cyl 3', description: 'EGT thermal gradient spike detected (+56°C variance). Injector inspection recommended.', source: 'AI_DIAGNOSTICS', related_parameter: 'egt', related_subsystem: 'FUEL_SYSTEM', current_value: 748, threshold_value: 720 }],
    LUBRICATION_ISSUE: [{ severity: 'CRITICAL', title: 'Oil Pressure Low', description: 'Oil pressure below minimum safe threshold. Immediate inspection required.', source: 'THRESHOLD_MONITOR', related_parameter: 'oil_pressure', related_subsystem: 'LUBRICATION', current_value: 2.6, threshold_value: 3.2 }],
    OVERHEATING: [{ severity: 'HIGH', title: 'Engine Overheating', description: 'CHT and EGT elevated across all cylinders. Thermal safety margin reduced.', source: 'THRESHOLD_MONITOR', related_parameter: 'cht', related_subsystem: 'THERMAL', current_value: 218, threshold_value: 200 }],
    SENSOR_DRIFT: [{ severity: 'WARNING', title: 'EGT Sensor Drift — Cyl 1', description: 'EGT sensor channel 1 exhibiting bias drift. Cross-channel discrepancy exceeds calibration limit.', source: 'SENSOR_DIAGNOSTICS', related_parameter: 'egt', related_subsystem: 'SENSORS', current_value: 750, threshold_value: null }],
    ABNORMAL_VIBRATION: [{ severity: 'HIGH', title: 'Abnormal Vibration Detected', description: 'Engine vibration magnitude elevated to 8.6 mm/s. Baseline: 2.4 mm/s.', source: 'THRESHOLD_MONITOR', related_parameter: 'vibration', related_subsystem: 'MECHANICAL', current_value: 8.6, threshold_value: 5.0 }],
    NORMAL: [],
  };
  return (alertMap[scenario] || []).map((a, i) => ({
    ...a,
    id: `ALERT-${scenario}-${i}`,
    timestamp: new Date().toISOString(),
    acknowledged: false,
    active: true,
  }));
}

function generateMission(): MissionData {
  return {
    id: 'MISSION-2026-001',
    name: 'TAPAS-02 Surveillance Run',
    status: 'ACTIVE',
    current_phase: 'CRUISE',
    current_phase_label: 'CRUISE',
    timeline_pct: 58,
    duration_s: 7200,
    elapsed_s: 6120,
    waypoints: [
      { id: 'wp-1', label: 'Takeoff', timeline_pct: 5, completed: true, active: false },
      { id: 'wp-2', label: 'Climb', timeline_pct: 28, completed: true, active: false },
      { id: 'wp-3', label: 'Cruise', timeline_pct: 58, completed: false, active: true },
      { id: 'wp-4', label: 'High Alt', timeline_pct: 75, completed: false, active: false },
      { id: 'wp-5', label: 'Return', timeline_pct: 95, completed: false, active: false },
    ],
    anomaly_events: [
      { id: 'ae-1', timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(), mission_time_s: 6232, timeline_pct: 52, title: 'EGT Anomaly', description: 'EGT thermal gradient spike detected (+14°C variance).', severity: 'WARNING' },
    ],
  };
}

function generateFlightContext(): FlightContext {
  return {
    altitude_m: jitter(8420, 50),
    airspeed_kmh: jitter(186, 5),
    ambient_temp_c: jitter(38, 1),
    ambient_pressure_hpa: jitter(740, 5),
    fuel_quantity_pct: jitter(72, 0.5),
    mission_phase: 'CRUISE',
    throttle_pct: jitter(74, 2),
  };
}

// ── Public Adapter API ──────────────────────────────────────────────────────────

export function setScenario(scenario: ScenarioId) {
  currentScenario = scenario;
}

export function getCurrentScenario(): ScenarioId {
  return currentScenario;
}

export function connect() {
  if (intervalId) return;

  const { setConnectionState } = useConnectionStore.getState();
  setConnectionState('CONNECTING');

  setTimeout(() => {
    setConnectionState('CONNECTED');
    tick = 0;

    intervalId = setInterval(() => {
      tick += 0.1;
      const telemetry = generateTelemetry(currentScenario, tick);
      const health = generateHealth(currentScenario);
      const diagnostics = generateDiagnostics(currentScenario);
      const twinAnalysis = generateTwinAnalysis(currentScenario, telemetry);
      const twinState = generateTwinVisualizationState(currentScenario, telemetry, health);
      const alerts = generateAlerts(currentScenario);
      const mission = generateMission();
      const context = generateFlightContext();

      useTelemetryStore.getState().setTelemetry(telemetry);
      useTelemetryStore.getState().setContext(context);
      useTelemetryStore.getState().pushSample(telemetry);
      useHealthStore.getState().setHealth(health);
      useDiagnosticsStore.getState().setDiagnostics(diagnostics);
      useDiagnosticsStore.getState().setTwinAnalysis(twinAnalysis);
      useAlertStore.getState().setAlerts(alerts);
      useMissionStore.getState().setMission(mission);
      useTwinStore.getState().setTwinState(twinState);
    }, 500); // 2 Hz update rate
  }, 800);
}

export function disconnect() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  useConnectionStore.getState().setConnectionState('DISCONNECTED');
}
