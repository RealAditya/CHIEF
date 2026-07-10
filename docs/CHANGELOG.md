# Changelog

## v0.1.0-alpha

- First usable version of CHIEF completed.
- Finalized Sprint 7 calendar experience stabilization and validated the first working event lifecycle.
- Added calendar navigation, month/year selection, and week view polish.
- Improved event chip layout to show time, title, and category colors without emojis.
- Added keyboard shortcuts for new event, today, and month navigation.
- Retained the existing dashboard layout while making the calendar feel more desktop-grade.

## Sprint 8.1 — Calendar Layout Refinement

- Stabilized the calendar grid so it always renders as a complete 6x7 matrix (previous and next month days included).
- Day cells now have a consistent layout so events never increase cell height or resize the calendar.
- Event rendering limited to the number that physically fits in a day cell; additional events are shown via a compact overflow control with colored dots representing hidden event categories.
- Weekend columns are consistently tinted across all weeks, including days from previous/next months.
- No behavioral changes to CRUD, navigation, pickers, week view, tooltips, or keyboard shortcuts — this is only a rendering refinement.

## 2026-07-09

### Sprint 9 — Smart Add Parser Foundation

- Added deterministic, rule-based Smart Add parser backend package (backend/app/parser) and a POST /parse endpoint.
- Integrated Smart Add modal to call the parser and show an editable preview before creating events.
- Parser detects dates (today, tomorrow, next Monday), times (5pm, 5:30pm, noon, midnight), common date formats, simple recurrence phrases, and category hints.
- Added unit tests for parser rules.  


### Sprint 5 — Event Experience Polish

- Locked dashboard heading terminology to "Your Month".
- Added frontend UI text configuration in `frontend/src/config/uiText.js`.
- Updated event tooltip rendering to use a portal and viewport-safe positioning.
- Improved event chip hover animation and selected-event highlighting.
- Made single click select and double click open the Event Details modal.
- Ensured delete always shows a confirmation dialog.
- Added living documentation files for UI interactions, agent guidance, development status, changelog, and roadmap.

### Sprint 6 — Event Interaction Preparation

- Prepared dual event creation architecture with Manual Event and Smart Add buttons.
- Added a Smart Add placeholder modal for future natural language event creation.
- Added frontend parser example placeholders in `frontend/src/config/eventParserExamples.js`.
- Documented that manual event creation remains the permanent fallback.
