// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import { ROOMS } from '@/data/rooms';

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(<App />));
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

function element<T extends Element>(selector: string): T {
  const found = container.querySelector<T>(selector);
  if (!found) throw new Error(`Missing ${selector}`);
  return found;
}

function changeInput(id: string, value: string) {
  const input = element<HTMLInputElement>(`#${id}`);
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function selectRoom(value: string) {
  act(() => {
    const select = element<HTMLSelectElement>('#room-select');
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

function button(text: string): HTMLButtonElement {
  const found = [...container.querySelectorAll('button')].find((item) => item.textContent?.trim() === text);
  if (!found) throw new Error(`Missing button ${text}`);
  return found;
}

function clickButton(text: string) {
  act(() => button(text).click());
}

function toggleEquipment(name: string) {
  const label = [...container.querySelectorAll('label')].find((item) => item.textContent?.trim() === name);
  if (!label) throw new Error(`Missing equipment ${name}`);
  act(() => label.querySelector('input')!.click());
}

function roomIds() {
  return [...element<HTMLSelectElement>('#room-select').options].map((item) => item.value).filter(Boolean);
}

function feedback() {
  return container.querySelector('[role="status"]')?.textContent ?? '';
}

describe('Filter and room-switching behavior', () => {
  it('combines attendee and multiple equipment controls with AND', () => {
    changeInput('attendees', '12');
    expect(roomIds()).toEqual(['B-204', 'C-310', 'D-120']);
    toggleEquipment('Projector');
    toggleEquipment('Whiteboard');
    expect(roomIds()).toEqual(['B-204']);
    changeInput('attendees', '13');
    expect(roomIds()).toEqual([]);
    expect(feedback()).toContain('No rooms match');
  });

  it('switches feedback between available, overlapping and blocked rooms', () => {
    clickButton('Check Availability');
    expect(feedback()).toContain('this slot is available');
    selectRoom('A-101');
    expect(feedback()).toContain('Overlaps');
    expect(container.textContent).toContain('Reading Group');
    expect(container.textContent).not.toContain('Faculty Meeting');
    selectRoom('D-120');
    expect(feedback()).toContain('currently blocked');
    selectRoom('E-205');
    expect(feedback()).toContain('this slot is available');
    expect(container.textContent).toContain('No bookings yet');
  });

  it('keeps matching blocked rooms visible without allowing confirmation', () => {
    changeInput('attendees', '40');
    toggleEquipment('Microphone');
    expect(roomIds()).toEqual(['D-120']);
    selectRoom('D-120');
    expect(feedback()).toContain('currently blocked');
    expect(container.textContent).not.toContain('Confirm Booking');
  });

  it('clears a hidden selection and success feedback, without restoring it when filters relax', () => {
    clickButton('Check Availability');
    changeInput('attendees', '13');
    expect(element<HTMLSelectElement>('#room-select').value).toBe('');
    expect(feedback()).toBe('');
    expect(button('Check Availability').disabled).toBe(true);
    expect(container.textContent).not.toContain('Confirm Booking');
    expect(container.textContent).not.toContain('Faculty Meeting');
    changeInput('attendees', '1');
    expect(element<HTMLSelectElement>('#room-select').value).toBe('');
    selectRoom('A-101');
    expect(feedback()).toContain('Overlaps');
  });

  it('clears selection when equipment excludes the room and recovers from the empty state', () => {
    clickButton('Check Availability');
    toggleEquipment('Computers');
    expect(element<HTMLSelectElement>('#room-select').value).toBe('');
    expect(feedback()).toBe('');
    toggleEquipment('Display');
    expect(feedback()).toContain('No rooms match');
    expect(element<HTMLSelectElement>('#room-select').disabled).toBe(true);
    toggleEquipment('Display');
    selectRoom('C-310');
    expect(feedback()).toContain('this slot is available');
  });

  it.each(['', '0', '-1', '1.5'])('rejects invalid attendee input %j and removes stale success', (input) => {
    clickButton('Check Availability');
    changeInput('attendees', input);
    expect(element<HTMLInputElement>('#attendees').getAttribute('aria-invalid')).toBe('true');
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('positive whole number');
    expect(roomIds()).toEqual([]);
    expect(feedback()).toBe('');
    expect(button('Check Availability').disabled).toBe(true);
    expect(container.textContent).not.toContain('Confirm Booking');
  });

  it('retains a matching selection and recomputes after time and blocking changes', () => {
    clickButton('Check Availability');
    changeInput('attendees', '12');
    toggleEquipment('Projector');
    expect(element<HTMLSelectElement>('#room-select').value).toBe('B-204');
    expect(feedback()).toContain('this slot is available');
    changeInput('start-time', '10:30');
    expect(feedback()).toContain('Overlaps');
    changeInput('start-time', '11:00');
    clickButton('Unblocked');
    expect(feedback()).toContain('currently blocked');
    expect(roomIds()).toContain('B-204');
  });

  it('preserves confirmation and booking isolation across filters and room switches', () => {
    const before = structuredClone(ROOMS);
    selectRoom('E-205');
    clickButton('Confirm Booking');
    expect(container.textContent).toContain('New Booking');
    toggleEquipment('Projector');
    selectRoom('B-204');
    expect(feedback()).toContain('this slot is available');
    expect(container.textContent).not.toContain('New Booking');
    toggleEquipment('Projector');
    selectRoom('E-205');
    expect(feedback()).toContain('Overlaps');
    expect(container.textContent).toContain('New Booking');
    expect(ROOMS).toEqual(before);
  });

  it.each(['start-time', 'end-time'])('clearing %s removes success and prevents confirmation', (id) => {
    selectRoom('E-205');
    expect(feedback()).toContain('this slot is available');
    changeInput(id, '');
    expect(feedback()).toContain('Enter valid start and end times');
    expect(feedback()).not.toContain('this slot is available');
    expect(container.textContent).not.toContain('Confirm Booking');
    clickButton('Check Availability');
    expect(feedback()).toContain('Enter valid start and end times');
    expect(container.textContent).toContain('No bookings yet');
    changeInput(id, id === 'start-time' ? '11:00' : '12:00');
    expect(feedback()).toContain('this slot is available');
  });

  it('allows 120 minutes but rejects 121 minutes in rendered feedback', () => {
    selectRoom('E-205');
    changeInput('end-time', '13:00');
    expect(feedback()).toContain('120 min — this slot is available');
    expect(button('Confirm Booking').disabled).toBe(false);
    changeInput('end-time', '13:01');
    expect(feedback()).toContain('Duration is 121 minutes');
    expect(feedback()).toContain('maximum allowed is 120');
    expect(container.textContent).not.toContain('Confirm Booking');
    expect(container.textContent).toContain('No bookings yet');
  });
});
