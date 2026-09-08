/**
 * Datenmodelle für Personal OS v2.
 *
 * Grundsatz: komplexe Struktur im Hintergrund, ruhige Oberfläche vorne.
 * Alle Entitäten sind flach und über IDs verbunden, damit der Export
 * ein einfaches, lesbares JSON-Dokument bleibt.
 */

export type ID = string;

/** ISO-Datum ohne Zeit, z. B. "2026-09-08". */
export type DateISO = string;

/** Vollständiger ISO-Zeitstempel. */
export type DateTimeISO = string;

/**
 * Bereiche sind frei anlegbar, deshalb ist die Kennung eine gewöhnliche
 * Zeichenkette und keine feste Liste.
 */
export type AreaKey = string;

/**
 * Optionales Zusatzwerkzeug eines Bereichs. Standard ist keines — der
 * Bereich bleibt eine leere Vorlage, bis du eines einschaltest.
 */
export type AreaModule =
  | 'exams'
  | 'applications'
  | 'contacts'
  | 'finances'
  | 'library'
  | 'practice'
  | 'log';

export interface Area {
  id: AreaKey;
  letter: string;
  title: string;
  subtitle: string;
  /** Leitbild des Bereichs. */
  creed: string;
  /** 90-Tage-Fokus. */
  focus: string;
  notes: string;
  /**
   * Zusatzfeld für die bereichseigenen Ansichten — Karriere-Hypothesen,
   * Ernährungsprinzipien, Haushaltsroutinen. Bleibt sonst leer.
   */
  extra: string;
  /** Rückblick, frei formuliert. */
  review: string;
  accent: 'forest' | 'wine' | 'brass' | 'ink';
  /** Eingeschaltete Zusatzwerkzeuge. Leer = reine Vorlage. */
  modules?: AreaModule[];
}

export type GoalHorizon = 'season' | 'year' | 'horizon';
export type GoalStatus = 'open' | 'moving' | 'done' | 'resting';

/** Optionaler Denkrahmen für ein Ziel. 'none' lässt das Ziel schlicht. */
export type GoalFramework = 'none' | 'smart' | 'okr' | 'woop';

export interface Goal {
  id: ID;
  title: string;
  detail?: string;
  areaId: AreaKey;
  horizon: GoalHorizon;
  status: GoalStatus;
  /** 0–100, bewusst grob und ohne Punktesystem. */
  progress: number;
  /**
   * Eines der fünf Ziele, die parallel laufen. Alles andere wartet in der
   * Liste — 25/5 auf Saisonebene.
   */
  chosen?: boolean;
  framework?: GoalFramework;
  /**
   * Antworten auf die Felder des gewählten Rahmens, nach Feldschlüssel.
   * Generisch gehalten, damit ein neuer Rahmen kein Datenmodell braucht.
   */
  fields?: Record<string, string>;
  createdAt: DateTimeISO;
}

/**
 * Die 25/5-Übung: bis zu 25 Ziele aufschreiben, fünf auswählen —
 * die übrigen zwanzig sind bewusst zu meiden, nicht „später".
 */
export interface FocusItem {
  id: ID;
  text: string;
  chosen: boolean;
}

export type ProjectStatus = 'idea' | 'exploring' | 'active' | 'paused' | 'done';

export interface Project {
  id: ID;
  title: string;
  /** Warum ist das wichtig? */
  why: string;
  areaId: AreaKey;
  /** Gewünschtes Ergebnis. */
  outcome: string;
  /** Nächste physische Handlung. */
  nextAction: string;
  timeframe: string;
  status: ProjectStatus;
  /** Bewertung 1–5, ruhig gehalten. */
  rating: {
    meaning: number;
    energy: number;
    learning: number;
    feasibility: number;
  };
  createdAt: DateTimeISO;
  archivedAt?: DateTimeISO;
}

export type TaskLane = 'duty' | 'body' | 'mind';

export interface Task {
  id: ID;
  title: string;
  note?: string;
  areaId?: AreaKey;
  projectId?: ID;
  lane?: TaskLane;
  /** Wenn gesetzt, erscheint die Aufgabe an diesem Tag in „Heute“. */
  date?: DateISO;
  /** Die eine wichtigste Aufgabe des Tages. */
  isOneThing?: boolean;
  done: boolean;
  doneAt?: DateTimeISO;
  createdAt: DateTimeISO;
}

export type InboxKind = 'idea' | 'goal' | 'worry' | 'note';
export type InboxState = 'open' | 'archived';

export interface InboxItem {
  id: ID;
  text: string;
  kind: InboxKind;
  state: InboxState;
  createdAt: DateTimeISO;
}

export type HabitCadence = 'daily' | 'weekly';

export interface Habit {
  id: ID;
  title: string;
  areaId: AreaKey;
  cadence: HabitCadence;
  /** Nur bei wöchentlichen Gewohnheiten: angestrebte Anzahl. */
  weeklyTarget?: number;
  /** Datumsliste erledigter Tage — kein Streak, nur Gedächtnis. */
  log: DateISO[];
}

/** Kleiner Aufmerksamkeits-Check, bewusst ohne Bewertung. */
export interface AttentionCheck {
  morningNoFeed: boolean;
  focusBlock: boolean;
  movement: boolean;
  noDoomscroll: boolean;
  eveningNoFeed: boolean;
}

export interface DayEntry {
  date: DateISO;
  /** Wie will ich heute auftreten? */
  intention: string;
  /** Was ist gerade in meinem Kopf? */
  mind: string;
  /** Was war heute ein guter Moment? */
  goodMoment: string;
  attention: AttentionCheck;
  energy?: number;
  mood?: number;
}

export type JournalTemplate =
  | 'free'
  | 'daily'
  | 'weekly'
  | 'prayer'
  | 'ideas'
  | 'clearing';

export interface JournalEntry {
  id: ID;
  title: string;
  body: string;
  template: JournalTemplate;
  tags: string[];
  energy?: number;
  mood?: number;
  createdAt: DateTimeISO;
}

export type EventKind =
  | 'study'
  | 'training'
  | 'social'
  | 'creative'
  | 'faith'
  | 'admin'
  | 'culture';

export interface CalendarEvent {
  id: ID;
  title: string;
  kind: EventKind;
  date: DateISO;
  start?: string;
  end?: string;
  note?: string;
  /** Anspruchsvolle Priorität — zählt in die Kapazitätsanzeige. */
  demanding?: boolean;
}

export type ContactCircle = 'close' | 'new' | 'family' | 'dating';

export interface Contact {
  id: ID;
  name: string;
  circle: ContactCircle;
  lastMet?: DateISO;
  nextStep?: string;
  note?: string;
}

export type ExamStatus = 'planned' | 'learning' | 'ready' | 'written';

export interface Exam {
  id: ID;
  title: string;
  date?: DateISO;
  weight: string;
  status: ExamStatus;
  plan: string;
  nextStep: string;
}

export type ApplicationStatus =
  | 'research'
  | 'preparing'
  | 'applied'
  | 'talking'
  | 'closed';

export interface Application {
  id: ID;
  company: string;
  role: string;
  status: ApplicationStatus;
  contact?: string;
  deadline?: DateISO;
  nextAction?: string;
}

export interface WeekReview {
  id: ID;
  /** Montag der Woche. */
  weekStart: DateISO;
  focus: string;
  finished: string;
  energy: string;
  distraction: string;
  people: string;
  waiting: string;
  /** Selbsteinschätzung der Woche, 1–10. Ergibt den Verlauf im Archiv. */
  score?: number;
  /** Gesetzt, sobald die Review abgeschlossen und archiviert wurde. */
  savedAt?: DateTimeISO;
  createdAt: DateTimeISO;
}

export interface MonthReflection {
  id: ID;
  /** "2026-09" */
  month: string;
  text: string;
  createdAt: DateTimeISO;
}

export interface SeasonMilestone {
  id: ID;
  title: string;
  date: DateISO;
}

export interface Season {
  title: string;
  statement: string;
  startDate: DateISO;
  endDate: DateISO;
  milestones: SeasonMilestone[];
  /** „Nicht jetzt“ — bewusst zurückgestellt. */
  notNow: string[];
}

export interface CompassPhase {
  id: ID;
  label: string;
  title: string;
  text: string;
}

export interface Compass {
  creed: string;
  values: string[];
  qualities: { title: string; text: string }[];
  antiVision: string[];
  phases: CompassPhase[];
  notMyMeasure: string[];
}

export interface LivedMoment {
  id: ID;
  title: string;
  kind: 'travel' | 'encounter' | 'moment';
  date?: DateISO;
  note?: string;
}

export type LibraryKind = 'book' | 'quote' | 'art' | 'music' | 'place' | 'idea';

export interface LibraryItem {
  id: ID;
  title: string;
  kind: LibraryKind;
  author?: string;
  note?: string;
  createdAt: DateTimeISO;
}

export interface Finances {
  income: { id: ID; label: string; amount: number }[];
  fixed: { id: ID; label: string; amount: number }[];
  savingsGoal: { label: string; target: number; saved: number };
  openPayments: { id: ID; label: string; amount: number; due?: DateISO }[];
}

export interface AppState {
  version: number;
  createdAt: DateTimeISO;
  theme: 'light' | 'dark';
  compass: Compass;
  season: Season;
  areas: Area[];
  goals: Goal[];
  projects: Project[];
  tasks: Task[];
  inbox: InboxItem[];
  habits: Habit[];
  days: Record<DateISO, DayEntry>;
  journal: JournalEntry[];
  events: CalendarEvent[];
  contacts: Contact[];
  exams: Exam[];
  applications: Application[];
  weekReviews: WeekReview[];
  monthReflections: MonthReflection[];
  library: LibraryItem[];
  lived: LivedMoment[];
  finances: Finances;
  weekFocus: Record<DateISO, string>;
  /** 25/5-Liste: alles aufschreiben, fünf wählen, den Rest meiden. */
  focusList: FocusItem[];
}
