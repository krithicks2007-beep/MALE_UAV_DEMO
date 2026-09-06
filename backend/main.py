"""
Backward compatibility forwarder: Backend main has been moved to dummy_data_generator/main.py
"""
from dummy_data_generator.main import (
    app,
    generator,
    manager,
    ConnectionManager,
    ScenarioStartRequest,
    StateChangeRequest,
    ManualControlRequest,
    ManualParamRequest,
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("dummy_data_generator.main:app", host="0.0.0.0", port=8000, log_level="info")
