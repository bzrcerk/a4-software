import { checkAvailability, type AvailabilityResult } from '@/lib/booking';
import type { Room } from '@/types/room';

export function checkRoomAvailability(
  room: Room, start: number, end: number, now: number,
): AvailabilityResult {
  return checkAvailability(start, end, now, room.blocked, room.bookings);
}

export function confirmRoomBooking(
  rooms: Room[], roomId: string, start: number, end: number, now: number,
): Room[] {
  const room = rooms.find((candidate) => candidate.id === roomId);
  if (!room || !checkRoomAvailability(room, start, end, now).available) return rooms;

  // A valid slot cannot already exist, so this ID is deterministic and unique in the room.
  const booking = { id: `${room.id}-${start}-${end}`, start, end, label: 'New Booking' };
  return rooms.map((candidate) => candidate.id === roomId
    ? { ...candidate, bookings: [...candidate.bookings, booking] }
    : candidate);
}

export function toggleRoomBlocked(rooms: Room[], roomId: string): Room[] {
  return rooms.map((room) => room.id === roomId ? { ...room, blocked: !room.blocked } : room);
}
