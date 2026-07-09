# CHIEF Agent Guide

This guide explains how future AI agents should continue work on CHIEF.

## Core principles

- Preserve the current architecture.
- Do not redesign the dashboard unless explicitly instructed.
- Keep CHIEF simple, maintainable, and deterministic.
- AI should never own core features, only help implement them.
- Avoid adding dependencies unless absolutely necessary.

## What agents should do

- Read the `/docs` directory before making changes.
- Follow the project vision in `00_PROJECT_VISION.md` and `01_ARCHITECTURE.md`.
- Use the existing module-based backend and the event-driven flow.
- Prefer plain Python and React over abstractions.
- Keep UI text configurable in `frontend/src/config/uiText.js`.

## UI behavior

- The dashboard is the permanent home screen.
- Single page dashboard only.
- The calendar is the primary interface.
- The Today panel is compact and focuses on the selected day.
- Event creation, editing, and deletion happen through the modal.

## Working with the project

- Backend changes should stay in `backend/app`.
- Frontend changes should stay in `frontend/src`.
- Use Docker Compose to run the app.
- Do not introduce backend authentication, AI services, or external push notifications.

## Documentation

- Update `docs/DEVELOPMENT_STATUS.md` after every sprint.
- Use `docs/CHANGELOG.md` for visible sprint-level changes.
- Add interaction notes to `docs/UI_INTERACTIONS.md`.
- Treat docs as living project artifacts, not one-time files.
