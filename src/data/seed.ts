import type { AppState, Area, DateISO } from '../types';
import { addDays, startOfWeek, today } from '../lib/date';

export const STATE_VERSION = 3;

let counter = 0;
/** Deterministische IDs für Seed-Daten, zufällige zur Laufzeit. */
export function uid(prefix = 'id'): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}`;
}

export const AREAS: Area[] = [
  {
    id: 'attention',
    letter: 'A',
    title: 'Aufmerksamkeit & Charakter',
    subtitle: 'Die Grundlage von allem anderen',
    creed: '',
    focus: '',
    notes: '',
    extra: '',
    review: '',
    accent: 'ink',
  },
  {
    id: 'study',
    letter: 'B',
    title: 'Studium & Karriere',
    subtitle: 'Klausuren, Thesis, erste Richtung',
    creed: '',
    focus: '',
    notes: '',
    extra: '',
    review: '',
    accent: 'forest',
  },
  {
    id: 'body',
    letter: 'C',
    title: 'Körper, Energie & Ausstrahlung',
    subtitle: 'Stark, gesund, präsent',
    creed: '',
    focus: '',
    notes: '',
    extra: '',
    review: '',
    accent: 'forest',
  },
  {
    id: 'relationships',
    letter: 'D',
    title: 'Beziehungen & Dating',
    subtitle: 'Nähe, Wärme, echte Initiative',
    creed: '',
    focus: '',
    notes: '',
    extra: '',
    review: '',
    accent: 'wine',
  },
  {
    id: 'faith',
    letter: 'E',
    title: 'Glaube & innere Ruhe',
    subtitle: 'Gebet, Messe, Stille',
    creed: '',
    focus: '',
    notes: '',
    extra: '',
    review: '',
    accent: 'wine',
  },
  {
    id: 'culture',
    letter: 'F',
    title: 'Bildung, Sprachen & Kultur',
    subtitle: 'Sprache, Lesen, Kunst',
    creed: '',
    focus: '',
    notes: '',
    extra: '',
    review: '',
    accent: 'brass',
  },
  {
    id: 'creativity',
    letter: 'G',
    title: 'Kreativität',
    subtitle: 'Malen, Schreiben, Musik',
    creed: '',
    focus: '',
    notes: '',
    extra: '',
    review: '',
    accent: 'brass',
  },
  {
    id: 'ventures',
    letter: 'H',
    title: 'Selbstständigkeit & Projekte',
    subtitle: 'Eigenes aufbauen',
    creed: '',
    focus: '',
    notes: '',
    extra: '',
    review: '',
    accent: 'forest',
  },
  {
    id: 'daily',
    letter: 'I',
    title: 'Alltag, Ordnung & Finanzen',
    subtitle: 'Zimmer, Papiere, Geld, Reisen',
    creed: '',
    focus: '',
    notes: '',
    extra: '',
    review: '',
    accent: 'ink',
  },
];

export function createSeedState(): AppState {
  const t: DateISO = today();
  const week = startOfWeek(t);
  const now = new Date().toISOString();

  return {
    version: STATE_VERSION,
    createdAt: now,
    theme: 'light',

    // Das Skelett bleibt leer — die Inhalte kommen von dir.
    compass: {
      creed: '',
      values: [],
      qualities: [],
      antiVision: [],
      phases: [],
      notMyMeasure: [],
    },

    season: {
      title: 'Erste Saison',
      statement: '',
      startDate: t,
      endDate: addDays(t, 60),
      milestones: [],
      notNow: [],
    },

    areas: AREAS,

    goals: [],
    projects: [],
    tasks: [],
    inbox: [],
    habits: [],

    days: {
      [t]: {
        date: t,
        intention: '',
        mind: '',
        goodMoment: '',
        attention: {
          morningNoFeed: false,
          focusBlock: false,
          movement: false,
          noDoomscroll: false,
          eveningNoFeed: false,
        },
      },
    },

    journal: [],
    events: [],
    contacts: [],
    exams: [],
    applications: [],
    weekReviews: [],
    monthReflections: [],
    library: [],
    lived: [],

    finances: {
      income: [],
      fixed: [],
      savingsGoal: { label: 'Sparziel', target: 0, saved: 0 },
      openPayments: [],
    },

    focusList: [],

    weekFocus: { [week]: '' },
  };
}
