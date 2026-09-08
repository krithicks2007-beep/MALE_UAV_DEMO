# Module X4: AI/ML + Diagnostics Engine
**MALE UAV Aero-Piston Engine Digital Twin (SIH 2026)**

---

## 1. Overview
Module **X4 (AI/ML + Diagnostics)** serves as the intelligence layer of the MALE UAV Digital Twin system. It processes incoming canonical telemetry, telemetry quality descriptors from the X3 Gateway, and physics-based residuals from the Digital Twin Core to provide real-time condition monitoring, anomaly detection, root-cause fault classification, continuous health estimation, degradation tracking, and Remaining Useful Life (RUL) forecasting.

---

## 2. Architecture & Data Flow

```
CanonicalTelemetry + TelemetryQuality + TwinResiduals
                          │
                          ▼
              ┌──────────────────────┐
              │  Telemetry Quality   │
              │  Masking & Alignment │
              └──────────┬───────────┘
                         ▼
              ┌──────────────────────┐
              │ Feature Engineering  │
              │ (Moments, Slopes)    │
              └──────────┬───────────┘
                         ▼
              ┌──────────────────────┐
              │  Anomaly Detection   │
              │  (Score: 0.0 - 1.0)  │
              └──────────┬───────────┘
                         ▼
              ┌──────────────────────┐
              │  Fault Classifier    │
              │  (8 Target Classes)  │
              └──────────┬───────────┘
                         ▼
              ┌──────────────────────┐
              │  Degradation Model   │
              │  (Range: 0.0 - 1.0)  │
              └──────────┬───────────┘
                         ▼
              ┌──────────────────────┐
              │    RUL Estimator     │
              │  (Hours ± UQ Bounds) │
              └──────────┬───────────┘
                         ▼
              ┌──────────────────────┐
              │  Health Assessment   │
              │  (Index: 0 - 100)    │
              └──────────┬───────────┘
                         ▼
                  DiagnosticResult
                         │
                         ▼
            Backend / API / Dashboard
```

---

## 3. Directory Layout

```
ai/
├── data/              # Schemas (CanonicalTelemetry, DiagnosticResult), Quality Preprocessors, Loaders
├── features/          # Per-cylinder statistics, physics residuals, temporal slopes & window buffers
├── models/            # Anomaly, Fault Classifier, Health, Degradation, RUL models & JSON artifacts
├── training/          # Offline calibration and training pipelines
├── inference/         # Real-time inference engine and diagnostics API entrypoint
├── evaluation/        # Precision, Recall, F1, MAE, RMSE, UQ metrics, Confusion Matrix
├── utils/             # Traceability logging
├── tests/             # Automated test suite (TEST 001 through TEST 011)
├── __init__.py        # Top-level exports
└── README.md          # Documentation
```

---

## 4. Standardized Fault Vocabulary
X4 diagnoses the 8 standardized shared fault classes:
1. `misfire`
2. `injector_abnormality`
3. `lubrication_issue`
4. `sensor_drift`
5. `sensor_failure`
6. `combustion_instability`
7. `overheating`
8. `abnormal_vibration`

---

## 5. Health Index & Bands
Engine Health Index is evaluated on a continuous scale from `0.0` to `100.0`:
* **`80.0 – 100.0`**: `healthy`
* **`60.0 – 79.9`**: `degraded`
* **`30.0 – 59.9`**: `warning`
* **`0.0 – 29.9`**: `critical`

---

## 6. Usage Example (Quickstart)

```python
from ai import DiagnosticsEngine, CanonicalTelemetry, TwinResiduals

# 1. Initialize Engine (loads pre-trained artifacts once)
engine = DiagnosticsEngine()

# 2. Process incoming frame
telemetry_data = {
    "timestamp": 1725451200.0,
    "mission_id": "MISSION-001",
    "frame_id": 1042,
    "rpm": 5200.0,
    "map": 94.0,
    "cht": [135.0, 134.5, 136.0, 135.5],
    "egt": [810.0, 895.0, 809.0, 811.0],  # Cylinder 2 high EGT
    "oil_pressure": 4.2,
    "oil_temperature": 88.0,
    "vibration": 0.35
}

residual_data = {
    "residuals": {
        "egt_residual_mean": 21.25,
        "egt_residual_max": 84.5,
        "residual_score": 2.1
    }
}

result = engine.process(telemetry=telemetry_data, residuals=residual_data)

print(f"Anomaly Detected: {result.anomaly_detected} (Score: {result.anomaly_score})")
print(f"Fault Diagnosed: {result.fault_type} (Confidence: {result.fault_confidence * 100:.1f}%)")
print(f"Health: {result.health_index} [{result.health_status}]")
print(f"RUL: {result.rul} {result.rul_unit} (± {result.rul_uncertainty} hrs)")
print(f"Evidence: {result.evidence}")
```

---

## 7. Running Tests

Run the full automated test suite (including TEST 001 - TEST 011):

```bash
python -m unittest discover -s ai/tests
```
