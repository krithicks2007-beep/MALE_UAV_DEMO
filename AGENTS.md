# MALE UAV Aero-Piston Engine Digital Twin Dashboard
## AI Agent System Specification & Project Architecture Guide

> **Document Context**: This file is optimized for AI coding agents (Gemini, Claude, GPT, etc.) working on the **SIH 2026 MALE UAV Aero-Piston Engine Digital Twin Dashboard**. It defines the technical vision, architectural boundaries, canonical data schemas, component contracts, and rules for execution.
>
> **Active Scope**: Current development focus is strictly on the **`dashboard/`** directory.

---

## 1. Executive Project Summary

The **MALE UAV Aero-Piston Engine Digital Twin Dashboard** is a high-reliability, operator-facing aerospace command center. It visualizes live engine health, telemetry, cylinder thermals, physics-vs-actual residuals, AI diagnostics, remaining useful life (RUL), maintenance advisories, mission replay, scenario injection, and interactive state-driven 3D twin animations.

### System Topology & Separation of Concerns

```
                     EXTERNAL SYSTEMS
                          |
        +-----------------+-----------------+
        |                 |                 |
   Telemetry        Twin / Physics       AI / ML
   Gateway              Core            Analytics
        |                 |                 |
        +-----------------+-----------------+
                          |
                     Backend / API
                          |
                    Data Adapter
                          |
                  Application State (Zustand)
                          |
        +-----------------+-----------------+
        |                 |                 |
       UI              Charts            3D Twin
     Pages            / Trends         Visualization
   (React/TS)         (uPlot)         (Three.js/R3F)
```

---

## 2. Mandatory Rules & Architectural Directives for AI Agents

When writing or modifying code in this project, AI agents **MUST** strictly enforce the following rules:

1. **Strict UI Isolation**: UI components (`src/components/`, `src/pages/`) MUST NOT contain physics equations, AI model logic, synthetic data generators, or direct database/MATLAB calls.
2. **Data Adapter Boundary**: All telemetry, state, diagnostic, and scenario data MUST flow through the Data Adapter Layer (`src/adapters/`). The UI must consume normalized models only and remain agnostic to whether data originates from Mock, REST API, WebSockets, or real UAV hardware.
3. **Dependency Direction Rule**:
   $$\text{UI} \longrightarrow \text{App State (Zustand)} \longrightarrow \text{Domain Models} \longrightarrow \text{Adapters / Services} \longrightarrow \text{Backend API} \longrightarrow \text{External Twin/AI Core}$$
   *Never bypass state or models to execute logic inside visual components.*
4. **Independent Modular Replaceability**:
   - Replace Mock Telemetry with WebSockets $\rightarrow$ **Zero UI component edits**.
   - Replace Procedural Three.js geometry with GLB/GLTF assets $\rightarrow$ **Zero Twin state/logic edits**.
   - Replace Client Replay Buffer with Backend Replay Engine $\rightarrow$ **Zero Replay UI edits**.
5. **No Visual Fraud / Fake Fallbacks**:
   - Distinguish `NO_DATA` / `DISCONNECTED` from `0` / `NOMINAL`. Never mask missing data with zero values.
   - Do not display mock output as validated production AI without explicit visual framing.
   - Sensor drift faults MUST NOT trigger physical engine distortion in 3D views if physical hardware is sound.
6. **Aerospace Design Language**: Build a dark, high-density, technical command center aesthetic. Avoid generic consumer web dashboard layouts, oversized childish controls, or unnecessary UI clutter.

---

## 3. Technology Stack Specification

| Component Layer | Selection | Rationale & Requirements |
| :--- | :--- | :--- |
| **Framework & Core** | React + Vite + TypeScript | High performance, strict typing, rapid HMR |
| **Styling & Design System** | Tailwind CSS + shadcn/ui + Lucide React | Modern dark aerospace theme, accessibility, dense HUD styling |
| **State Management** | Zustand | Multi-store modular architecture by bounded context |
| **High-Rate Charts** | uPlot | Lightweight 20–50 Hz canvas time-series rendering |
| **3D Cyber-Physical Twin** | Three.js + React Three Fiber (R3F) + Drei | Procedural WebGL visualization with state-driven mesh shaders/animations |
| **Testing** | Vitest + React Testing Library | Fast unit and component integration tests |
| **Linting & Quality** | ESLint + Prettier | Enforced code formatting and static analysis |
| **Backend Gateway** *(External)* | FastAPI + Pydantic + Uvicorn + WebSockets | Asynchronous API and telemetry streaming |

---

## 4. Product Structure & 9 Core Dashboard Tabs

AI agents implementing UI pages and components must follow this tab structure:

```
[ Top Header / Nav Bar: Connection Status | Engine Health Badge | Active Alert Counter | Data Source Indicator ]
─────────────────────────────────────────────────────────────────────────────────────────────────────────────
(1) Main Dashboard    - Executive Summary, Overall Health Index, Cylinder Overview, Quick Actions
(2) Live Telemetry    - Real-time gauge panels & high-density numerical readouts (4-cylinder aware)
(3) Telemetry Trends  - uPlot canvas charts (RPM, MAP, CHT, EGT, Oil Press/Temp, Vibration, Volt/Curr)
(4) Scenario Control  - Demonstration engine fault injector (Normal, Misfire, Injector, Overheating, etc.)
(5) Twin Analysis     - Physics Expected vs. Actual values & Residual Delta calculations
(6) AI / Diagnostics  - Anomaly Score, Fault Classification, Confidence %, RUL & Degradation State
(7) Maintenance Advisory - Operational decision-support & recommended maintenance actions (Advisory only)
(8) Mission Replay    - Historical mission timeline with scrub, play/pause, and telemetry circular buffer
(9) Twin View         - 3D Interactive engine visualization reacting to real-time telemetry state
```

---

## 5. Canonical Data Schemas & Shared Vocabulary

AI agents MUST use these exact field names across TypeScript interfaces, Mock Adapters, Zustand stores, and API definitions. Do NOT invent alternative field names.

### 5.1 Telemetry Frame (`TelemetryData`)

```typescript
export interface TelemetryData {
  timestamp: string;          // ISO 8601 UTC string
  frame_id: number;           // Monotonic sequence counter
  rpm: number;                // Engine RPM (e.g., 5200)
  map: number;                // Manifold Absolute Pressure (bar / kPa)
  cht: number[];              // Cylinder Head Temperatures [C1, C2, C3, C4] in °C
  egt: number[];              // Exhaust Gas Temperatures [C1, C2, C3, C4] in °C
  oil_pressure: number;       // Oil pressure (bar)
  oil_temperature: number;    // Oil temperature (°C)
  fuel_flow: number;          // Fuel flow rate (L/h)
  vibration: number;          // Engine overall vibration magnitude (g / mm/s)
  battery_voltage: number;    // Electrical system voltage (V)
  alternator_current: number; // Alternator current output (A)
  injection_timing: number;   // Fuel injection timing (°BTDC)
}
```

### 5.2 Engine Configuration Metadata

```typescript
export interface EngineConfiguration {
  engine_id: string;          // e.g. "AERO-PISTON-MALE-01"
  cylinder_count: number;     // Dynamic count (default: 4)
  telemetry_schema_version: string; // e.g. "1.0.0"
  unit_system: 'SI';
}
```

### 5.3 Diagnostic & Health State (`DiagnosticsData`)

```typescript
export interface DiagnosticsData {
  anomaly_score: number;      // 0.00 to 1.00
  primary_fault: string;      // e.g. "INJECTOR_ABNORMALITY" | "NONE"
  confidence: number;         // Percentage 0-100%
  severity: 'NOMINAL' | 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
  degradation_status: 'NOMINAL' | 'SLIGHT' | 'MODERATE' | 'SEVERE';
  rul_value: number | null;   // Remaining Useful Life count
  rul_unit: string;           // e.g. "HOURS" | "CYCLES"
  evidence: string[];         // Supporting data lines
}
```

### 5.4 Connection State Machine

```typescript
export type ConnectionState = 
  | 'CONNECTING'
  | 'CONNECTED'
  | 'DELAYED'
  | 'DATA_STALE'
  | 'DISCONNECTED'
  | 'INVALID_DATA'
  | 'TWIN_UNAVAILABLE'
  | 'AI_UNAVAILABLE';
```

---

## 6. Project Architecture & File Organization (`dashboard/`)

All code written by AI agents for the dashboard must fit strictly into the following module hierarchy:

```
dashboard/
├── public/
│   └── favicon.ico
├── src/
│   ├── adapters/               # Data Layer Adapters (Mock, REST API, WebSocket)
│   │   ├── TelemetryAdapter.ts
│   │   ├── ScenarioAdapter.ts
│   │   ├── DiagnosticsAdapter.ts
│   │   ├── MockAdapter.ts
│   │   └── WebSocketAdapter.ts
│   ├── assets/                 # Static images, textures, 3D primitive assets
│   ├── components/             # Reusable UI Components
│   │   ├── alerts/             # Alert drawer, indicators, history list
│   │   ├── common/             # Cards, badges, buttons, modal dialogs
│   │   ├── diagnostics/        # Anomaly score gauges, RUL cards, fault evidence
│   │   ├── health/             # Health index radial gauges, status pills
│   │   ├── layout/             # Header, sidebar, tab navigation, footer
│   │   ├── maintenance/        # Advisory recommendation panels
│   │   ├── mission/            # Timeline scrubber, playback controls
│   │   ├── scenarios/          # Scenario injection selector cards
│   │   ├── telemetry/          # Telemetry cards, multi-cylinder thermal bars
│   │   ├── trends/             # uPlot time-series chart containers
│   │   ├── twin/               # Three.js canvas, procedural engine mesh, lighting
│   │   └── twin-analysis/      # Actual vs. Expected & Residual delta displays
│   ├── hooks/                  # Custom React hooks (useTelemetry, useuPlot, useTwinState)
│   ├── models/                 # TypeScript interfaces, schemas, contracts
│   │   ├── alerts.ts
│   │   ├── diagnostics.ts
│   │   ├── engine.ts
│   │   ├── mission.ts
│   │   └── telemetry.ts
│   ├── pages/                  # Page route containers for 9 core tabs
│   │   ├── DiagnosticsPage.tsx
│   │   ├── LiveTelemetryPage.tsx
│   │   ├── MainDashboardPage.tsx
│   │   ├── MaintenancePage.tsx
│   │   ├── MissionReplayPage.tsx
│   │   ├── ScenarioControlPage.tsx
│   │   ├── TelemetryTrendsPage.tsx
│   │   ├── TwinAnalysisPage.tsx
│   │   └── TwinViewPage.tsx
│   ├── services/               # API / WebSocket communication layer
│   │   ├── api.ts
│   │   └── websocket.ts
│   ├── stores/                 # Zustand domain state stores
│   │   ├── alertStore.ts
│   │   ├── connectionStore.ts
│   │   ├── diagnosticsStore.ts
│   │   ├── healthStore.ts
│   │   ├── missionStore.ts
│   │   ├── scenarioStore.ts
│   │   ├── telemetryStore.ts
│   │   └── twinStore.ts
│   ├── utils/                  # Formatters, telemetry unit conversions, math helpers
│   ├── App.tsx                 # Main application shell and tab router
│   ├── main.tsx                # Application entry point
│   └── index.css               # Design system tokens, Tailwind directives, dark theme
├── package.json
├── tsconfig.json
├── vite.config.ts
└── AGENTS.md                   # This specification file
```

---

## 7. Implementation Roadmap & Development Phases

When AI agents are tasked with building or extending the dashboard, follow this sequential phase plan:

### Phase 1: Foundation Setup
- Initialize React + Vite + TypeScript in `dashboard/`.
- Setup Tailwind CSS, shadcn/ui components, Lucide icons, and `index.css` aerospace dark theme.
- Define core TypeScript types in `src/models/`.
- Implement `MockAdapter` and Zustand stores (`telemetryStore`, `healthStore`, `alertStore`).

### Phase 2: Core Command Center UI
- Build `MainDashboardPage` with overall Health Index, quick alerts summary, and cylinder thermals overview.
- Build header layout with connection state badge, data source indicator, and time display.

### Phase 3: Telemetry & uPlot High-Frequency Trends
- Build `LiveTelemetryPage` with multi-cylinder CHT/EGT visualizations.
- Build `TelemetryTrendsPage` with uPlot canvas integration supporting zoom/pan/compare.

### Phase 4: Scenario Injection Engine
- Build `ScenarioControlPage` to trigger simulated engine faults:
  `NORMAL` $\rightarrow$ `MISFIRE` $\rightarrow$ `INJECTOR_ABNORMALITY` $\rightarrow$ `LUBRICATION_ISSUE` $\rightarrow$ `OVERHEATING` $\rightarrow$ `SENSOR_DRIFT` $\rightarrow$ `ABNORMAL_VIBRATION`.
- Verify state updates propagate smoothly to Alerts, Health Index, and Telemetry cards.

### Phase 5: Twin Analysis & AI Diagnostics
- Build `TwinAnalysisPage` showing Expected vs. Actual values and Residual deltas.
- Build `DiagnosticsPage` presenting Anomaly Score, Fault Classification, and RUL estimation.
- Build `MaintenancePage` displaying operational decision support advisories.

### Phase 6: Interactive 3D Twin View & Mission Replay
- Build `TwinViewPage` with Three.js / React Three Fiber procedural engine representation.
- Add state-driven shader/animation effects (thermal glow on overheating, cylinder misfire pulses, vibration shakes).
- Build `MissionReplayPage` with bounded circular buffer, scrubber timeline, play/pause controls.

### Phase 7: Backend Integration & Verification
- Create REST & WebSocket backend adapters.
- Validate zero UI code modifications when switching data sources from `MockAdapter` to `WebSocketAdapter`.
- Run Vitest unit & component integration test suite.

---

## 8. Guidance for AI Agents Operating on this Workspace

- **Working Directory**: All generated UI code, config files, and tests MUST reside under `dashboard/`.
- **Modularity Verification**: Before finalizing any component, ask: *"If the backend telemetric stream changes schema or transport protocol, do I need to rewrite this UI file?"* If yes, refactor immediately to use the Data Adapter or Zustand store.
- **Visual Excellence**: Ensure high contrast, crisp typography, responsive card grids, dark mode glassmorphism effects, and smooth 60fps uPlot/Three.js render loops.
