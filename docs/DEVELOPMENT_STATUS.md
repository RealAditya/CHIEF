# Development Status

## Completed work

- Sprint 1: Module discovery and loader implementation.
- Sprint 2: In-memory Event Bus and event dispatching.
- Sprint 3: Frontend dashboard shell and visual identity.
- Sprint 4: Event persistence, backend CRUD, and frontend event integration.
- Sprint 5: Event experience polish, tooltip behavior, selection/edit flow, and UI text configuration.

## Current sprint

- Sprint 5 — Event Experience Polish
  - Locked dashboard terminology.
  - Moved user-facing text into `frontend/src/config/uiText.js`.
  - Polished event tooltip behavior and selection states.
  - Ensured double click opens the edit modal.
  - Confirmed delete requires user confirmation.

## Next sprint

- Sprint 6 — Event Interaction
  - Refine the event lifecycle with full view/edit/delete flows.
  - Add hover tooltips and consistent event type styling.
  - Keep the same dashboard layout and interaction model.

## Known issues

- The current event tooltip system is simple and may need edge-case positioning refinements.
- The dashboard remains a frontend-only shell with no backend authentication.
- No recurring events or reminders are implemented.
