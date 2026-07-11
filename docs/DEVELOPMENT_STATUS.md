# Development Status

## Completed work

- Sprint 1: Module discovery and loader implementation.
- Sprint 2: In-memory Event Bus and event dispatching.
- Sprint 3: Frontend dashboard shell and visual identity.
- Sprint 4: Event persistence, backend CRUD, and frontend event integration.
- Sprint 5: Event experience polish, tooltip behavior, selection/edit flow, and UI text configuration.
- Sprint 7: Calendar experience stabilization, manual event creation workflow, backend validation, and CRUD lifecycle confirmation.
- Sprint 8: Calendar navigation, month/year selection, week view toggle, weekend styling, event chip polish, and keyboard shortcuts.
- Sprint 8.1: Calendar layout refinement — fixed 6x7 grid, stable day cell height, overflow handling, and weekend column tinting.

## Current status

- CHIEF has reached the v0.1.0-alpha milestone as the first usable version.
- The calendar now supports navigation controls and a cleaner desktop-like event presentation.
- Layout refinements ensure the calendar always fits perfectly in the viewport and events do not resize the grid.
- Keyboard shortcuts are added for creating events, returning to today, and moving between periods.

## Next sprint

- Sprint 9 — Calendar Feature Expansion
  - Add recurring events and reminders.
  - Introduce authentication and persistence hardening.
  - Continue Smart Add planning while preserving simplicity and privacy.

### Sprint 9 (in-progress)

- Implemented deterministic Smart Add parser backend package with modular architecture.
- Parser components: normalizer (abbreviations), dates, time, duration, recurrence, category, priority, title, confidence.
- Created backend/app/config/parser_defaults.py for configurable keywords and defaults.
- Exposed POST /parse endpoint for parsing preview (no event creation).
- Integrated Smart Add modal to display parsed fields before event creation.
- Parser returns: title, description, start_datetime, end_datetime, category, priority, recurrence, confidence, warnings.
- Confidence scoring and warnings help users identify incomplete or inferred fields.

### Sprint 9.1 — In Progress (2026-07-11)

- Polished Smart Add title extraction to remove dates, times, durations, and numeric ranges, returning clearer activity titles.
- Improved time and duration parsing to support explicit ranges and produce accurate start/end datetimes.
- Expanded category keyword lists to improve automatic category suggestions (shopping, government, errands, entertainment, sports).
- Adjusted confidence scoring to more accurately reflect detected fields and reduce score when defaults are assumed.
- Frontend month view polished so the month grid fits a 1920×1080 desktop viewport without causing page scroll; overflow day event lists open in internal popovers.

## Notes

- CHIEF now officially supports two event creation paths:
  - Manual creation: existing modal flow, always the fallback.
  - Future AI/NLP creation: Smart Add placeholder that will be enabled in a later sprint.

## Known issues

- The current event tooltip system is simple and may need edge-case positioning refinements.
- The dashboard remains a frontend-only shell with no backend authentication.
- No recurring events or reminders are implemented.
