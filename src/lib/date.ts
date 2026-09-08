import type { DateISO } from '../types';

export function toISO(d: Date): DateISO {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromISO(s: DateISO): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function today(): DateISO {
  return toISO(new Date());
}

export function addDays(s: DateISO, n: number): DateISO {
  const d = fromISO(s);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

/** Montag der Woche, in der das Datum liegt. */
export function startOfWeek(s: DateISO): DateISO {
  const d = fromISO(s);
  const shift = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - shift);
  return toISO(d);
}

export function weekDays(weekStart: DateISO): DateISO[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function daysBetween(a: DateISO, b: DateISO): number {
  const ms = fromISO(b).getTime() - fromISO(a).getTime();
  return Math.round(ms / 86400000);
}

const WEEKDAYS = [
  'Sonntag',
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
];

const MONTHS = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];

export function formatLong(s: DateISO): string {
  const d = fromISO(s);
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatShort(s: DateISO): string {
  const d = fromISO(s);
  return `${d.getDate()}. ${MONTHS[d.getMonth()].slice(0, 3)}`;
}

export function weekdayShort(s: DateISO): string {
  return WEEKDAYS[fromISO(s).getDay()].slice(0, 2);
}

export function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return `${MONTHS[(m ?? 1) - 1]} ${y}`;
}

export function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}`;
}

export type Daypart = 'morning' | 'day' | 'evening' | 'night';

export function daypart(d = new Date()): Daypart {
  const h = d.getHours();
  if (h < 5) return 'night';
  if (h < 11) return 'morning';
  if (h < 18) return 'day';
  if (h < 23) return 'evening';
  return 'night';
}

export function greeting(part: Daypart): string {
  switch (part) {
    case 'morning':
      return 'Guten Morgen';
    case 'day':
      return 'Guten Tag';
    case 'evening':
      return 'Guten Abend';
    case 'night':
      return 'Gute Nacht';
  }
}

export function daypartLabel(part: Daypart): string {
  switch (part) {
    case 'morning':
      return 'Morgen';
    case 'day':
      return 'Tag';
    case 'evening':
      return 'Abend';
    case 'night':
      return 'Nacht';
  }
}
