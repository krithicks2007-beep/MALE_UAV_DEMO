import threading


class FrameCounter:
    """Thread-safe monotonic telemetry frame counter."""

    def __init__(self, start: int = 1):
        self._current = start - 1
        self._lock = threading.Lock()

    def next_frame(self) -> int:
        with self._lock:
            self._current += 1
            return self._current

    def reset(self, start: int = 1):
        with self._lock:
            self._current = start - 1

    @property
    def current(self) -> int:
        with self._lock:
            return self._current
