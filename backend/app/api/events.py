from typing import Any, Dict

from fastapi import APIRouter
from pydantic import BaseModel

from backend.app.core.event_bus import bus as event_bus

router = APIRouter()


class EventTest(BaseModel):
    event: str
    payload: Dict[str, Any] | None = None


@router.post("/events/test")
def test_event(ev: EventTest) -> Dict[str, str]:
    """Publish an event via the in-memory EventBus.

    This endpoint is intentionally simple for testing and development.
    """
    event_bus.publish(ev.event, ev.payload)
    return {"status": "published", "event": ev.event}
