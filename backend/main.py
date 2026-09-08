"""
FastAPI Backend & WebSocket Gateway for MALE UAV Digital Twin
Streams continuous live dummy data to the React Dashboard and provides REST endpoints.
"""
import asyncio
import json
import logging
from typing import Set, Dict, Any, Optional
from contextlib import asynccontextmanager
from pathlib import Path
import sys

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

# Ensure project root is on sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from .generator import UAVDummyDataGenerator
from .config import GeneratorConfig, DEFAULT_CONFIG
from .ui import GENERATOR_HTML_CONTENT
from .models import (
    LiveStreamFrame,
    CanonicalTelemetry,
    HealthState,
    TwinVisualizationState,
    DummyAIDiagnostics,
    ResidualsData
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("uav_backend")

# Shared generator instance
generator = UAVDummyDataGenerator(DEFAULT_CONFIG)


class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"WebSocket client connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        logger.info(f"WebSocket client disconnected. Total clients: {len(self.active_connections)}")

    async def broadcast_json(self, data: Dict[str, Any]):
        if not self.active_connections:
            return
        dead_connections = set()
        for connection in self.active_connections:
            try:
                await connection.send_json(data)
            except Exception:
                dead_connections.add(connection)
        for dead in dead_connections:
            self.active_connections.discard(dead)


manager = ConnectionManager()
broadcast_task: Optional[asyncio.Task] = None


async def simulation_loop():
    """Background async worker ticking at 1 Hz to generate and broadcast frames."""
    logger.info("Simulation background streaming worker started.")
    interval = DEFAULT_CONFIG.update_interval_sec
    while True:
        try:
            frame = generator.generate_frame(dt=interval)
            frame_dict = frame.model_dump()
            await manager.broadcast_json(frame_dict)
        except Exception as e:
            logger.error(f"Error generating simulation frame: {e}", exc_info=True)
        await asyncio.sleep(interval)


@asynccontextmanager
async def lifespan(app: FastAPI):
    global broadcast_task
    broadcast_task = asyncio.create_task(simulation_loop())
    yield
    if broadcast_task:
        broadcast_task.cancel()
        await asyncio.gather(broadcast_task, return_exceptions=True)


app = FastAPI(
    title="MALE UAV Digital Twin Backend & Telemetry Stream",
    version="1.0.0",
    description="Live Aero-Piston Engine Telemetry, Digital Twin & AI Diagnostics API",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request schemas
class ScenarioStartRequest(BaseModel):
    scenario_id: str
    duration_s: float = 60.0


class StateChangeRequest(BaseModel):
    state: str  # IDLE, TAKEOFF, CLIMB, CRUISE, DESCENT, LANDING


# ============================================================
# REST Endpoints
# ============================================================

@app.get("/")
def get_root():
    return {
        "status": "ONLINE",
        "service": "MALE UAV Digital Twin API Gateway",
        "version": "1.0.0",
        "docs": "/docs",
        "websocket": "/ws/telemetry"
    }


@app.get("/api/health")
def get_health():
    frame = generator.get_latest_frame()
    return {
        "status": "OK",
        "health": frame.health,
        "system_status": frame.system_status
    }


@app.get("/api/telemetry/latest")
def get_latest_telemetry():
    frame = generator.get_latest_frame()
    return frame.telemetry


@app.get("/api/twin/state")
def get_twin_state():
    frame = generator.get_latest_frame()
    return frame.twin_state


@app.get("/api/diagnostics/latest")
def get_latest_diagnostics():
    frame = generator.get_latest_frame()
    return frame.diagnostics


@app.get("/api/residuals/latest")
def get_latest_residuals():
    frame = generator.get_latest_frame()
    return frame.twin_analysis


@app.get("/api/advisories")
def get_advisories():
    frame = generator.get_latest_frame()
    return frame.advisories


@app.get("/api/scenarios")
def get_scenarios():
    return {
        "available_scenarios": [
            {"id": "NORMAL", "name": "Normal Operation", "severity": "NONE"},
            {"id": "OVERHEATING", "name": "Engine Overheating", "severity": "HIGH"},
            {"id": "ABNORMAL_VIBRATION", "name": "Abnormal Vibration", "severity": "MEDIUM"},
            {"id": "LUBRICATION_ISSUE", "name": "Lubrication Issue", "severity": "CRITICAL"},
            {"id": "INJECTOR_ABNORMALITY", "name": "Injector Abnormality", "severity": "HIGH"},
            {"id": "SENSOR_DRIFT", "name": "EGT Sensor Drift", "severity": "MEDIUM"},
            {"id": "SENSOR_FAILURE", "name": "Sensor Signal Failure", "severity": "HIGH"},
            {"id": "MISFIRE", "name": "Cylinder Misfire", "severity": "MEDIUM"},
            {"id": "PROPELLER_OVERSPEED", "name": "Propeller Overspeed / Thrust Surge", "severity": "HIGH"},
            {"id": "MOTOR_STRESS_VIBRATION", "name": "Motor Friction & Bearing Stress", "severity": "HIGH"},
            {"id": "WING_STRUCTURAL_STRESS", "name": "Wing Structural Overload & Stress", "severity": "HIGH"},
            {"id": "MISSILE_HARDPOINT_FAULT", "name": "Missile Hardpoint / Pylon Error", "severity": "MEDIUM"},
            {"id": "AVIONICS_RADAR_FAILURE", "name": "Front Head Radar & Sensor Failure", "severity": "HIGH"},
            {"id": "HIGH_ALTITUDE_ICING", "name": "Sub-Zero High Altitude Icing (Cold Blue Glow)", "severity": "HIGH"},
            {"id": "PROPELLER_ICING", "name": "Propeller Blade Icing (Cold Blue Glow)", "severity": "HIGH"},
            {"id": "FULL_AIRFRAME_ALERT", "name": "Full Airframe Critical (All Parts Glow)", "severity": "CRITICAL"},
        ],
        "active_scenario": generator.fault_injector.active_scenario
    }


@app.post("/api/scenarios/start")
async def start_scenario(req: ScenarioStartRequest):
    scenario = generator.start_scenario(req.scenario_id, req.duration_s)
    try:
        frame = generator.generate_frame(dt=0.01)
        await manager.broadcast_json(frame.model_dump())
    except Exception as e:
        logger.error(f"Error broadcasting on scenario start: {e}")
    return {
        "status": "STARTED",
        "scenario": scenario
    }


@app.post("/api/scenarios/stop")
async def stop_scenario():
    event = generator.stop_scenario()
    try:
        frame = generator.generate_frame(dt=0.01)
        await manager.broadcast_json(frame.model_dump())
    except Exception as e:
        logger.error(f"Error broadcasting on scenario stop: {e}")
    return {
        "status": "STOPPED",
        "event": event
    }


@app.post("/api/simulation/state")
async def set_simulation_state(req: StateChangeRequest):
    state_upper = req.state.upper()
    valid_states = ["IDLE", "TAKEOFF", "CLIMB", "CRUISE", "DESCENT", "LANDING"]
    if state_upper not in valid_states:
        raise HTTPException(status_code=400, detail=f"Invalid state. Must be one of: {valid_states}")
    generator.set_operating_state(state_upper)
    try:
        frame = generator.generate_frame(dt=0.01)
        await manager.broadcast_json(frame.model_dump())
    except Exception as e:
        logger.error(f"Error broadcasting on simulation state: {e}")
    return {
        "status": "UPDATED",
        "operating_state": state_upper
    }


# ============================================================
# Generator Web UI & Manual Parameter Control Endpoints
# ============================================================

@app.get("/control", response_class=HTMLResponse)
@app.get("/generator", response_class=HTMLResponse)
@app.get("/generator-ui", response_class=HTMLResponse)
def get_generator_ui():
    """Interactive Web UI for live slider adjustments and TAPAS DRDO scenario control."""
    return HTMLResponse(content=GENERATOR_HTML_CONTENT)


class ManualControlRequest(BaseModel):
    manual_override: bool = True
    values: Optional[Dict[str, Any]] = None


class ManualParamRequest(BaseModel):
    key: str
    value: Any


@app.get("/api/manual-control")
def get_manual_control_state():
    return {
        "manual_override": generator.physics.manual_override,
        "values": generator.physics.manual_state
    }


@app.post("/api/manual-control")
async def set_manual_control_state(req: ManualControlRequest):
    generator.physics.set_manual_override(req.manual_override, req.values)
    try:
        frame = generator.generate_frame(dt=0.01)
        await manager.broadcast_json(frame.model_dump())
    except Exception as e:
        logger.error(f"Error broadcasting on manual control: {e}")
    return {
        "status": "UPDATED",
        "manual_override": generator.physics.manual_override,
        "values": generator.physics.manual_state
    }


@app.post("/api/manual-control/param")
async def update_manual_param(req: ManualParamRequest):
    generator.physics.update_manual_value(req.key, req.value)
    try:
        frame = generator.generate_frame(dt=0.01)
        await manager.broadcast_json(frame.model_dump())
    except Exception as e:
        logger.error(f"Error broadcasting on param update: {e}")
    return {
        "status": "UPDATED",
        "key": req.key,
        "value": req.value
    }


# ============================================================
# WebSocket Endpoints
# ============================================================

@app.websocket("/ws/telemetry")
@app.websocket("/ws")
@app.websocket("/ws/live")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial snapshot immediately upon connect
        initial_frame = generator.get_latest_frame()
        await websocket.send_json(initial_frame.model_dump())

        while True:
            # Handle any incoming client messages / commands
            message_text = await websocket.receive_text()
            try:
                msg = json.loads(message_text)
                action = msg.get("action")
                if action == "inject_scenario":
                    scen_id = msg.get("scenario_id", "NORMAL")
                    duration = float(msg.get("duration_s", 60.0))
                    generator.start_scenario(scen_id, duration)
                elif action == "stop_scenario":
                    generator.stop_scenario()
                elif action == "set_state":
                    state = msg.get("state", "CRUISE")
                    generator.set_operating_state(state)
                elif action == "manual_override":
                    generator.physics.set_manual_override(msg.get("enabled", True), msg.get("values"))
                elif action == "update_param":
                    generator.physics.update_manual_value(msg.get("key"), msg.get("value"))
            except Exception as e:
                logger.warning(f"Failed to process client message: {e}")

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, log_level="info")
