import type { ReactNode } from 'react';
import { CalendarDays, Lock, Unlock, Timer } from 'lucide-react';
import type { Room } from '@/types/room';

interface BookingFormProps {
  startTime: string;
  endTime: string;
  selectedRoom?: Room;
  requestedDuration: number;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  onToggleBlocked: () => void;
  onCheck: () => void;
  children: ReactNode;
}

export default function BookingForm({
  startTime, endTime, selectedRoom, requestedDuration,
  onStartChange, onEndChange, onToggleBlocked, onCheck, children,
}: BookingFormProps) {
  const blocked = selectedRoom?.blocked ?? false;
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label htmlFor="start-time" className="text-xs font-semibold text-slate-700 uppercase tracking-wide block mb-1.5">
            Start Time
          </label>
          <input
            id="start-time"
            type="time"
            value={startTime}
            onChange={(e) => onStartChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-800 text-base font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all bg-white"
          />
        </div>
        <div>
          <label htmlFor="end-time" className="text-xs font-semibold text-slate-700 uppercase tracking-wide block mb-1.5">
            End Time
          </label>
          <input
            id="end-time"
            type="time"
            value={endTime}
            onChange={(e) => onEndChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-800 text-base font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all bg-white"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Timer className="w-4 h-4 text-slate-400" />
          <span>
            Duration: <span className="font-semibold text-slate-700">{requestedDuration} min</span>
            {requestedDuration > 120 && (
              <span className="text-red-500 font-medium"> (exceeds 120 min limit)</span>
            )}
          </span>
        </div>

        {selectedRoom && <button
          onClick={onToggleBlocked}
          aria-pressed={blocked}
          aria-label={`Block ${selectedRoom.name}`}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border transition-all ${
            blocked
              ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
              : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
          }`}
        >
          {blocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          {blocked ? 'Blocked' : 'Unblocked'}
        </button>}
      </div>

      <div className="mt-5 flex gap-3">
        <button
          onClick={onCheck}
          disabled={!selectedRoom}
          className="disabled:opacity-50 disabled:cursor-not-allowed flex-1 py-3 rounded-lg bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 active:scale-[0.99] transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <CalendarDays className="w-4.5 h-4.5" />
          Check Availability
        </button>
      </div>
      {children}
    </section>
  );
}
