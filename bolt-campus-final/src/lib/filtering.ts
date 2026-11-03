import type { Equipment, Room } from '@/types/room';

export function parseAttendees(input: string): number | null {
  if (!/^\d+$/.test(input)) return null;
  const value = Number(input);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

// Blocking is an availability rule, not a catalog filter.
export function filterRooms(
  rooms: readonly Room[], attendees: number, equipment: readonly Equipment[],
): Room[] {
  if (!Number.isSafeInteger(attendees) || attendees <= 0) return [];
  return rooms.filter((room) => room.capacity >= attendees
    && equipment.every((item) => room.equipment.includes(item)));
}
