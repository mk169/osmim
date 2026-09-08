import type {
  AppState,
  DateISO,
  Habit,
  ID,
  InboxItem,
  InboxKind,
  Project,
  Task,
  TaskLane,
} from '../types';

export function newId(prefix: string): ID {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}

const nowISO = () => new Date().toISOString();

/* ------------------------------------------------------------- Aufgaben */

export function addTask(state: AppState, task: Partial<Task> & { title: string }): AppState {
  const full: Task = {
    id: newId('task'),
    done: false,
    createdAt: nowISO(),
    ...task,
  };
  return { ...state, tasks: [full, ...state.tasks] };
}

export function patchTask(state: AppState, id: ID, patch: Partial<Task>): AppState {
  return {
    ...state,
    tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
  };
}

export function toggleTask(state: AppState, id: ID): AppState {
  return {
    ...state,
    tasks: state.tasks.map((t) =>
      t.id === id
        ? { ...t, done: !t.done, doneAt: !t.done ? nowISO() : undefined }
        : t,
    ),
  };
}

export function removeTask(state: AppState, id: ID): AppState {
  return { ...state, tasks: state.tasks.filter((t) => t.id !== id) };
}

/** Genau eine Aufgabe darf pro Tag „The One Thing“ sein. */
export function setOneThing(state: AppState, id: ID, date: DateISO): AppState {
  return {
    ...state,
    tasks: state.tasks.map((t) => {
      if (t.id === id) return { ...t, isOneThing: true, date };
      if (t.date === date && t.isOneThing) return { ...t, isOneThing: false };
      return t;
    }),
  };
}

export function tasksForDay(state: AppState, date: DateISO): Task[] {
  return state.tasks.filter((t) => t.date === date);
}

export function laneTasks(state: AppState, date: DateISO, lane: TaskLane): Task[] {
  return state.tasks.filter((t) => t.date === date && t.lane === lane && !t.isOneThing);
}

/**
 * Drei Aufgaben sind die Empfehlung, keine Schranke: über dieser Zahl
 * erscheint ein leiser Hinweis, eingetragen werden darf weiter.
 */
export const DAY_TASK_HINT = 3;

export function dayTaskCount(state: AppState, date: DateISO): number {
  return state.tasks.filter((t) => t.date === date && !t.isOneThing).length;
}

/* ---------------------------------------------------------------- Inbox */

export function addInbox(state: AppState, text: string, kind: InboxKind = 'note'): AppState {
  const item: InboxItem = {
    id: newId('inbox'),
    text,
    kind,
    state: 'open',
    createdAt: nowISO(),
  };
  return { ...state, inbox: [item, ...state.inbox] };
}

export function patchInbox(state: AppState, id: ID, patch: Partial<InboxItem>): AppState {
  return {
    ...state,
    inbox: state.inbox.map((i) => (i.id === id ? { ...i, ...patch } : i)),
  };
}

export function removeInbox(state: AppState, id: ID): AppState {
  return { ...state, inbox: state.inbox.filter((i) => i.id !== id) };
}

/* -------------------------------------------------------------- Projekte */

/**
 * 25/5: fünf Projekte laufen parallel, zwanzig warten in der Pipeline.
 * Die fünf sind die Arbeit; die zwanzig sind das, was man dafür nicht tut.
 */
export const ACTIVE_PROJECT_LIMIT = 5;
export const PIPELINE_LIMIT = 20;

export function activeProjects(state: AppState): Project[] {
  return state.projects.filter((p) => p.status === 'active');
}

export function addProject(
  state: AppState,
  project: Partial<Project> & { title: string },
): AppState {
  const full: Project = {
    id: newId('proj'),
    why: '',
    areaId: 'ventures',
    outcome: '',
    nextAction: '',
    timeframe: '',
    status: 'idea',
    rating: { meaning: 3, energy: 3, learning: 3, feasibility: 3 },
    createdAt: nowISO(),
    ...project,
  };
  return { ...state, projects: [full, ...state.projects] };
}

export function patchProject(state: AppState, id: ID, patch: Partial<Project>): AppState {
  return {
    ...state,
    projects: state.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  };
}

export function removeProject(state: AppState, id: ID): AppState {
  return { ...state, projects: state.projects.filter((p) => p.id !== id) };
}

/* ----------------------------------------------------------- Gewohnheiten */

export function toggleHabit(state: AppState, id: ID, date: DateISO): AppState {
  return {
    ...state,
    habits: state.habits.map((h) => {
      if (h.id !== id) return h;
      const has = h.log.includes(date);
      return {
        ...h,
        log: has ? h.log.filter((d) => d !== date) : [...h.log, date].sort(),
      };
    }),
  };
}

export function habitCountInWeek(habit: Habit, days: DateISO[]): number {
  return days.filter((d) => habit.log.includes(d)).length;
}

/* ----------------------------------------------------------------- Ziele */

export function patchGoal(
  state: AppState,
  id: ID,
  patch: Partial<AppState['goals'][number]>,
): AppState {
  return {
    ...state,
    goals: state.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
  };
}
