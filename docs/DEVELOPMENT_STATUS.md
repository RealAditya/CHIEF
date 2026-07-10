# Development Status

## Completed work

- Sprint 1: Module discovery and loader implementation.
- Sprint 2: In-memory Event Bus and event dispatching.
- Sprint 3: Frontend dashboard shell and visual identity.
- Sprint 4: Event persistence, backend CRUD, and frontend event integration.
- Sprint 5: Event experience polish, tooltip behavior, selection/edit flow, and UI text configuration.
- Sprint 7: Calendar experience stabilization, manual event creation workflow, backend validation, and CRUD lifecycle confirmation.
- Sprint 8: Calendar navigation, month/year selection, week view toggle, weekend styling, event chip polish, and keyboard shortcuts.

## Current status

- CHIEF has reached the v0.1.0-alpha milestone as the first usable version.
- The calendar now supports navigation controls and a cleaner desktop-like event presentation.
- Keyboard shortcuts are added for creating events, returning to today, and moving between periods.

## Next sprint

- Sprint 9 — Calendar Feature Expansion
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
