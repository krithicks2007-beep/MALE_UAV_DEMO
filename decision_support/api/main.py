"""
Decision Support System FastAPI Interface
Provides REST API endpoints for state evaluation without embedding decision logic into API routing.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ..models.input_state import DecisionInput
from ..models.decision_result import DecisionResult
from ..engine.decision_engine import DecisionEngine

app = FastAPI(
    title="MALE UAV Aero-Piston Engine Decision Support System API",
    description="SIH 2026 Problem Statement 26054 Decision Support Module",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = DecisionEngine()


@app.get("/")
def root():
    return {
        "service": "MALE UAV Decision Support System (DSS) API",
        "status": "ONLINE",
        "docs": "http://localhost:8001/docs",
        "endpoints": {
            "health": "/health",
            "version": "/version",
            "evaluate": "POST /decision/evaluate",
            "documentation": "/docs"
        }
    }


@app.get("/health")
def health_check():

    return {
        "status": "ONLINE",
        "service": "Decision Support System",
        "version": "0.1.0",
    }


@app.get("/version")
def get_version():
    return {
        "decision_engine_version": "0.1.0",
        "schema_version": "1.0.0",
        "rules_version": "0.1.0",
    }


@app.post("/decision/evaluate", response_model=DecisionResult)
def evaluate_decision(payload: DecisionInput):
    try:
        result = engine.evaluate(payload)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
