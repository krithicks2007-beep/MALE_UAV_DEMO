// ============================================================
// WEBSOCKET ADAPTER
// Connects directly to FastAPI Backend Live Telemetry Stream
// Dispatches live frames in real-time to Zustand stores.
// ============================================================

import { useTelemetryStore } from '../stores/telemetryStore';
import { useHealthStore } from '../stores/healthStore';
import { useDiagnosticsStore } from '../stores/diagnosticsStore';
import { useAlertStore } from '../stores/alertStore';
import { useMissionStore } from '../stores/missionStore';
import { useTwinStore } from '../stores/twinStore';
import { useConnectionStore } from '../stores/connectionStore';
import type { ScenarioId } from '../models/engine';
import type { Alert } from '../models/alerts';

let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let isIntentionallyClosed = false;

export function connectWebSocket(url?: string) {
  const wsHost = typeof window !== 'undefined' ? window.location.hostname || '127.0.0.1' : '127.0.0.1';
  const targetUrl = url || `ws://${wsHost}:8000/ws/telemetry`;

  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }

  isIntentionallyClosed = false;
  const { setConnectionState, setDataSource } = useConnectionStore.getState();
  setConnectionState('CONNECTING');
  setDataSource('LIVE STREAM');

  try {
    socket = new WebSocket(targetUrl);

    socket.onopen = () => {
      console.log('[WebSocketAdapter] Live stream connected to:', targetUrl);
      setConnectionState('CONNECTED');
      setDataSource('LIVE API');
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    socket.onmessage = (event) => {
      try {
        const frame = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        // 1. Telemetry & Flight Context
        if (frame.telemetry) {
          useTelemetryStore.getState().setTelemetry(frame.telemetry);
          useTelemetryStore.getState().pushSample(frame.telemetry);
        }
        if (frame.flight_context) {
          useTelemetryStore.getState().setContext(frame.flight_context);
        }

        // 2. Subsystem & Overall Health
        if (frame.health) {
          useHealthStore.getState().setHealth(frame.health);
        }

        // 3. AI Diagnostics & Digital Twin Residuals
        if (frame.diagnostics) {
          useDiagnosticsStore.getState().setDiagnostics(frame.diagnostics);
        }
        if (frame.twin_analysis) {
          useDiagnosticsStore.getState().setTwinAnalysis(frame.twin_analysis);
        }

        // 4. 3D Twin Visualization State
        if (frame.twin_state) {
          useTwinStore.getState().setTwinState(frame.twin_state);
        }

        // 5. Advisories & Alerts (clear or set)
        const advList = frame.advisories || [];
        const mappedAlerts: Alert[] = advList.map((adv: any, idx: number) => ({
          id: `ADV-${idx}-${adv.advisory_type || 'ALERT'}`,
          timestamp: adv.timestamp,
          severity: adv.severity || 'WARNING',
          title: adv.advisory_type || 'Maintenance Advisory',
          description: `${adv.reason} • Action: ${adv.recommended_action}`,
          source: 'AI_DIAGNOSTICS',
          related_parameter: adv.related_fault_type || null,
          related_subsystem: null,
          current_value: null,
          threshold_value: null,
          acknowledged: false,
          active: true
        }));
        useAlertStore.getState().setAlerts(mappedAlerts);

        // 6. Mission info
        if (frame.flight_context) {
          const currentMission = useMissionStore.getState().mission;
          if (currentMission) {
            useMissionStore.getState().setMission({
              ...currentMission,
              current_phase: frame.flight_context.mission_phase || currentMission.current_phase,
              current_phase_label: frame.flight_context.mission_phase || currentMission.current_phase_label
            });
          }
        }
      } catch (err) {
        console.error('[WebSocketAdapter] Parse error:', err);
      }
    };

    socket.onerror = (e) => {
      console.warn('[WebSocketAdapter] Connection error on:', targetUrl, e);
      setConnectionState('DELAYED');
    };

    socket.onclose = () => {
      if (!isIntentionallyClosed) {
        setConnectionState('DISCONNECTED');
        if (!reconnectTimer) {
          reconnectTimer = setTimeout(() => {
            reconnectTimer = null;
            connectWebSocket(targetUrl);
          }, 2000);
        }
      }
    };
  } catch (e) {
    console.error('[WebSocketAdapter] Init error:', e);
    setConnectionState('DISCONNECTED');
  }
}

export function disconnectWebSocket() {
  isIntentionallyClosed = true;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (socket) {
    socket.close();
    socket = null;
  }
  useConnectionStore.getState().setConnectionState('DISCONNECTED');
}

export function sendWebSocketMessage(msg: Record<string, any>) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(msg));
  }
}

export function injectScenarioWS(scenarioId: ScenarioId, duration_s = 60.0) {
  sendWebSocketMessage({
    action: 'inject_scenario',
    scenario_id: scenarioId,
    duration_s
  });
}
