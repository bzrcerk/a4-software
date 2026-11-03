import type { Equipment } from '@/types/room';

const EQUIPMENT_OPTIONS: Equipment[] = ['Whiteboard', 'Projector', 'Computers', 'Microphone', 'Display'];

interface RoomFiltersProps {
  attendeeInput: string;
  attendeesValid: boolean;
  requiredEquipment: Equipment[];
  onChange: (input: string, equipment: Equipment[]) => void;
}

export default function RoomFilters({ attendeeInput, attendeesValid, requiredEquipment, onChange }: RoomFiltersProps) {
  return (
    <>
      <label htmlFor="attendees" className="text-xs font-semibold text-slate-700 uppercase tracking-wide block mb-1.5">
        Attendees
      </label>
      <input
        id="attendees"
        type="number"
        min="1"
        step="1"
        required
        value={attendeeInput}
        onChange={(event) => onChange(event.target.value, requiredEquipment)}
        aria-invalid={!attendeesValid}
        aria-describedby={!attendeesValid ? 'attendee-error' : undefined}
        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
      />
      {!attendeesValid && (
        <p id="attendee-error" role="alert" className="mt-2 text-sm text-red-600">Enter a positive whole number of attendees.</p>
      )}
      <fieldset className="my-4">
        <legend className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">Required equipment</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {EQUIPMENT_OPTIONS.map((equipment) => (
            <label key={equipment} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={requiredEquipment.includes(equipment)}
                onChange={(event) => onChange(attendeeInput, event.target.checked
                  ? [...requiredEquipment, equipment]
                  : requiredEquipment.filter((item) => item !== equipment))}
                className="accent-emerald-600"
              />
              {equipment}
            </label>
          ))}
        </div>
      </fieldset>
    </>
  );
}
