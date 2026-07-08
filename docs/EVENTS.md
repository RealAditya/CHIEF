# CHIEF Events

This document lists events known to CHIEF and the modules that publish / subscribe them.

---

## booking_created

- Event name: booking_created
- Publisher: booking module (example)
- Subscribers: calendar, notifications
- Purpose: Notify other modules that a booking was created so they can react
  (e.g. add calendar entry, prepare notifications). For Sprint 2 these are
  example subscribers which only log that they received the event.

---

> Notes:
>
> - This is the minimal set of events known for the sprint. As features are
>   implemented this document should be updated to include new events and any
>   structured payload schemas that form the contract between modules.
> - The EventBus is intentionally synchronous and in-memory for Sprint 2.
