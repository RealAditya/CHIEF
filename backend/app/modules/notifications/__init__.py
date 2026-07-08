MODULE = {
    "name": "notifications",
    "version": "0.1.0",
    "description": "Notifications module",
}

# Example subscriber registration for Sprint 2 (Pulse)
# Subscribes to booking_created and logs receipt. No business logic.
try:
    from backend.app.core.event_bus import bus as event_bus
    from backend.app.core.logging import get_logger

    _logger = get_logger("chief.module.notifications")

    def _on_booking_created(event_name: str, payload: dict | None) -> None:
        _logger.info("notifications received event '%s' with payload: %s", event_name, payload)

    event_bus.subscribe("booking_created", _on_booking_created)
except Exception:  # pragma: no cover - defensive, imports may fail in some test environments
    pass
