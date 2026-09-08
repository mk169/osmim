import type {
  ApplicationStatus,
  ContactCircle,
  EventKind,
  ExamStatus,
  GoalStatus,
  InboxKind,
  JournalTemplate,
  LibraryKind,
  ProjectStatus,
  TaskLane,
} from '../types';

export const PROJECT_STATUS: Record<ProjectStatus, string> = {
  idea: 'Idee',
  exploring: 'Erkunden',
  active: 'Aktiv',
  paused: 'Pausiert',
  done: 'Abgeschlossen',
};

export const PROJECT_STATUS_ORDER: ProjectStatus[] = [
  'active',
  'exploring',
  'idea',
  'paused',
  'done',
];

export const GOAL_STATUS: Record<GoalStatus, string> = {
  open: 'Offen',
  moving: 'In Bewegung',
  done: 'Erreicht',
  resting: 'Ruht',
};

export const LANE: Record<TaskLane, { title: string; sub: string }> = {
  duty: { title: 'Pflicht', sub: 'Studium & Administration' },
  body: { title: 'Körper', sub: 'Training, Bewegung, Ernährung' },
  mind: { title: 'Geist', sub: 'Bildung, Kreativität, Stille' },
};

export const INBOX_KIND: Record<InboxKind, string> = {
  idea: 'Idee',
  goal: 'Ziel',
  worry: 'Sorge',
  note: 'Notiz',
};

export const EVENT_KIND: Record<EventKind, string> = {
  study: 'Studium',
  training: 'Training',
  social: 'Sozial',
  creative: 'Kreativ',
  faith: 'Glaube',
  admin: 'Alltag',
  culture: 'Kultur',
};

export const EVENT_COLOR: Record<EventKind, string> = {
  study: 'border-l-forest-500',
  training: 'border-l-forest-300',
  social: 'border-l-wine-500',
  creative: 'border-l-brass-500',
  faith: 'border-l-wine-300',
  admin: 'border-l-ink-300',
  culture: 'border-l-brass-300',
};

export const CIRCLE: Record<ContactCircle, string> = {
  close: 'Enge Freundschaft',
  new: 'Neue Bekanntschaft',
  family: 'Familie',
  dating: 'Dating',
};

export const EXAM_STATUS: Record<ExamStatus, string> = {
  planned: 'Geplant',
  learning: 'Im Lernen',
  ready: 'Vorbereitet',
  written: 'Geschrieben',
};

export const APPLICATION_STATUS: Record<ApplicationStatus, string> = {
  research: 'Recherche',
  preparing: 'Vorbereitung',
  applied: 'Beworben',
  talking: 'Im Gespräch',
  closed: 'Abgeschlossen',
};

export const JOURNAL_TEMPLATE: Record<JournalTemplate, string> = {
  free: 'Freier Eintrag',
  daily: 'Tages-Check-in',
  weekly: 'Wochenreview',
  prayer: 'Gebet & Dankbarkeit',
  ideas: 'Ideen',
  clearing: 'Emotionale Klärung',
};

export const JOURNAL_BODY: Record<JournalTemplate, string> = {
  free: '',
  daily:
    'Wie bin ich heute aufgetreten?\n\n\nWas hat mich getragen?\n\n\nWas nehme ich mit in morgen?\n\n',
  weekly:
    'Was habe ich beendet?\n\n\nWas hat mir Energie gegeben?\n\n\nWo bin ich wieder in Zerstreuung geraten?\n\n\nWem möchte ich mich nächste Woche zuwenden?\n\n\nWas darf bewusst warten?\n\n',
  prayer:
    'Wofür bin ich heute dankbar?\n\n\nWorum bitte ich?\n\n\nWo war Stille?\n\n',
  ideas: 'Idee:\n\n\nWarum interessiert sie mich?\n\n\nKleinster nächster Schritt:\n\n',
  clearing:
    'Was fühle ich gerade?\n\n\nWoher kommt es?\n\n\nWas davon gehört mir wirklich?\n\n\nWas ist trotzdem wahr?\n\n',
};

export const LIBRARY_KIND: Record<LibraryKind, string> = {
  book: 'Buch',
  quote: 'Zitat',
  art: 'Kunst',
  music: 'Musik',
  place: 'Ort',
  idea: 'Idee',
};

export const JOURNAL_TAGS = [
  'studium',
  'beziehungen',
  'angst',
  'kreativität',
  'glaube',
  'körper',
  'klarheit',
  'dankbarkeit',
];

export function options<T extends string>(map: Record<T, string>) {
  return (Object.keys(map) as T[]).map((value) => ({ value, label: map[value] }));
}
