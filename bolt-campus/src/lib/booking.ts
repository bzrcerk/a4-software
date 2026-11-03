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
 * AC1: Start must be earlier than end; booking cannot start in the past.
 * AC2: Duration must be at most 120 minutes.
 * AC3: A blocked room cannot be booked.
 * AC4: Must not overlap existing bookings (touching endpoints are allowed).
 * AC5: Exactly 120 minutes is allowed.
 * AC6: A booking starting exactly at the current time is unavailable.
 */
export function checkAvailability(
	start: number,
	end: number,
	nowMinutes: number,
	blocked: boolean,
	bookings: Booking[],
): AvailabilityResult {
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
