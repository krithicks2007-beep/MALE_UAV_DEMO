// ============================================================
// ALERT MODELS
// ============================================================

export type AlertSeverity = 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';

export interface Alert {
  id: string;
  timestamp: string;            // ISO 8601
  severity: AlertSeverity;
  title: string;
  description: string;
  source: string;               // e.g. "AI_DIAGNOSTICS" | "THRESHOLD_MONITOR"
  related_parameter: string | null;
  related_subsystem: string | null;
  current_value: number | null;
  threshold_value: number | null;
  acknowledged: boolean;
  active: boolean;
}
