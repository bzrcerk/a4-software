import { describe, expect, it } from 'vitest';
import { ROOMS, DEMO_NOW_MINUTES } from '@/data/rooms';
import { checkRoomAvailability, confirmRoomBooking, toggleRoomBlocked } from '@/lib/rooms';

describe('Fictional room catalog', () => {
  it('contains the five specified rooms, equipment and schedules', () => {
    expect(ROOMS.map(({ id, capacity, equipment, blocked, bookings }) => ({
      id, capacity, equipment, blocked, slots: bookings.map(({ start, end }) => [start, end]),
    }))).toEqual([
      { id: 'B-204', capacity: 12, equipment: ['Whiteboard', 'Projector'], blocked: false, slots: [[600, 660], [780, 840]] },
      { id: 'A-101', capacity: 6, equipment: ['Whiteboard'], blocked: false, slots: [[660, 720]] },
      { id: 'C-310', capacity: 24, equipment: ['Projector', 'Computers'], blocked: false, slots: [[840, 900]] },
      { id: 'D-120', capacity: 40, equipment: ['Projector', 'Microphone'], blocked: true, slots: [[600, 660]] },
      { id: 'E-205', capacity: 10, equipment: ['Whiteboard', 'Display'], blocked: false, slots: [] },
    ]);
    expect(new Set(ROOMS.map((room) => room.id)).size).toBe(5);
    expect(DEMO_NOW_MINUTES).toBe(540);
  });

  it.each([
    ['B-204', true], ['A-101', false], ['C-310', true], ['D-120', false], ['E-205', true],
  ] as const)('checks only %s for the same 11:00–12:00 request', (id, available) => {
    const room = ROOMS.find((candidate) => candidate.id === id)!;
    expect(checkRoomAvailability(room, 660, 720, DEMO_NOW_MINUTES).available).toBe(available);
  });

  it('rejects the blocked room even when its schedule is clear', () => {
    const result = checkRoomAvailability(ROOMS[3], 720, 780, DEMO_NOW_MINUTES);
    expect(result.available).toBe(false);
    expect(result.reason).toMatch(/blocked/);
  });
});

describe('Room update isolation', () => {
  function frozenCatalog() {
    const rooms = structuredClone(ROOMS);
    for (const room of rooms) {
      room.bookings.forEach(Object.freeze);
      Object.freeze(room.bookings);
      Object.freeze(room.equipment);
      Object.freeze(room);
    }
    Object.freeze(rooms);
    return rooms;
  }

  it('confirms immutably in E-205 without changing any other room or the fixtures', () => {
    const before = structuredClone(ROOMS);
    const rooms = frozenCatalog();
    const updated = confirmRoomBooking(rooms, 'E-205', 660, 720, DEMO_NOW_MINUTES);
    expect(updated).not.toBe(rooms);
    expect(updated[4]).not.toBe(rooms[4]);
    expect(updated[4].bookings).toEqual([
      { id: 'E-205-660-720', start: 660, end: 720, label: 'New Booking' },
    ]);
    rooms.slice(0, 4).forEach((room, index) => expect(updated[index]).toBe(room));
    expect(rooms).toEqual(before);
    expect(ROOMS).toEqual(before);
    expect(checkRoomAvailability(updated[4], 660, 720, DEMO_NOW_MINUTES).available).toBe(false);
    expect(checkRoomAvailability(updated[0], 660, 720, DEMO_NOW_MINUTES).available).toBe(true);
  });

  it.each([
    ['D-120', 720, 780], ['A-101', 660, 720], ['E-205', NaN, 720],
    ['E-205', 540, 600], ['E-205', 600, 721], ['missing', 660, 720],
  ] as const)('does not confirm an invalid request for %s (%s–%s)', (id, start, end) => {
    const rooms = frozenCatalog();
    expect(confirmRoomBooking(rooms, id, start, end, DEMO_NOW_MINUTES)).toBe(rooms);
  });

  it('rechecks confirmation against the latest bookings to prevent duplicates', () => {
    const updated = confirmRoomBooking(frozenCatalog(), 'E-205', 660, 720, DEMO_NOW_MINUTES);
    expect(confirmRoomBooking(updated, 'E-205', 660, 720, DEMO_NOW_MINUTES)).toBe(updated);
    expect(updated[4].bookings).toHaveLength(1);
  });

  it('preserves original bookings when adding a touching request to B-204', () => {
    const rooms = frozenCatalog();
    const updated = confirmRoomBooking(rooms, 'B-204', 660, 720, DEMO_NOW_MINUTES);
    expect(updated[0].bookings).toHaveLength(3);
    expect(updated[0].bookings.slice(0, 2)).toEqual(rooms[0].bookings);
    expect(updated[1]).toBe(rooms[1]);
  });

  it('toggles blocking only for the selected room without mutating input', () => {
    const rooms = frozenCatalog();
    const updated = toggleRoomBlocked(rooms, 'B-204');
    expect(updated[0].blocked).toBe(true);
    expect(updated[0].bookings).toBe(rooms[0].bookings);
    rooms.slice(1).forEach((room, index) => expect(updated[index + 1]).toBe(room));
    expect(rooms[0].blocked).toBe(false);
    expect(checkRoomAvailability(updated[0], 660, 720, DEMO_NOW_MINUTES).available).toBe(false);
    expect(toggleRoomBlocked(updated, 'B-204')[0].blocked).toBe(false);
  });
});
