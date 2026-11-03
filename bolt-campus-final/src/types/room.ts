import type { Booking } from '@/lib/booking';

export type Equipment = 'Whiteboard' | 'Projector' | 'Computers' | 'Microphone' | 'Display';

export interface Room {
  id: string;
  name: string;
  capacity: number;
  equipment: Equipment[];
  blocked: boolean;
  bookings: Booking[];
}
