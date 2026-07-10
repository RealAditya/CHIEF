# Development Status

## Completed work

- Sprint 1: Module discovery and loader implementation.
- Sprint 2: In-memory Event Bus and event dispatching.
- Sprint 3: Frontend dashboard shell and visual identity.
- Sprint 4: Event persistence, backend CRUD, and frontend event integration.
- Sprint 5: Event experience polish, tooltip behavior, selection/edit flow, and UI text configuration.
- Sprint 7: Calendar experience stabilization, manual event creation workflow, backend validation, and CRUD lifecycle confirmation.

## Current status

- CHIEF has reached the v0.1.0-alpha milestone as the first usable version.
- The dashboard shell supports manual event creation, editing, deletion, and persistent event storage.
- The core calendar event flow is stable and documented for future sprint planning.

## Next sprint

- Sprint 8 — Calendar Feature Expansion
  - Add recurring events and reminders.
  - Introduce authentication and persistence hardening.
  - Continue Smart Add planning while preserving simplicity and privacy.

## Notes

- CHIEF now officially supports two event creation paths:
  - Manual creation: existing modal flow, always the fallback.
  - Future AI/NLP creation: Smart Add placeholder that will be enabled in a later sprint.

## Known issues

- The current event tooltip system is simple and may need edge-case positioning refinements.
- The dashboard remains a frontend-only shell with no backend authentication.
- No recurring events or reminders are implemented.
