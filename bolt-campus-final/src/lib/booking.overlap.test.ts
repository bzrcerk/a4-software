import { describe, expect, it } from 'vitest';
import { checkAvailability, type Booking } from '@/lib/booking';

describe('Overlap coverage gaps', () => {
  const existing: Booking[] = [
    { id: 'existing', start: 600, end: 660, label: 'Existing booking' },
  ];

  it.each([
    ['leading partial overlap', 570, 630],
    ['request inside existing booking', 615, 645],
    ['request contains existing booking', 570, 690],
    ['identical interval', 600, 660],
  ] as const)('rejects %s', (_case, start, end) => {
    const result = checkAvailability(start, end, 540, false, existing);
    expect(result.available).toBe(false);
    expect(result.reason).toMatch(/Overlaps with existing booking/);
  });

  it('finds a conflict after a nonconflicting booking in an unsorted array', () => {
    const bookings: Booking[] = [
      { id: 'later', start: 900, end: 960, label: 'Later booking' },
      ...existing,
    ];
    const before = structuredClone(bookings);
    const result = checkAvailability(630, 690, 540, false, bookings);
    expect(result.available).toBe(false);
    expect(result.reason).toContain('10:00–11:00');
    expect(bookings).toEqual(before);
  });
});
