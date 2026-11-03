# Smart Campus Room Availability Checker

A client-side React and TypeScript application for Software Engineering Assignment #04. Find a fictional campus room by capacity and equipment, check a time interval, and confirm a booking in the current session.

The demo uses a **fixed current time of 09:00**. It has no backend, database, login, payments or live booking API. Refreshing the page resets bookings and blocked-room changes.

## Getting started

Use Node.js **24 or newer** and npm. The latest recorded checks used Node.js **26.3.0** and npm **11.16.0**.

Run these commands from `bolt-campus-final`:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Dependency installation requires access to the npm registry or a suitable local cache. No environment variables or service credentials are needed.

The sibling directory `bolt-campus` is the preserved original version. Make project changes only in `bolt-campus-final`.

## Using the demo

1. Enter a positive whole number of attendees.
2. Select any required equipment. A room must have **all** selected items and enough capacity.
3. Select a matching room to view its details and existing bookings.
4. Enter start and end times, then select **Check Availability**.
5. If the slot is available, select **Confirm Booking**. Only that room receives the new booking.

The blocked/unblocked button changes the selected room's status for the current session. Matching blocked rooms remain visible but cannot be booked while blocked.

Changing rooms refreshes availability. After a check, changes to the requested times or room status also update the result. If filters exclude the selected room, selection and feedback are cleared. Relaxing the filters requires selecting a room again.

### Fictional room catalog

| Room | Capacity | Equipment | Initially blocked | Existing bookings |
| --- | ---: | --- | --- | --- |
| B-204 | 12 | Whiteboard, Projector | No | 10:00–11:00; 13:00–14:00 |
| A-101 | 6 | Whiteboard | No | 11:00–12:00 |
| C-310 | 24 | Projector, Computers | No | 14:00–15:00 |
| D-120 | 40 | Projector, Microphone | Yes | 10:00–11:00 |
| E-205 | 10 | Whiteboard, Display | No | None |

For example, the default 11:00–12:00 request is available in B-204 because it touches the end of an existing booking. The same request overlaps A-101's booking. D-120 is unavailable while blocked.

## Requirements and rules

| Requirement | Implemented behavior |
| --- | --- |
| AC1 | Reject empty/malformed times, non-finite or fractional minute values, invalid intervals and starts at or before 09:00. Numeric intervals must satisfy `0 <= start < end <= 1440`. |
| AC2 | Allow durations up to exactly 120 minutes; reject 121 minutes and above. |
| AC3 | Reject availability and confirmation for a blocked room. |
| AC4 | Reject overlapping intervals; allow touching endpoints. |
| AC5 | Availability checks do not mutate bookings. Confirmation copies the selected room and its bookings array. |
| AC6 | Display text and icon feedback, validation errors and status announcements within a responsive layout. |
| F1 | Require `room.capacity >= attendees`. |
| F2 | Require every selected equipment item, combined with capacity using AND. |
| F3 | Keep matching blocked rooms visible but unavailable. |
| F4 | Show an empty state when no rooms match. |
| F5 | Refresh feedback on room selection and check only that room's bookings. |

Time parsing accepts strict `HH:mm` values, plus `24:00` as the numeric end-of-day boundary. Overnight bookings and calendar dates are outside the demo's scope.

## Architecture

```text
src/
  main.tsx                       React entry point
  App.tsx                        Local state, event coordination and page composition
  App.test.tsx                   Rendered UI integration tests
  components/
    RoomFilters.tsx              Attendee and equipment controls
    RoomSelector.tsx             Room selection, details and empty state
    BookingForm.tsx              Time inputs, duration, block toggle and check action
    AvailabilityFeedback.tsx     Availability result and confirmation action
    BookingList.tsx              Selected room's bookings, sorted using a copy
  data/
    rooms.ts                     Fictional catalog and fixed demo time
  types/
    room.ts                      Room and equipment types
  lib/
    booking.ts                   Time parsing, formatting and availability rules
    filtering.ts                 Pure attendee validation and room filtering
    rooms.ts                     Room-specific checks and immutable updates
    booking.test.ts              Original 12 baseline tests
    booking.validation.test.ts   Time-validation regressions
    booking.overlap.test.ts      Additional overlap scenarios
    filtering.test.ts            Capacity/equipment filtering tests
    rooms.test.ts                Catalog and room-isolation tests
  index.css                      Shared styling and Tailwind directives
```

`App` owns local state and passes typed props and callbacks to focused components. Business rules remain independent of React. Parsed start/end minutes are computed in one place and reused for checking, confirmation, duration and feedback.

The UI uses Tailwind CSS and Lucide icons. Vite builds the application. Vitest runs the tests; rendered UI tests use React `createRoot`, `act` and jsdom, without React Testing Library.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm test` | Run the complete Vitest suite once. |
| `npm test -- --reporter=verbose` | Run tests with individual case names. |
| `npm run typecheck` | Check application TypeScript without emitting files. |
| `npm run lint` | Run ESLint. |
| `npm run build` | Generate the production build in `dist/`. |
| `npm run preview` | Serve the production build locally after building. |

## Recorded verification

Latest recorded automated run: **3 November 2026**, using Vitest **2.1.9**. These are recorded results, not a guarantee for later changes.

| Test file | Passing cases |
| --- | ---: |
| `src/lib/booking.test.ts` | 12 |
| `src/lib/booking.validation.test.ts` | 39 |
| `src/lib/booking.overlap.test.ts` | 5 |
| `src/lib/rooms.test.ts` | 17 |
| `src/lib/filtering.test.ts` | 27 |
| `src/App.test.tsx` | 14 |
| **Total** | **114** |

The suite includes the original 12 tests unchanged, 120/121-minute boundaries, touching and overlapping intervals, exact/insufficient capacity, invalid inputs, frozen-data immutability, room switching, empty-state recovery and confirmation isolation.

The following commands all exited with code **0**:

```sh
npm --logs-max=0 test -- --reporter=verbose
npm --logs-max=0 run typecheck
npm --logs-max=0 run lint
npm --logs-max=0 run build
```

Typecheck and lint reported no diagnostics. The build reported an existing warning that Browserslist's `caniuse-lite` data was outdated. No test failures occurred. No instrumented coverage percentage was collected.

## Known limitations

- Bookings and blocked status exist only in memory. There is no persistence or synchronization between users or tabs.
- The fixed 09:00 clock and fictional data are intentional demo constraints.
- jsdom tests verify rendered interactions, not real-browser layout, native time pickers or screen-reader announcements. Dedicated keyboard/focus and cross-browser tests remain absent.
- Although the domain accepts minute 1440, the formatter displays it as `00:00`; native time inputs may not expose `24:00` as an entry option.
- Validation-message precedence when several rules fail simultaneously is not comprehensively tested.
- The page references Google Fonts. The application does not call a live booking API; the declared Supabase dependency is unused.

Assignment context is recorded in [PROJECT_CONTEXT.MD](PROJECT_CONTEXT.MD), with an AI-work log in [AI_LOG.MD](AI_LOG.MD).
