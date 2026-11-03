import { describe, expect, it } from 'vitest'
import { checkAvailability, type Booking } from './booking'

const existing: Booking[] = [
	{ id: '1', start: 600, end: 660, label: 'Existing booking' },
]

describe('Smart Campus - Baseline Tests', () => {
	it('T1 - Valid booking is available', () => {
		const result = checkAvailability(720, 780, 540, false, existing)
		expect(result.available).toBe(true)
	})

	it('T2 - Start equal to end is rejected', () => {
		const result = checkAvailability(600, 600, 540, false, [])
		expect(result.available).toBe(false)
	})

	it('T3 - Booking in the past is rejected', () => {
		const result = checkAvailability(480, 540, 600, false, [])
		expect(result.available).toBe(false)
	})

	it('T4 - Duration exactly 120 minutes is allowed', () => {
		const result = checkAvailability(720, 840, 540, false, [])
		expect(result.available).toBe(true)
	})

	it('T5 - Duration greater than 120 minutes is rejected', () => {
		const result = checkAvailability(720, 841, 540, false, [])
		expect(result.available).toBe(false)
	})

	it('T6 - Blocked room is rejected', () => {
		const result = checkAvailability(720, 780, 540, true, [])
		expect(result.available).toBe(false)
	})

	it('T7 - Overlapping booking is rejected', () => {
		const result = checkAvailability(630, 690, 540, false, existing)
		expect(result.available).toBe(false)
	})

	it('T8 - Touching endpoints is allowed (BUG-A)', () => {
		const result = checkAvailability(660, 720, 540, false, existing)
		expect(result.available).toBe(true)
	})

	it('T9 - Original bookings remain unchanged (BUG-B)', () => {
		const bookings: Booking[] = [
			{ id: '1', start: 600, end: 660, label: 'Booking 1' },
			{ id: '2', start: 720, end: 780, label: 'Booking 2' },
		]

		const original = structuredClone(bookings)

		checkAvailability(660, 720, 540, false, bookings)

		expect(bookings).toEqual(original)
	})

	it('T10 - Empty bookings list allows valid request', () => {
		const result = checkAvailability(720, 780, 540, false, [])
		expect(result.available).toBe(true)
	})

	it('T11 - Starting at current time is rejected', () => {
		const result = checkAvailability(540, 600, 540, false, [])
		expect(result.available).toBe(false)
	})

	it('T12 - Touching the start of existing booking is allowed', () => {
		const result = checkAvailability(540, 600, 500, false, existing)
		expect(result.available).toBe(true)
	})
})
