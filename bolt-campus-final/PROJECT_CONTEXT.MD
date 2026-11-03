# Smart Campus – Room Availability Checker (Assignment #04)

## Repository map

<!-- we will fill this in Step 1 from your real files -->

## Existing acceptance criteria (MUST be preserved)

- AC1 Valid time: start must be before end; times must be valid and not in the past relative to the fixed current time.
- AC2 Maximum booking length is 120 minutes (120 = allowed, 121 = rejected).
- AC3 A blocked room cannot be booked / reported as available.
- AC4 Overlap rules: a request overlapping an existing booking is rejected; touching intervals (end == start) are allowed.
- AC5 Booking data is immutable: checks never modify the bookings array/objects.
- AC6 Clear, responsive feedback messages (works on mobile and desktop).

## New requirements

- Catalog of at least 4 fictional rooms; each has id, name, capacity, equipment[], blocked, bookings[].
- F1 Capacity filter: room.capacity >= requested attendees.
- F2 Equipment filter: room contains ALL selected equipment.
- F3 A blocked room is never reported as available.
- F4 Clear empty state when no rooms match.
- F5 Changing the selected room refreshes the availability result; the check uses ONLY that room's bookings.

## Constraints

- Fictional data only, fixed current time (no Date.now() in logic).
- No login, payments, live APIs or database.
- Small incremental changes, not a full rewrite.
- Separate: room data / availability rules / filtering logic / UI.
- Tests: Vitest (+ React Testing Library for UI check).
