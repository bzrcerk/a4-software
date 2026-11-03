import type { Room } from '@/types/room';

export const DEMO_NOW_MINUTES = 9 * 60;

export const ROOMS: Room[] = [
  {
    id: 'B-204', name: 'Room B-204', capacity: 12,
    equipment: ['Whiteboard', 'Projector'], blocked: false,
    bookings: [
      { id: 'b1', start: 600, end: 660, label: 'Faculty Meeting' },
      { id: 'b2', start: 780, end: 840, label: 'Study Group' },
    ],
  },
  {
    id: 'A-101', name: 'Room A-101', capacity: 6,
    equipment: ['Whiteboard'], blocked: false,
    bookings: [{ id: 'a1', start: 660, end: 720, label: 'Reading Group' }],
  },
  {
    id: 'C-310', name: 'Room C-310', capacity: 24,
    equipment: ['Projector', 'Computers'], blocked: false,
    bookings: [{ id: 'c1', start: 840, end: 900, label: 'Programming Workshop' }],
  },
  {
    id: 'D-120', name: 'Room D-120', capacity: 40,
    equipment: ['Projector', 'Microphone'], blocked: true,
    bookings: [{ id: 'd1', start: 600, end: 660, label: 'Guest Lecture' }],
  },
  {
    id: 'E-205', name: 'Room E-205', capacity: 10,
    equipment: ['Whiteboard', 'Display'], blocked: false, bookings: [],
  },
];
