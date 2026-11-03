import { describe, expect, it } from 'vitest'
import { checkAvailability, timeToMinutes, type Booking } from './booking'

describe('Time input validation regressions', () => {
	it.each(['', ' ', '9:00', '09:0', '09:', ':30', '09:00:00', '09:00extra',
		' 09:00', '09:00 ', '09:00\n', 'ab:cd', '-1:00', '12:60', '24:01', '25:00'])(
	'rejects malformed time %j through the UI conversion path', (input) => {
		const minutes = timeToMinutes(input)
		expect(Number.isNaN(minutes)).toBe(true)
		expect(checkAvailability(minutes, 780, 540, false, []).available).toBe(false)
		expect(checkAvailability(720, minutes, 540, false, []).available).toBe(false)
	})

	it.each([['00:00', 0], ['09:05', 545], ['23:59', 1439], ['24:00', 1440]] as const)(
	'parses valid time %s', (input, expected) => {
		expect(timeToMinutes(input)).toBe(expected)
	})

	it.each([NaN, Infinity, -Infinity, 720.5])('rejects non-integer/non-finite time %s', (value) => {
		for (const [start, end, now] of [[value, 780, 540], [720, value, 540], [720, 780, value]]) {
			const result = checkAvailability(start, end, now, false, [])
			expect(result.available).toBe(false)
			expect(result.reason).toBeTruthy()
		}
	})

	it.each([[-1, 60], [1380, 1441], [1440, 1500], [1500, 1560], [780, 720]])(
	'rejects invalid interval %s–%s', (start, end) => {
		expect(checkAvailability(start, end, 0, false, []).available).toBe(false)
	})

	it.each([-1, 1441])('rejects out-of-range current time %s', (now) => {
		expect(checkAvailability(720, 780, now, false, []).available).toBe(false)
	})

	it.each([
		[0, 60, 0, false],
		[540, 600, 540, false],
		[541, 542, 540, true],
		[1320, 1440, 540, true],
		[1319, 1440, 540, false],
		[1439, 1440, 540, true],
	] as const)('checks boundary %s–%s with now=%s', (start, end, now, available) => {
		expect(checkAvailability(start, end, now, false, []).available).toBe(available)
	})

	it('rejects two empty inputs with a useful reason', () => {
		const result = checkAvailability(timeToMinutes(''), timeToMinutes(''), 540, false, [])
		expect(result.available).toBe(false)
		expect(result.reason).toMatch(/valid.*time/i)
	})

	it('preserves frozen booking objects and arrays across validation and availability paths', () => {
		const bookings: Booking[] = [{ id: '1', start: 600, end: 660, label: 'Existing' }]
		const original = structuredClone(bookings)
		Object.freeze(bookings[0])
		Object.freeze(bookings)
		for (const [start, end, blocked, available] of [
			[NaN, 720, false, false],
			[700, 690, false, false],
			[540, 600, false, false],
			[720, 841, false, false],
			[720, 780, true, false],
			[630, 690, false, false],
			[660, 720, false, true],
			[550, 600, false, true],
		] as const) {
			expect(checkAvailability(start, end, 540, blocked, bookings).available).toBe(available)
			expect(bookings).toEqual(original)
		}
	})
})
