from __future__ import annotations

from collections import defaultdict
from typing import Any, Callable, DefaultDict, Dict, List

from backend.app.core.logging import get_logger


class EventBus:
    """Very small in-memory event bus.

    API:
      - subscribe(event_name: str, callback: Callable[[str, Any], None])
      - publish(event_name: str, payload: Any = None) -> None

    Subscriptions are kept in memory for the process lifetime.
    Callbacks are invoked synchronously in the publisher's thread.
    """

    def __init__(self) -> None:
        self._logger = get_logger("chief.event_bus")
        self._subs: DefaultDict[str, List[Callable[[str, Any], None]]] = defaultdict(list)

    def subscribe(self, event_name: str, callback: Callable[[str, Any], None]) -> None:
        """Register a callback for an event name.

        The callback receives two positional args: the event name and the payload.
        """
        self._subs[event_name].append(callback)
        # Log subscription (useful during development)
        try:
            module_name = callback.__module__.split(".")[-1]
        except Exception:
            module_name = callback.__module__ if hasattr(callback, "__module__") else "unknown"
        self._logger.info("Subscribed: %s -> %s", event_name, module_name)

    def publish(self, event_name: str, payload: Any = None) -> None:
        """Publish an event to all subscribers.

        Logs the event, number of subscribers, and which module receives it.
        Exceptions in subscribers are caught and logged to avoid blowing up the publisher.
        """
        subscribers = list(self._subs.get(event_name, []))
        num_subs = len(subscribers)
        self._logger.info("Publishing event '%s' to %d subscriber(s)", event_name, num_subs)

        for cb in subscribers:
            try:
                module_name = cb.__module__.split(".")[-1]
            except Exception:
                module_name = cb.__module__ if hasattr(cb, "__module__") else "unknown"

            self._logger.info("Dispatching '%s' -> %s", event_name, module_name)
            try:
                cb(event_name, payload)
            except Exception as exc:
                self._logger.exception("Error in subscriber %s for event %s: %s", module_name, event_name, exc)


# module-level event bus instance
bus = EventBus()
