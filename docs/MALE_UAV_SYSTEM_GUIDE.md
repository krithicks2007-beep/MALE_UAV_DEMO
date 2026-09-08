# MALE UAV Aero-Piston Engine Digital Twin
## Complete System Guide, Telemetry Flow & Data Controller Reference

---

## 1. System Overview & Architecture

The **MALE UAV Aero-Piston Engine Digital Twin** is an aerospace-grade cyber-physical monitoring, telemetry, and predictive diagnostics command center. It bridges a high-fidelity continuous physics simulation backend with a real-time React/Three.js dashboard.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           PHYSICS & DATA CONTROLLER                             │
│  (EnginePhysicsSimulation • FaultInjector • TAPAS DRDO Scenarios • REST/WS API) │
└──────────────────────────────────────┬──────────────────────────────────────────┘
                                       │ Real-time WebSockets (1 Hz JSON frames)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            REACT DATA ADAPTER LAYER                             │
│                  (WebSocketAdapter.ts / MockAdapter fallback)                   │
└──────────────────────────────────────┬──────────────────────────────────────────┘
                                       │ Normalized Domain State Dispatch
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         ZUSTAND CENTRAL DOMAIN STORES                           │
│ (telemetryStore • healthStore • diagnosticsStore • twinStore • alertStore, etc) │
└──────────────┬───────────────────────┼─────────────────────────┬────────────────┘
               ▼                       ▼                         ▼                
┌─────────────────────────┐ ┌──────────────────────┐ ┌────────────────────────────┐
│      9 CORE TABS        │ │   HIGH-RATE CHARTS   │ │   3D CYBER-PHYSICAL TWIN   │
│  HUD & Operator Panels  │ │   (uPlot Canvas)     │ │ (Rotax GLB CAD & Airframe) │
└─────────────────────────┘ └──────────────────────┘ └────────────────────────────┘
```

---

## 2. The 9 Core Dashboard Tabs

| # | Tab Name | Purpose & Contents |
| :--- | :--- | :--- |
| **1** | **Main Dashboard** | Executive mission overview: Top KPI pills (Altitude, Fuel %, Ambient Temp, Health Index), Safe Return Predictor, **UAV Airframe 3D Twin**, Cylinder Thermals overview, and Degradation Trend chart. |
| **2** | **Live Telemetry** | High-density instrument HUD: Numerical readouts, multi-cylinder CHT/EGT comparative vertical thermal bars, lubrication status, and electrical bus monitors. |
| **3** | **Telemetry Trends** | High-rate uPlot canvas time-series charts displaying real-time streaming trends with zoom, pan, and cursor crosshairs. |
| **4** | **Scenario Control** | Demonstration engine fault injector to trigger and test simulated aerospace anomalies in real time. |
| **5** | **Twin Analysis** | Physics-expected mathematical model values vs. actual measured telemetry and calculated residual deltas ($r_i = x_{i,\text{act}} - x_{i,\text{exp}}$). |
| **6** | **AI / Diagnostics** | Anomaly Detection Score (%), Fault Classification, Confidence %, Degradation Level, Failure Risk %, and Remaining Useful Life (RUL) with confidence bounds. |
| **7** | **Maintenance Advisory** | Automated decision-support recommendations, component inspection advice, and corrective maintenance procedures. |
| **8** | **Mission Replay** | Historical mission scrubber, playback controls, and bounded circular telemetry replay buffer. |
| **9** | **Twin View** | Dedicated **Rotax 912 CAD 3D Digital Twin** (`model_web.glb`): Real-time multi-axis exploded view slider (0%–100%), auto-explode cycle, component tree inspector, specs, and live thermal shaders. |

---

## 3. How Data Flows From Telemetry to the Dashboard

1. **Simulation & Physics Calculation**:
   - `EnginePhysicsSimulation` runs at **1 Hz** in `backend/main.py`.
   - It calculates multi-cylinder aero-piston thermodynamics, dry-sump oil dynamics, atmospheric lapse rates (ISA standard atmosphere), electrical loads, and mechanical vibrations.
2. **JSON Frame Construction**:
   - Telemetry, flight context, health indices, AI diagnostics, residual deltas, 3D twin shaders, and active advisories are packed into a `LiveStreamFrame` Pydantic model.
3. **WebSocket Broadcast**:
   - Broadcasted over `ws://localhost:8000/ws/telemetry` to all connected browser clients.
4. **Adapter Dispatch**:
   - `WebSocketAdapter.ts` listens to incoming frames, parses payloads, and updates corresponding Zustand stores (`telemetryStore`, `healthStore`, `diagnosticsStore`, `twinStore`, `alertStore`).
5. **Reactive UI Rendering**:
   - UI components, uPlot charts, and Three.js 3D models update reactively without page refreshes.

---

## 4. How to Use the Data Controller

- **Access URL**: [http://localhost:8000/control](http://localhost:8000/control) (or `/generator`)
- **Operating Modes**:
  - **Automatic Flight State Mode**: Switch between nominal flight phases (`TAKEOFF`, `CLIMB`, `CRUISE`, `DESCENT`, `LANDING`, `IDLE`). The physics simulation automatically ramps RPM, MAP, airspeed, and fuel consumption based on realistic flight equations.
  - **Manual Parameter Control Mode**: Toggle the **Manual Override** switch to independently move any slider (RPM, MAP, CHT, EGT, Oil Pressure, Vibration, etc.).
  - **TAPAS DRDO Scenario Injector**: 16 one-click fault scenarios to simulate complex engine anomalies, icing, structural stress, and sensor drifts.

---

## 5. Telemetry Parameter Reference & Impact Guide

The table below explains what each parameter represents, its nominal operating bounds, and what happens across the dashboard when you change its value:

### 5.1 Engine & Propulsion Parameters

| Parameter | Unit | Nominal Range | Warning / Critical | Physical & Dashboard Effects When Changed |
| :--- | :--- | :--- | :--- | :--- |
| **RPM** (`rpm`) | RPM | 2,400 – 5,200 | $< 1,200$ (Stall)<br>$> 5,800$ (Overspeed) | **Effects**: Drives 3D propeller rotation speed, engine vibration frequency, alternator current generation, and baseline fuel flow rate.<br>• High RPM ($>5,800$) triggers **Propeller Overspeed** alert, raises vibration, and accelerates thermal buildup. |
| **Manifold Pressure** (`map`) | bar | 0.70 – 1.05 | $< 0.40$ (Suction)<br>$> 1.25$ (Overboost) | **Effects**: Represents engine intake air pressure downstream of the throttle.<br>• Higher MAP increases cylinder combustion pressure, raising torque and CHT/EGT temperatures.<br>• Unmatched MAP vs RPM triggers **Intake Runner / MAP Sensor Abnormality**. |
| **Cylinder Head Temp 1–4** (`cht[0..3]`) | °C | 150 – 195 | $200 - 215$ (Amber)<br>$> 215$ (Critical Red) | **Effects**: Individual thermal state of each cylinder head.<br>• Exceeding 200°C causes cylinder head in the 3D Twin to glow amber; $>215°C$ causes pulsing red overheat shaders.<br>• Single cylinder deviation indicates **Injector Abnormality** or **Cylinder Misfire**.<br>• All cylinders high triggers **Engine Overheating** alarm. |
| **Exhaust Gas Temp 1–4** (`egt[0..3]`) | °C | 720 – 860 | $< 620$ (Rich/Misfire)<br>$> 920$ (Lean Detonation) | **Effects**: Measures combustion exhaust gas temperature for each individual cylinder.<br>• Sudden EGT drop on one cylinder indicates unburned fuel / **Ignition Misfire**.<br>• High EGT indicates lean air-fuel mixture or impending valve failure. |
| **Fuel Flow Rate** (`fuel_flow`) | L/h | 14.0 – 28.0 | $< 8.0$ (Starvation)<br>$> 36.0$ (Leak/Flooding) | **Effects**: Fuel consumption rate.<br>• Directly depletes onboard fuel quantity (`fuel_quantity_pct`) and recalculates remaining mission endurance and safe return radius. |
| **Injection Timing** (`injection_timing`) | °BTDC | 24.0 – 28.0 | $< 18.0$ (Retarded)<br>$> 34.0$ (Advanced Knock) | **Effects**: Spark/injection lead before top dead center.<br>• Advanced timing increases peak cylinder pressure and knock risk; retarded timing elevates EGT exhaust temps. |

---

### 5.2 Lubrication & Mechanical Parameters

| Parameter | Unit | Nominal Range | Warning / Critical | Physical & Dashboard Effects When Changed |
| :--- | :--- | :--- | :--- | :--- |
| **Oil Pressure** (`oil_pressure`) | bar | 3.5 – 5.5 | $< 2.0$ (Critical Low)<br>$> 6.5$ (High Relief) | **Effects**: Lubrication circuit hydraulic pressure.<br>• Pressure drop below 2.0 bar immediately triggers **Critical Lubrication Failure**, causes rapid mechanical wear, and drops overall Health Index $< 50\%$. |
| **Oil Temperature** (`oil_temperature`) | °C | 80 – 110 | $< 60$ (Cold Oil)<br>$> 130$ (Thermal Breakdown) | **Effects**: Sump and oil cooler temperature.<br>• High oil temp degrades lubrication film viscosity, triggering advisory to reduce engine power. |
| **Engine Vibration** (`vibration`) | mm/s | 0.8 – 2.8 | $3.5 - 5.5$ (Warning)<br>$> 6.0$ (Critical) | **Effects**: Overall mechanical vibration magnitude.<br>• Drives physical camera/mesh jitter intensity in the 3D Twin View.<br>• High vibration triggers **Bearing Stress / Propeller Imbalance** alerts. |

---

### 5.3 Electrical & Flight Context Parameters

| Parameter | Unit | Nominal Range | Warning / Critical | Physical & Dashboard Effects When Changed |
| :--- | :--- | :--- | :--- | :--- |
| **Battery Voltage** (`battery_voltage`) | V | 26.5 – 28.5 | $< 23.5$ (Discharging)<br>$> 31.0$ (Overvoltage) | **Effects**: Main 28V DC avionics bus voltage.<br>• Voltage drop triggers **Electrical Generation Warning**. |
| **Alternator Current** (`alternator_current`) | A | 18.0 – 45.0 | $> 60.0$ (Bus Overload) | **Effects**: Current load demanded by avionics, FADEC, servos, and payload cameras. |
| **Altitude** (`altitude_m`) | m | 500 – 6,500 | $> 7,500$ (Service Ceiling) | **Effects**: Calculates International Standard Atmosphere (ISA) physics: ambient air density, barometric pressure, and freezing ambient temperatures (down to $-40^\circ\text{C}$).<br>• At sub-zero altitudes with high moisture, triggers **Airframe / Propeller Icing** with cyan frost shader effects. |
| **Airspeed** (`airspeed_kmh`) | km/h | 120 – 240 | $< 95$ (Stall Speed)<br>$> 280$ (VNE Exceeded) | **Effects**: Ram-air airflow for engine cooling duct efficiency. Higher airspeed improves cylinder cooling rates. |

---

## 6. TAPAS DRDO Pre-Configured Scenarios

In the **Scenario Control** tab or Data Controller panel, you can inject 16 realistic scenarios:

| Scenario Code | Scenario Name | Primary Symptoms & Visual Feedback |
| :--- | :--- | :--- |
| `NORMAL` | **Normal Cruise** | All parameters nominal (Health $>90\%$, green indicators). |
| `MISFIRE` | **Cylinder Misfire** | Cyl #2 EGT drops $-72^\circ\text{C}$, RPM fluctuates $\pm 40$, torque pulsation. |
| `INJECTOR_ABNORMALITY` | **Injector Clog/Abnormality** | Cyl #3 EGT $+56^\circ\text{C}$, fuel flow elevated $+3.2\text{ L/h}$, injection timing shift. |
| `LUBRICATION_ISSUE` | **Low Oil Pressure** | Oil pressure drops to $1.8\text{ bar}$, oil temp rises to $128^\circ\text{C}$, health drops to $55\%$. |
| `OVERHEATING` | **Engine Overheating** | All CHTs $>215^\circ\text{C}$, 3D engine glows pulsing red, thermal alarm sounds. |
| `SENSOR_DRIFT` | **EGT Sensor Drift** | Sensor 1 bias $+58^\circ\text{C}$, physical engine stays normal, AI flags sensor fault. |
| `SENSOR_FAILURE` | **Sensor Signal Loss** | Telemetry channel reports invalid/null data, data quality monitor alerts. |
| `PROPELLER_OVERSPEED` | **Propeller Overspeed** | RPM surges to $5,900$, aft pusher propeller highlights red. |
| `MOTOR_STRESS_VIBRATION` | **Bearing Stress & Vibration** | Vibration spikes to $6.8\text{ mm/s}$, mechanical health degraded. |
| `WING_STRUCTURAL_STRESS` | **Wing Structural Overload** | G-load excursions, high aerodynamic load on port/starboard wing spars. |
| `MISSILE_HARDPOINT_FAULT` | **Hardpoint Pylon Error** | Pylon release bus communication fault, underwing hardpoint alert. |
| `AVIONICS_RADAR_FAILURE` | **Front Head Radar Failure** | Nose radome synthetic aperture radar telemetry offline. |
| `HIGH_ALTITUDE_ICING` | **High Altitude Airframe Icing** | Sub-zero altitude icing, cyan cold frost shaders on airframe. |
| `PROPELLER_ICING` | **Propeller Blade Icing** | Pusher propeller icing, thrust degradation, cold frost shader. |
| `FULL_AIRFRAME_ALERT` | **Full Airframe Emergency** | Compound multiple-system emergency (all airframe parts pulse). |

---

## 7. Alert Modal & Multi-Anomaly Pagination

When one or more anomalies occur simultaneously:
1. **Floating HUD Badge (Bottom-Right)**:
   - Displays severity, primary component name, airframe location, and `Page 1/N` counter.
   - Includes quick `‹ Prev` and `Next ›` arrows to cycle through active anomalies without opening the modal.
2. **Side Inspection Drawer ("View Details")**:
   - **Pagination Bar**: Displays `Page X of Y` with previous/next buttons and direct-jump numbered pills (`[ #1 Overheat ]`, `[ #2 Vibration ]`).
   - **Keyboard Navigation**: Press **Left Arrow ($\leftarrow$)** or **Right Arrow ($\rightarrow$)** to page between anomalies; press **Escape** to close.
   - **Interactive Tactical Radar Schematic**: The top-down UAV radar display automatically repositions the laser pinpoint to the exact station of the active anomaly page.
   - **Tailored Diagnostics**: Evidence bullets, anomaly score %, AI confidence %, degradation state, failure risk %, and recommended maintenance actions update for that specific anomaly.
   - **Acknowledgement Actions**: Acknowledge individual anomalies or click **"Acknowledge All (N)"** to clear active alarms simultaneously.

---

## 8. Quick Start Commands

```powershell
# 1. Start Telemetry Generator & Data Controller Backend (Port 8000)
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000

# 2. Start React + Three.js Dashboard (Port 5173)
cd dashboard
npm.cmd run dev
```
