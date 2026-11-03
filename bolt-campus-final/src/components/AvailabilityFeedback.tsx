import { CheckCircle2, XCircle } from 'lucide-react';
import { formatTime, type AvailabilityResult } from '@/lib/booking';

interface AvailabilityFeedbackProps {
  result: AvailabilityResult | null;
  startMinutes: number;
  endMinutes: number;
  requestedDuration: number;
  onConfirm: () => void;
}

export default function AvailabilityFeedback({ result, startMinutes, endMinutes, requestedDuration, onConfirm }: AvailabilityFeedbackProps) {
  return (
    <>
      {result && (
        <div
          role="status"
          aria-live="polite"
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
                {formatTime(startMinutes)}–{formatTime(endMinutes)} · {requestedDuration} min — this slot is available.
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
                onClick={onConfirm}
                className="mt-2.5 text-xs font-semibold text-white bg-emerald-600 px-3 py-1.5 rounded-md hover:bg-emerald-700 transition-colors"
              >
                Confirm Booking
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
