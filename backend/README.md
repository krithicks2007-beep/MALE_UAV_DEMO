# MALE UAV Digital Twin — Backend

FastAPI + Python backend serving live telemetry, WebSocket streaming, AI diagnostics, and engine physics simulation for the **MALE UAV Aero-Piston Engine Digital Twin**.

---

## Package Structure

```
backend/
├── app/                  ← FastAPI application
│   ├── main.py           (FastAPI app, REST endpoints, WebSocket gateway)
│   ├── generator.py      (Telemetry frame generator)
│   ├── engine_physics.py (Aero-piston physics model)
│   ├── fault_injector.py (Fault scenario injection)
│   ├── dummy_ai_diagnostics.py
│   ├── digital_twin_model.py
│   ├── models.py         (Pydantic data models)
│   ├── config.py
│   └── ui.py             (Embedded generator control UI)
├── ai/                   ← ML anomaly detection & RUL
├── telemetry/            ← Telemetry schema & gateway
├── decision_support/     ← Advisory rules engine
├── digital_twin/         ← Twin physics & residuals
├── scenarios/            ← Scenario definitions
├── tests/                ← Integration tests
├── scripts/              ← Utility scripts
├── run.py                ← Entry point
└── requirements.txt
```

---

## Local Development

```bash
# 1. Create a Python virtual environment
python -m venv .venv
.venv\Scripts\activate    # Windows
# source .venv/bin/activate  # Linux/Mac

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy env file
cp .env.example .env

# 4. Start the server
python run.py
# API available at: http://localhost:8000
# Docs (Swagger):   http://localhost:8000/docs
# WebSocket:        ws://localhost:8000/ws/telemetry
# Generator UI:     http://localhost:8000/control
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Service status |
| `GET` | `/docs` | Swagger UI |
| `GET` | `/api/health` | Engine health state |
| `GET` | `/api/telemetry/latest` | Latest telemetry frame |
| `GET` | `/api/diagnostics/latest` | AI diagnostics |
| `GET` | `/api/residuals/latest` | Twin analysis residuals |
| `GET` | `/api/advisories` | Maintenance advisories |
| `GET` | `/api/scenarios` | Available scenarios |
| `POST` | `/api/scenarios/start` | Inject fault scenario |
| `POST` | `/api/scenarios/stop` | Stop active scenario |
| `POST` | `/api/simulation/state` | Set operating state |
| `WS` | `/ws/telemetry` | Live telemetry stream |
| `GET` | `/control` | Generator control UI |

---

## Production Deployment

### Railway
1. Create a new project and link your GitHub repo
2. Set **Root Directory** to `backend`
3. Set **Start Command**: `python run.py`
4. Add env var: `ALLOWED_ORIGINS=https://your-frontend.vercel.app`

### Render
1. New Web Service → link repo
2. **Root Directory**: `backend`
3. **Build Command**: `pip install -r requirements.txt`
4. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add env var: `ALLOWED_ORIGINS=https://your-frontend.vercel.app`

### VPS / Docker
```dockerfile
FROM python:3.11-slim
WORKDIR /backend
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "run.py"]
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins | `*` |
| `HOST` | Server bind host | `0.0.0.0` |
| `PORT` | Server port | `8000` |
