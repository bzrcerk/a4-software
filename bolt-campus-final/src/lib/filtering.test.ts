import { describe, expect, it } from 'vitest';
import { ROOMS } from '@/data/rooms';
import { filterRooms, parseAttendees } from '@/lib/filtering';

describe('Attendee validation', () => {
  it.each(['', ' ', '0', '-1', '1.5', 'NaN', 'Infinity', '1e2', '2x', '9007199254740992'])(
    'rejects %j', (input) => expect(parseAttendees(input)).toBeNull(),
  );
  it.each([['1', 1], ['12', 12], ['40', 40]] as const)(
    'accepts %s attendees', (input, expected) => expect(parseAttendees(input)).toBe(expected),
  );
});

describe('Capacity AND all required equipment', () => {
  it('includes exact capacity and excludes smaller rooms', () => {
    expect(filterRooms(ROOMS, 12, []).map((room) => room.id)).toEqual(['B-204', 'C-310', 'D-120']);
  });
  it('keeps all rooms for one attendee with no equipment requirements', () => {
    expect(filterRooms(ROOMS, 1, [])).toEqual(ROOMS);
  });
  it('requires every selected item, not just one', () => {
    expect(filterRooms(ROOMS, 1, ['Whiteboard', 'Projector']).map((room) => room.id)).toEqual(['B-204']);
  });
  it('requires capacity and equipment together', () => {
    expect(filterRooms(ROOMS, 13, ['Whiteboard', 'Projector'])).toEqual([]);
  });
  it('keeps a matching blocked room visible', () => {
    expect(filterRooms(ROOMS, 40, ['Microphone'])).toEqual([ROOMS[3]]);
  });
  it('returns no matches for excess capacity or an impossible equipment combination', () => {
    expect(filterRooms(ROOMS, 41, [])).toEqual([]);
    expect(filterRooms(ROOMS, 1, ['Computers', 'Display'])).toEqual([]);
  });
  it.each([0, -1, 1.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid numeric attendees %s', (attendees) => expect(filterRooms(ROOMS, attendees, [])).toEqual([]),
  );
  it('does not mutate frozen room data or equipment requirements', () => {
    const rooms = structuredClone(ROOMS);
    const before = structuredClone(rooms);
    for (const room of rooms) {
      room.bookings.forEach(Object.freeze);
      Object.freeze(room.bookings);
      Object.freeze(room.equipment);
      Object.freeze(room);
    }
    Object.freeze(rooms);
    const equipment = Object.freeze(['Projector'] as const);
    const result = filterRooms(rooms, 12, equipment);
    expect(result).toEqual([rooms[0], rooms[2], rooms[3]]);
    expect(result[0]).toBe(rooms[0]);
    expect(rooms).toEqual(before);
    expect(equipment).toEqual(['Projector']);
  });
});
