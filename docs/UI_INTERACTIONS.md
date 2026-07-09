# CHIEF UI Interactions

This document describes the current CHIEF user interface behavior and interaction patterns.

## Dashboard

- The primary view is the monthly calendar.
- Each day is selectable.
- The Today panel displays events for the selected date.
- The command bar at the bottom is a disabled placeholder for future input.

## Event Selection

- Single click on an event chip selects and highlights the event.
- Double click on an event chip opens the Event Details modal.
- Selected events remain visually distinct across the calendar and Today panel.
- Day cells are also selectable, and the selected day is highlighted.

## Tooltips

- Hovering an event chip reveals a tooltip with event title, time, and description.
- Tooltips are rendered through a portal so they remain visible even when the calendar grid is constrained.
- Tooltip placement is adjusted to stay within the browser viewport.

## Event Modal

- The Create / Edit modal is the single place for event creation and editing.
- Create mode opens from Quick Add.
- Edit mode opens via double click on an existing event.
- Delete always requires confirmation.
- The modal uses CHIEF styling and does not rely on browser default form appearance.

## Empty States

- Empty state messaging is calm and minimal.
- When a selected day has no events, the user sees a gentle message instead of a generic placeholder.
