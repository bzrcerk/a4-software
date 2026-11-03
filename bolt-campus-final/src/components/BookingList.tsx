import { useMemo } from 'react';
import { CalendarDays } from 'lucide-react';
import { formatTime } from '@/lib/booking';
import type { Room } from '@/types/room';

interface BookingListProps {
  selectedRoom?: Room;
}

export default function BookingList({ selectedRoom }: BookingListProps) {
  const sortedBookings = useMemo(
    () => [...(selectedRoom?.bookings ?? [])].sort((a, b) => a.start - b.start),
    [selectedRoom],
  );
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
        <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
        Existing Bookings{selectedRoom ? ` — ${selectedRoom.name}` : ''}
      </h2>
      {!selectedRoom ? (
        <p className="text-sm text-slate-400 py-2">Select a room to view its bookings.</p>
      ) : sortedBookings.length === 0 ? (
        <p className="text-sm text-slate-400 py-2">No bookings yet.</p>
      ) : (
        <ul className="space-y-2">
          {sortedBookings.map((b) => (
            <li
              key={b.id}
              className="flex flex-wrap gap-2 items-center justify-between px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-100"
            >
              <span className="text-sm text-slate-700 font-medium">{b.label}</span>
              <span className="text-sm font-mono text-slate-500 tabular-nums">
                {formatTime(b.start)} – {formatTime(b.end)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
