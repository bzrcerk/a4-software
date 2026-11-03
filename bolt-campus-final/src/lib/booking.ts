export interface Booking {
	id: string
	start: number // minutes since midnight
	end: number
	label: string
}

export interface AvailabilityResult {
	available: boolean
	reason?: string
}

export function timeToMinutes(time: string): number {
	// Accept HH:mm only; 24:00 represents the end-of-day boundary.
	// Invalid input stays numeric (NaN) and is rejected by checkAvailability.
	if (time.length !== 5 || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) {
		return time === '24:00' ? 1440 : NaN
	}
	const [h, m] = time.split(':').map(Number)
	return h * 60 + m
}

export function formatTime(minutes: number): string {
	const h = Math.floor(minutes / 60) % 24
	const m = minutes % 60
	return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Checks whether a room can be booked for the requested time slot.
 *
 * AC1: Integer minutes must satisfy 0 <= start < end <= 1440 and start > now.
 * AC2: Duration must be at most 120 minutes.
 * AC3: A blocked room cannot be booked.
 * AC4: Must not overlap existing bookings (touching endpoints are allowed).
 * AC5: Availability checks never mutate the bookings array or its objects.
 * AC6: Return clear rejection reasons for UI feedback; responsive layout is a UI concern.
 */
export function checkAvailability(
	start: number,
	end: number,
	nowMinutes: number,
	blocked: boolean,
	bookings: Booking[],
): AvailabilityResult {
	if (!Number.isInteger(start) || !Number.isInteger(end)) {
		return {
			available: false,
			reason: 'Enter valid start and end times in whole minutes.',
		}
	}

	if (start < 0 || start > 1440 || end < 0 || end > 1440) {
		return {
			available: false,
			reason: 'Start and end times must be between 00:00 and 24:00.',
		}
	}

	if (!Number.isInteger(nowMinutes) || nowMinutes < 0 || nowMinutes > 1440) {
		return {
			available: false,
			reason: 'Current time must be valid whole minutes between 0 and 1440.',
		}
	}

	if (start >= end) {
		return {
			available: false,
			reason: 'Start time must be earlier than end time.',
		}
	}

	if (start <= nowMinutes) {
		return {
			available: false,
			reason: 'The booking cannot start in the past or at the current time.',
		}
	}

	const duration = end - start
	if (duration > 120) {
		return {
			available: false,
			reason: `Duration is ${duration} minutes — maximum allowed is 120.`,
		}
	}

	if (blocked) {
		return {
			available: false,
			reason: 'This room is currently blocked and cannot be booked.',
		}
	}

	for (const b of bookings) {
		if (start < b.end && end > b.start) {
			return {
				available: false,
				reason: `Overlaps with existing booking (${formatTime(b.start)}–${formatTime(b.end)}).`,
			}
		}
	}

	return { available: true }
}
