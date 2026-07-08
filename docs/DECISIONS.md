# CHIEF - Architectural Decisions (Design Freeze v1)

Design Freeze v1: The dashboard design and visual language have been finalized for the initial phase of CHIEF. Future UI work must follow this design language unless explicitly instructed otherwise.

Accepted decisions

1. Calendar is the primary interface of CHIEF.
2. CHIEF follows a module-based architecture.
3. AI is optional and never owns core functionality.
4. Dashboard-first UX with minimal navigation.

Locked decisions (Design Freeze v1)

- The dashboard is the permanent home screen of CHIEF.
- The monthly calendar is the primary visual element.
- The dashboard must not have page-level scrolling (the UI fits the viewport; internal components may scroll if necessary).
- The Today panel remains compact and focused.
- The Chief command bar stays fixed at the bottom.
- Orbitron is used only for the CHIEF logo.
- Space Grotesk is used for the rest of the interface.
- The current color palette in frontend/src/main.css becomes the project's default theme.
- Existing component structure (TopNav, Calendar, TodayPanel, CommandBar) should be preserved.

Guidelines for future UI work

- Do not redesign the dashboard unless explicitly instructed. New UI features should extend the existing design language.
- Future sprints should focus on adding functionality (data integration, interactions, events) rather than changing layout or visual identity.
- Any proposed visual change must be documented and approved before implementation.

By recording these locked decisions here, the team ensures visual stability and consistency across future development.
