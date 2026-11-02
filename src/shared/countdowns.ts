export type CountdownTone = 'red' | 'orange' | 'neutral';

export type Countdown = {
  id: string;
  // Calendar date; the countdown ends at local midnight at the start of this day.
  date: string;
  label: string;
  tone: CountdownTone;
};

export const PRIMARY_COUNTDOWNS: Countdown[] = [
  { id: 'dec-2026', date: '2026-12-31', label: '31 December 2026', tone: 'red' },
  { id: 'jan-2027', date: '2027-01-31', label: '31 January 2027', tone: 'orange' },
];

export const LATER_COUNTDOWNS: Countdown[] = [
  { id: 'oct-2027', date: '2027-10-24', label: '24 October 2027', tone: 'neutral' },
  { id: 'oct-2028', date: '2028-10-24', label: '24 October 2028', tone: 'neutral' },
];

// The internship card shows whole days only, counted in calendar days.
export const INTERNSHIP_COUNTDOWN = {
  id: 'internship',
  date: '2027-03-20',
  label: 'Internship',
  dateLabel: '20 March 2027',
} as const;

export type Remaining = {
  done: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const SECOND = 1000;

export function localMidnight(date: string): number {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1).getTime();
}

export function remainingUntil(targetMs: number, nowMs: number): Remaining {
  // Partial seconds round up so the display reaches 0 exactly at the target.
  const totalSeconds = Math.ceil((targetMs - nowMs) / SECOND);
  if (totalSeconds <= 0) return { done: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    done: false,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

const DAY = 86_400_000;

// Calendar days from today to the date: tomorrow is 1, today or past is 0. Rounding absorbs the
// hour lost or gained when daylight saving time changes in between.
export function daysUntil(date: string, nowMs: number): number {
  const now = new Date(nowMs);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.max(0, Math.round((localMidnight(date) - today) / DAY));
}

export const COUNTDOWN_COOKIE_NAME = 'stride_countdown';
export const COUNTDOWN_COOKIE_MAX_AGE = 31536000;

// The later group is open unless the viewer explicitly closed it.
export function parseLaterOpen(value: string | undefined): boolean {
  return value !== 'v1:closed';
}

export function serializeLaterOpen(open: boolean): string {
  return open ? 'v1:open' : 'v1:closed';
}
