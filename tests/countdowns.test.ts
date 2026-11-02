import { describe, expect, it } from 'vitest';
import {
  localMidnight,
  parseLaterOpen,
  remainingUntil,
  serializeLaterOpen,
} from '@/shared/countdowns';

const MINUTE = 60_000;

describe('remainingUntil', () => {
  it('splits the remaining time into days, hours, minutes, and seconds', () => {
    const target = localMidnight('2026-12-31');
    const now = target - (2 * 1440 + 3 * 60 + 4) * MINUTE - 5000;
    expect(remainingUntil(target, now)).toEqual({
      done: false,
      days: 2,
      hours: 3,
      minutes: 4,
      seconds: 5,
    });
  });

  it('rounds partial seconds up so the last second still shows', () => {
    const target = localMidnight('2027-01-31');
    expect(remainingUntil(target, target - 400)).toEqual({
      done: false,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 1,
    });
  });

  it('marks the countdown as reached at or after the target', () => {
    const target = localMidnight('2027-10-24');
    expect(remainingUntil(target, target).done).toBe(true);
    expect(remainingUntil(target, target + MINUTE).done).toBe(true);
  });
});

describe('later countdown preference', () => {
  it('stays open unless explicitly closed', () => {
    expect(parseLaterOpen(undefined)).toBe(true);
    expect(parseLaterOpen('garbage')).toBe(true);
    expect(parseLaterOpen(serializeLaterOpen(false))).toBe(false);
    expect(parseLaterOpen(serializeLaterOpen(true))).toBe(true);
  });
});
