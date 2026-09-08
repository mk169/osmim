import type { AppState } from '../types';

/**
 * Die erste Fassung der App startete mit Beispieldaten. Wer sie damals
 * geöffnet hat, trägt sie im Browser-Speicher — ein neuer Programmstand
 * überschreibt den Speicher nicht von selbst.
 *
 * Diese Bereinigung entfernt genau die Einträge der damaligen Beispiele,
 * erkennbar an ihren festen Kennungen. Alles, was du selbst angelegt hast,
 * bekam beim Anlegen eine Zufallskennung und bleibt unberührt.
 */
const DEMO_ID =
  /^(goal_(exams|thesis|attention|training|education|body_comp|social)|proj_(thesis|exams|training|internship|krakau|paint|venture|ableton)|task_[1-6]|inbox_[1-3]|habit_[1-9]|journal_1|ev_([1-9]|1[01])|c_[1-6]|ex_[1-6]|app_[1-3]|lib_[1-5]|lv_[1-3]|ms_[1-4]|phase_[1-4]|fin_[12]|fix_[1-4]|pay_[12])$/;

const isDemo = (item: { id: string }) => DEMO_ID.test(item.id);

export function purgeDemoData(state: AppState): AppState {
  const had =
    state.goals.some(isDemo) ||
    state.projects.some(isDemo) ||
    state.tasks.some(isDemo) ||
    state.events.some(isDemo) ||
    state.contacts.some(isDemo) ||
    state.exams.some(isDemo);

  // Nichts von damals vorhanden — der Zustand gehört ganz dir.
  if (!had) return state;

  const keep = <T extends { id: string }>(list: T[]) => list.filter((i) => !isDemo(i));

  return {
    ...state,
    goals: keep(state.goals),
    projects: keep(state.projects),
    tasks: keep(state.tasks),
    inbox: keep(state.inbox),
    habits: keep(state.habits),
    journal: keep(state.journal),
    events: keep(state.events),
    contacts: keep(state.contacts),
    exams: keep(state.exams),
    applications: keep(state.applications),
    library: keep(state.library),
    lived: keep(state.lived),
    // Die Beispieltexte lagen in Feldern ohne eigene Kennung — sie gehen
    // mit, weil sie zum selben Beispielzustand gehörten.
    compass: {
      creed: '',
      values: [],
      qualities: [],
      antiVision: [],
      phases: [],
      notMyMeasure: [],
    },
    season: {
      ...state.season,
      statement: '',
      milestones: keep(state.season.milestones),
      notNow: [],
    },
    areas: state.areas.map((a) => ({
      ...a,
      creed: '',
      focus: '',
      notes: '',
      extra: '',
      review: '',
    })),
    finances: {
      income: keep(state.finances.income),
      fixed: keep(state.finances.fixed),
      savingsGoal: { label: 'Sparziel', target: 0, saved: 0 },
      openPayments: keep(state.finances.openPayments),
    },
    days: Object.fromEntries(
      Object.entries(state.days).map(([date, d]) => [date, { ...d, intention: '' }]),
    ),
  };
}
