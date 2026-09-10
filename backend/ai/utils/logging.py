"""
MALE UAV Digital Twin - Module X4 (AI/ML + Diagnostics)
Structured Diagnostic Logging & Traceability Utilities
"""

import time
from typing import Dict, Any, Optional


class DiagnosticLogger:
    """
    Provides structured diagnostic logs maintaining full mission, frame,
    and model version traceability.
    """

    def __init__(self, service_name: str = "X4-Diagnostics"):
        self.service_name = service_name

    def format_log(
        self,
        level: str,
        message: str,
        mission_id: str,
        frame_id: int,
        extra: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        return {
            "service": self.service_name,
            "timestamp": time.time(),
            "level": level.upper(),
            "mission_id": mission_id,
            "frame_id": frame_id,
            "message": message,
            "extra": extra or {}
        }
