// ============================================================
// DATA ADAPTER GATEWAY
// Connects to live FastAPI WebSocket stream with automatic fallback.
// ============================================================

import { connectWebSocket, disconnectWebSocket } from './WebSocketAdapter';

export function connect() {
  connectWebSocket();
}

export function disconnect() {
  disconnectWebSocket();
}

export { connectWebSocket, disconnectWebSocket, injectScenarioWS, sendWebSocketMessage } from './WebSocketAdapter';
