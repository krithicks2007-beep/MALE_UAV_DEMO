// ============================================================
// DIAGNOSTICS MODELS
// ============================================================

export type DiagnosticSeverity = 'NOMINAL' | 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
export type DegradationStatus = 'NOMINAL' | 'SLIGHT' | 'MODERATE' | 'SEVERE';

export type ConnectionState =
  | 'CONNECTING'
  | 'CONNECTED'
  | 'DELAYED'
  | 'DATA_STALE'
  | 'DISCONNECTED'
  | 'INVALID_DATA'
  | 'TWIN_UNAVAILABLE'
  | 'AI_UNAVAILABLE';

export interface DiagnosticsData {
  anomaly_score: number;            // 0.00 to 1.00
  primary_fault: string;            // e.g. "INJECTOR_ABNORMALITY" | "NONE"
  confidence: number;               // 0–100 %
  severity: DiagnosticSeverity;
  degradation_status: DegradationStatus;
  rul_value: number | null;         // Remaining Useful Life count
  rul_unit: string;                 // "HOURS" | "CYCLES"
  rul_confidence: number | null;    // 0–100 %
  evidence: string[];               // Supporting data lines (display only)
  failure_risk_pct: number;         // 0–100 %
  last_updated: string;             // ISO 8601
}

export interface TwinAnalysisData {
  /** physics-model expected values keyed by telemetry field */
  expected: Partial<Record<string, number>>;
  /** residuals (actual - expected) keyed by telemetry field */
  residuals: Partial<Record<string, number>>;
  /** overall model prediction error % */
  prediction_error_pct: number;
  model_version: string;
  last_updated: string;
}
