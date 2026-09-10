"""
MALE UAV Digital Twin Backend — Entry Point
Run this script to start the FastAPI server:
    python run.py
Or with uvicorn directly:
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
"""
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        log_level="info",
        reload=False,  # Set to True for development hot-reload
    )
