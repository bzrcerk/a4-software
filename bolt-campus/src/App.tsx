import { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  Lock,
  Unlock,
  CalendarDays,
  Timer,
  Info,
} from 'lucide-react';
import {
  type Booking,
  checkAvailability,
  formatTime,
  timeToMinutes,
} from '@/lib/booking';

const DEFAULT_BOOKINGS: Booking[] = [
  { id: 'b1', start: 600, end: 660, label: 'Faculty Meeting' },
  { id: 'b2', start: 780, end: 840, label: 'Study Group' },
];

const ROOM_NAME = 'Room B-204';

function App() {
  const [startTime, setStartTime] = useState('11:00');
  const [endTime, setEndTime] = useState('12:00');
  const [blocked, setBlocked] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>(DEFAULT_BOOKINGS);
  const [now, setNow] = useState(new Date());
  const [result, setResult] = useState<{ available: boolean; reason?: string } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const nowMinutes = useMemo(
    () => now.getHours() * 60 + now.getMinutes(),
    [now]
  );

  const nowDisplay = useMemo(
    () => now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    [now]
  );

  const handleCheck = () => {
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    setResult(checkAvailability(start, end, nowMinutes, blocked, bookings));
  };

  const handleConfirmBooking = () => {
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    const check = checkAvailability(start, end, nowMinutes, blocked, bookings);
    if (!check.available) return;
    setBookings((prev) => [
      ...prev,
      {
        id: `b-${Date.now()}`,
        start,
        end,
        label: 'New Booking',
      },
    ]);
    setResult(null);
  };

  const sortedBookings = useMemo(
    () => [...bookings].sort((a, b) => a.start - b.start),
    [bookings]
  );

  const requestedDuration = useMemo(() => {
    const s = timeToMinutes(startTime);
    const e = timeToMinutes(endTime);
    return e > s ? e - s : 0;
  }, [startTime, endTime]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm">
              <Building2 className="w-5 h-5 text-white" strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-800 leading-tight">Smart Campus</h1>
              <p className="text-xs text-slate-500 leading-tight">{ROOM_NAME} — Room Booking</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="font-mono font-medium tabular-nums">{nowDisplay}</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6 space-y-5">
        {/* Booking Form Card */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label htmlFor="start-time" className="text-xs font-semibold text-slate-700 uppercase tracking-wide block mb-1.5">
                Start Time
              </label>
              <input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
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
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-800 text-base font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Timer className="w-4 h-4 text-slate-400" />
              <span>
                Duration: <span className="font-semibold text-slate-700">{requestedDuration} min</span>
                {requestedDuration > 120 && (
                  <span className="text-red-500 font-medium"> (exceeds 120 min limit)</span>
                )}
              </span>
            </div>

            <button
              onClick={() => setBlocked(!blocked)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border transition-all ${
                blocked
                  ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
              }`}
            >
              {blocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              {blocked ? 'Blocked' : 'Unblocked'}
            </button>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={handleCheck}
              className="flex-1 py-3 rounded-lg bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 active:scale-[0.99] transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <CalendarDays className="w-4.5 h-4.5" />
              Check Availability
            </button>
          </div>

          {/* Result */}
          {result && (
            <div
              className={`mt-4 rounded-xl p-4 flex items-start gap-3 animate-fade-in-up ${
                result.available
                  ? 'bg-emerald-50 border border-emerald-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {result.available ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p
                  className={`text-sm font-semibold ${
                    result.available ? 'text-emerald-700' : 'text-red-700'
                  }`}
                >
                  {result.available ? 'Available' : 'Unavailable'}
                </p>
                {result.available ? (
                  <p className="text-sm mt-0.5 text-emerald-600">
                    {formatTime(timeToMinutes(startTime))}–{formatTime(timeToMinutes(endTime))} · {requestedDuration} min — this slot is available.
                  </p>
                ) : (
                  result.reason && (
                    <p className="text-sm mt-0.5 text-red-600">
                      {result.reason}
                    </p>
                  )
                )}
                {result.available && (
                  <button
                    onClick={handleConfirmBooking}
                    className="mt-2.5 text-xs font-semibold text-white bg-emerald-600 px-3 py-1.5 rounded-md hover:bg-emerald-700 transition-colors"
                  >
                    Confirm Booking
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Existing Bookings */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
            Existing Bookings
          </h2>
          {sortedBookings.length === 0 ? (
            <p className="text-sm text-slate-400 py-2">No bookings yet.</p>
          ) : (
            <ul className="space-y-2">
              {sortedBookings.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-100"
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

        {/* Rules Reference */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2.5 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            Booking Rules
          </h2>
          <ul className="text-xs text-slate-500 space-y-1.5 leading-relaxed">
            <li>• Start time must be earlier than end time.</li>
            <li>• Booking cannot start in the past or at the current moment.</li>
            <li>• Maximum duration: 120 minutes (exactly 120 is allowed).</li>
            <li>• Blocked rooms cannot be booked.</li>
            <li>• No overlap with existing bookings — touching endpoints are fine.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;
