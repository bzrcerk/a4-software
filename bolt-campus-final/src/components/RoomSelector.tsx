import type { Room } from '@/types/room';

interface RoomSelectorProps {
  rooms: Room[];
  selectedRoom?: Room;
  showEmptyState: boolean;
  onSelect: (id: string) => void;
}

export default function RoomSelector({ rooms, selectedRoom, showEmptyState, onSelect }: RoomSelectorProps) {
  return (
    <>
      {showEmptyState && (
        <p role="status" className="mb-3 text-sm text-slate-600">No rooms match these filters. Reduce attendees or remove required equipment.</p>
      )}
      <label htmlFor="room-select" className="text-xs font-semibold text-slate-700 uppercase tracking-wide block mb-1.5">
        Select Room
      </label>
      <select
        id="room-select"
        value={selectedRoom?.id ?? ''}
        disabled={rooms.length === 0}
        onChange={(event) => onSelect(event.target.value)}
        aria-describedby="room-details"
        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
      >
        <option value="" disabled>Select a room</option>
        {rooms.map((room) => (
          <option key={room.id} value={room.id}>
            {room.name}{room.blocked ? ' — Blocked' : ''}
          </option>
        ))}
      </select>
      <div id="room-details" className="mt-3 space-y-1 text-sm text-slate-600">
        {selectedRoom ? <>
          <p>Capacity: {selectedRoom.capacity} people</p>
          <p>Equipment: {selectedRoom.equipment.join(', ')}</p>
          <p>Status: {selectedRoom.blocked ? 'Blocked' : 'Unblocked'}</p>
        </> : <p>Select a matching room to check availability.</p>}
      </div>
    </>
  );
}
