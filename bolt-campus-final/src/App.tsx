import { useState } from 'react';
import { Clock, Building2, Info } from 'lucide-react';
import {
  formatTime,
  timeToMinutes,
} from '@/lib/booking';

import { filterRooms, parseAttendees } from '@/lib/filtering';
import type { Equipment } from '@/types/room';

import { ROOMS, DEMO_NOW_MINUTES } from '@/data/rooms';
import { checkRoomAvailability, confirmRoomBooking, toggleRoomBlocked } from '@/lib/rooms';

import RoomFilters from '@/components/RoomFilters';
import RoomSelector from '@/components/RoomSelector';
import BookingForm from '@/components/BookingForm';
import AvailabilityFeedback from '@/components/AvailabilityFeedback';
import BookingList from '@/components/BookingList';

function App() {
  const [startTime, setStartTime] = useState('11:00');
  const [endTime, setEndTime] = useState('12:00');
  const [rooms, setRooms] = useState(ROOMS);
  const [selectedRoomId, setSelectedRoomId] = useState(ROOMS[0].id);
  const [hasChecked, setHasChecked] = useState(false);
  const [attendeeInput, setAttendeeInput] = useState('1');
  const [requiredEquipment, setRequiredEquipment] = useState<Equipment[]>([]);
  const attendees = parseAttendees(attendeeInput);
  const matchingRooms = filterRooms(rooms, attendees ?? NaN, requiredEquipment);
  const selectedRoom = matchingRooms.find((room) => room.id === selectedRoomId);
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const requestedDuration = endMinutes > startMinutes ? endMinutes - startMinutes : 0;
  const result = hasChecked && selectedRoom
    ? checkRoomAvailability(selectedRoom, startMinutes, endMinutes, DEMO_NOW_MINUTES)
    : null;

  const updateFilters = (input: string, equipment: Equipment[]) => {
    setAttendeeInput(input);
    setRequiredEquipment(equipment);
    const matches = filterRooms(rooms, parseAttendees(input) ?? NaN, equipment);
    if (!matches.some((room) => room.id === selectedRoomId)) {
      setSelectedRoomId('');
      setHasChecked(false);
    }
  };

  const handleCheck = () => setHasChecked(true);

  const handleConfirmBooking = () => {
    if (!selectedRoom) return;
    setRooms((previous) => confirmRoomBooking(
      previous, selectedRoomId, startMinutes, endMinutes, DEMO_NOW_MINUTES,
    ));
    setHasChecked(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-5 py-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm">
              <Building2 className="w-5 h-5 text-white" strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-800 leading-tight">Smart Campus</h1>
              <p className="text-xs text-slate-500 leading-tight">{selectedRoom?.name ?? 'Select a room'} — Room Booking</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="font-mono font-medium tabular-nums">{formatTime(DEMO_NOW_MINUTES)} (demo)</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6 space-y-5">
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <RoomFilters
            attendeeInput={attendeeInput}
            attendeesValid={attendees !== null}
            requiredEquipment={requiredEquipment}
            onChange={updateFilters}
          />
          <RoomSelector
            rooms={matchingRooms}
            selectedRoom={selectedRoom}
            showEmptyState={attendees !== null && matchingRooms.length === 0}
            onSelect={(id) => {
              setSelectedRoomId(id);
              setHasChecked(true);
            }}
          />
        </section>

        <BookingForm
          startTime={startTime}
          endTime={endTime}
          selectedRoom={selectedRoom}
          requestedDuration={requestedDuration}
          onStartChange={setStartTime}
          onEndChange={setEndTime}
          onToggleBlocked={() => setRooms((previous) => toggleRoomBlocked(previous, selectedRoomId))}
          onCheck={handleCheck}
        >
          <AvailabilityFeedback
            result={result}
            startMinutes={startMinutes}
            endMinutes={endMinutes}
            requestedDuration={requestedDuration}
            onConfirm={handleConfirmBooking}
          />
        </BookingForm>

        <BookingList selectedRoom={selectedRoom} />

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
