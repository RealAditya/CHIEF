# Changelog

## v0.1.0-alpha

- First usable version of CHIEF completed.
- Finalized Sprint 7 calendar experience stabilization and validated the first working event lifecycle.
- Backend event CRUD now persists create, edit, and delete operations with stable validation.
- Frontend dashboard shell supports manual event creation, editing, deletion, and confirmation flows.
- Added milestone documentation and updated status and roadmap to reflect the release readiness.

## 2026-07-09

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
