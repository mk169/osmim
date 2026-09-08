import { useState } from 'react';
import { useStore } from '../store/store';
import type { Area, AreaKey, AreaModule } from '../types';
import {
  AREA_MODULE,
  AREA_MODULE_ORDER,
  GOAL_FRAMEWORK,
  GOAL_STATUS,
  PROJECT_STATUS,
} from '../lib/labels';
import { GoalModal } from '../components/GoalModal';
import {
  Card,
  DeleteButton,
  Empty,
  InlineEdit,
  PageHeader,
  Pill,
  QuickAdd,
  QuietLine,
  SectionTitle,
  cx,
} from '../components/ui';
import { navigate } from '../lib/router';
import { habitCountInWeek, newId, patchGoal, toggleHabit } from '../store/actions';
import { formatShort, startOfWeek, today, weekDays } from '../lib/date';
import {
  ApplicationPanel,
  ContactPanel,
  ExamPanel,
  FinancePanel,
  LibraryPanel,
  LogPanel,
  PracticePanel,
} from './areas/panels';

const ACCENT_BORDER: Record<Area['accent'], string> = {
  forest: 'border-l-forest-500 dark:border-l-forest-300',
  wine: 'border-l-wine-500 dark:border-l-wine-300',
  brass: 'border-l-brass-500 dark:border-l-brass-300',
  ink: 'border-l-ink-300 dark:border-l-paper-200/50',
};

const ACCENT_TEXT: Record<Area['accent'], string> = {
  forest: 'text-forest-600 dark:text-forest-300',
  wine: 'text-wine-500 dark:text-wine-300',
  brass: 'text-brass-500 dark:text-brass-300',
  ink: 'text-ink-400 dark:text-paper-200/60',
};

const ACCENTS: Area['accent'][] = ['forest', 'wine', 'brass', 'ink'];

/** Nächster freier Buchstabe für einen neuen Bereich. */
function nextLetter(existing: Area[]): string {
  const used = new Set(existing.map((a) => a.letter));
  for (let i = 0; i < 26; i += 1) {
    const letter = String.fromCharCode(65 + i);
    if (!used.has(letter)) return letter;
  }
  return '·';
}

function AreaOverview() {
  const { state, update } = useStore();

  return (
    <div>
      <PageHeader
        eyebrow={`${state.areas.length} Bereiche`}
        title="Bereiche"
        lead="Ein Leben besteht nicht aus Aufgaben, sondern aus Feldern, die gepflegt werden wollen. Lege an, was zu deinem gehört — und lösche, was nicht."
      />

      {state.areas.length === 0 ? (
        <Empty
          title="Noch kein Bereich"
          text="Fang mit drei bis vier an. Weitere kommen von selbst dazu, wenn du sie brauchst."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {state.areas.map((area) => {
            const goals = state.goals.filter((g) => g.areaId === area.id);
            const projects = state.projects.filter(
              (p) => p.areaId === area.id && p.status !== 'done',
            );
            const habits = state.habits.filter((h) => h.areaId === area.id);

            return (
              <div
                key={area.id}
                className={cx(
                  'card group relative border-l-2 p-6 transition-all duration-300 ease-calm',
                  'hover:-translate-y-px hover:shadow-[0_12px_30px_-24px_rgba(28,27,24,0.5)]',
                  ACCENT_BORDER[area.accent],
                )}
              >
                <DeleteButton
                  label={`Bereich „${area.title}“ löschen`}
                  confirm={`„${area.title}“ löschen? Ziele, Projekte und Gewohnheiten dieses Bereichs bleiben erhalten, verlieren aber ihre Zuordnung.`}
                  className="absolute right-3 top-3"
                  onDelete={() =>
                    update((s) => ({ ...s, areas: s.areas.filter((a) => a.id !== area.id) }))
                  }
                />
                <button
                  type="button"
                  onClick={() => navigate('bereiche', area.id)}
                  className="block w-full text-left"
                >
                  <div className="mb-3 flex items-baseline gap-3 pr-6">
                    <span
                      className={cx(
                        'display text-[0.9rem] tracking-wide',
                        ACCENT_TEXT[area.accent],
                      )}
                    >
                      {area.letter}
                    </span>
                    <h2 className="display text-xl leading-snug text-ink-700 dark:text-paper-100">
                      {area.title}
                    </h2>
                  </div>
                  <p className="mb-5 text-[0.9rem] leading-relaxed text-ink-400 dark:text-paper-200/60">
                    {area.focus || (
                      <span className="text-ink-300 dark:text-paper-200/40">
                        Noch kein Fokus gesetzt.
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.76rem] text-ink-300 dark:text-paper-200/40">
                    <span>{goals.length} Ziele</span>
                    <span>{projects.length} Projekte</span>
                    <span>{habits.length} Gewohnheiten</span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 max-w-md">
        <QuickAdd
          placeholder="Neuen Bereich anlegen …"
          onAdd={(title) =>
            update((s) => ({
              ...s,
              areas: [
                ...s.areas,
                {
                  id: newId('area'),
                  letter: nextLetter(s.areas),
                  title,
                  subtitle: '',
                  creed: '',
                  focus: '',
                  notes: '',
                  extra: '',
                  review: '',
                  accent: ACCENTS[s.areas.length % ACCENTS.length],
                  modules: [],
                },
              ],
            }))
          }
        />
      </div>
    </div>
  );
}

/** Was dieser Bereich heute, diese Woche und in der Saison bedeutet. */
function AreaLinks({ areaId }: { areaId: AreaKey }) {
  const { state } = useStore();
  const t = today();
  const week = weekDays(startOfWeek(t));

  const todayTasks = state.tasks.filter((x) => x.areaId === areaId && x.date === t);
  const weekTasks = state.tasks.filter(
    (x) => x.areaId === areaId && x.date && week.includes(x.date),
  );
  const seasonGoals = state.goals.filter(
    (g) => g.areaId === areaId && g.horizon === 'season',
  );
  const seasonDone = seasonGoals.length
    ? Math.round(seasonGoals.reduce((a, g) => a + g.progress, 0) / seasonGoals.length)
    : 0;

  const rows: { label: string; value: string; to: 'heute' | 'woche' | 'saison' }[] = [
    {
      label: 'Heute',
      value: todayTasks.length
        ? `${todayTasks.filter((x) => x.done).length} von ${todayTasks.length} Aufgaben`
        : 'nichts eingeplant',
      to: 'heute',
    },
    {
      label: 'Diese Woche',
      value: weekTasks.length ? `${weekTasks.length} Aufgaben verteilt` : 'nichts verteilt',
      to: 'woche',
    },
    {
      label: 'Saison',
      value: seasonGoals.length
        ? `${seasonGoals.length} Ziele · im Schnitt ${seasonDone}%`
        : 'kein Saisonziel',
      to: 'saison',
    },
  ];

  return (
    <Card className="mb-8">
      <SectionTitle>Wo dieser Bereich auftaucht</SectionTitle>
      <ul className="divide-y rule">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <span className="text-[0.9rem] text-ink-600 dark:text-paper-200/85">{r.label}</span>
            <span className="flex items-center gap-4">
              <span className="text-[0.85rem] text-ink-300 dark:text-paper-200/45">
                {r.value}
              </span>
              <button
                type="button"
                onClick={() => navigate(r.to)}
                className="text-[0.78rem] text-ink-300 underline-offset-2 hover:text-forest-600 hover:underline dark:hover:text-forest-300"
              >
                öffnen
              </button>
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function ModulePicker({ area }: { area: Area }) {
  const { update } = useStore();
  const active = area.modules ?? [];

  const toggle = (m: AreaModule) =>
    update((s) => ({
      ...s,
      areas: s.areas.map((a) =>
        a.id === area.id
          ? {
              ...a,
              modules: active.includes(m)
                ? active.filter((x) => x !== m)
                : [...active, m],
            }
          : a,
      ),
    }));

  return (
    <Card className="mb-8">
      <SectionTitle>Werkzeuge</SectionTitle>
      <p className="mb-4 text-[0.85rem] leading-relaxed text-ink-300 dark:text-paper-200/50">
        Ein Bereich ist zunächst eine leere Vorlage. Schalte nur dazu, was dieser
        Bereich wirklich braucht.
      </p>
      <div className="flex flex-wrap gap-2">
        {AREA_MODULE_ORDER.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => toggle(m)}
            title={AREA_MODULE[m].blurb}
            aria-pressed={active.includes(m)}
            className={cx(
              'rounded-full border px-3.5 py-1.5 text-[0.83rem] transition-colors duration-200 ease-calm',
              active.includes(m)
                ? 'border-forest-500 text-forest-600 dark:border-forest-300 dark:text-forest-300'
                : 'border-paper-300 text-ink-400 hover:border-ink-300 dark:border-ink-600 dark:text-paper-200/70 dark:hover:border-ink-500',
            )}
          >
            {AREA_MODULE[m].label}
          </button>
        ))}
      </div>
    </Card>
  );
}

function AreaDetail({ id }: { id: AreaKey }) {
  const { state, update } = useStore();
  const [openGoal, setOpenGoal] = useState<string | null>(null);
  const area = state.areas.find((a) => a.id === id);
  const t = today();
  const week = weekDays(startOfWeek(t));

  if (!area) {
    return (
      <Empty
        title="Bereich nicht gefunden"
        text="Dieser Bereich wurde gelöscht oder hat nie existiert."
        action={
          <button type="button" onClick={() => navigate('bereiche')} className="btn-quiet">
            Zurück zur Übersicht
          </button>
        }
      />
    );
  }

  const goals = state.goals.filter((g) => g.areaId === id);
  const projects = state.projects.filter((p) => p.areaId === id);
  const habits = state.habits.filter((h) => h.areaId === id);
  const modules = area.modules ?? [];

  const patchArea = (patch: Partial<Area>) =>
    update((s) => ({
      ...s,
      areas: s.areas.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('bereiche')}
        className="mb-8 text-[0.8rem] text-ink-300 underline-offset-2 hover:text-ink-500 hover:underline dark:hover:text-paper-100"
      >
        ← Alle Bereiche
      </button>

      <header className="mb-10 border-b rule pb-8">
        <p className="label mb-3">Bereich {area.letter}</p>
        <InlineEdit
          value={area.title}
          multiline={false}
          onSave={(v) => patchArea({ title: v })}
          displayClassName="display text-4xl leading-[1.1] sm:text-5xl"
          className="-mx-2"
        />
        <div className="-mx-2 mt-2 max-w-xl">
          <InlineEdit
            value={area.subtitle}
            multiline={false}
            placeholder="Untertitel — worum geht es hier in drei Worten?"
            onSave={(v) => patchArea({ subtitle: v })}
            displayClassName="text-[0.95rem] text-ink-400 dark:text-paper-200/60"
          />
        </div>
      </header>

      <Card className={cx('mb-8 border-l-2', ACCENT_BORDER[area.accent])}>
        <p className="label mb-2">Leitbild</p>
        <InlineEdit
          value={area.creed}
          placeholder="Wofür steht dieser Bereich in deinem Leben?"
          onSave={(v) => patchArea({ creed: v })}
          displayClassName="display text-xl leading-snug sm:text-2xl"
          className="-mx-2"
        />
        <div className="mt-6 border-t rule pt-5">
          <p className="label mb-2">Fokus im aktuellen Zeitraum</p>
          <InlineEdit
            value={area.focus}
            placeholder="Was soll hier in diesem Zeitraum gelingen?"
            onSave={(v) => patchArea({ focus: v })}
            displayClassName="text-[0.95rem] leading-relaxed"
            className="-mx-2"
          />
        </div>
      </Card>

      <AreaLinks areaId={id} />
      <ModulePicker area={area} />

      {modules.length > 0 && (
        <div className="mb-8 space-y-4">
          {modules.includes('practice') && <PracticePanel areaId={id} />}
          {modules.includes('log') && <LogPanel areaId={id} />}
          {modules.includes('contacts') && <ContactPanel />}
          {modules.includes('exams') && <ExamPanel />}
          {modules.includes('applications') && <ApplicationPanel />}
          {modules.includes('library') && <LibraryPanel />}
          {modules.includes('finances') && <FinancePanel />}
        </div>
      )}

      <section className="mb-8">
        <SectionTitle>Ziele</SectionTitle>
        {goals.length === 0 ? (
          <Empty
            title="Noch kein Ziel in diesem Bereich"
            text="Ein Bereich darf auch einfach gepflegt werden, ohne Ziel."
          />
        ) : (
          <ul className="space-y-3">
            {goals.map((g) => (
              <li key={g.id} className="card group p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setOpenGoal(g.id)}
                    className="min-w-0 flex-1 text-left text-[0.98rem] text-ink-700 hover:underline hover:decoration-paper-400 hover:underline-offset-4 dark:text-paper-100"
                  >
                    {g.title}
                  </button>
                  {(g.framework ?? 'none') !== 'none' && (
                    <Pill tone="brass">{GOAL_FRAMEWORK[g.framework ?? 'none'].label}</Pill>
                  )}
                  <Pill tone={g.status === 'done' ? 'forest' : 'neutral'}>
                    {GOAL_STATUS[g.status]}
                  </Pill>
                  <DeleteButton
                    label="Ziel entfernen"
                    confirm={`„${g.title}“ löschen?`}
                    onDelete={() =>
                      update((s) => ({ ...s, goals: s.goals.filter((x) => x.id !== g.id) }))
                    }
                  />
                </div>
                {g.detail && (
                  <p className="mt-1 text-[0.88rem] text-ink-400 dark:text-paper-200/60">
                    {g.detail}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-4">
                  <QuietLine value={g.progress} tone="brass" />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={g.progress}
                    aria-label={`Fortschritt für ${g.title}`}
                    onChange={(e) =>
                      update((s) => patchGoal(s, g.id, { progress: Number(e.target.value) }))
                    }
                    className="h-1 w-28 shrink-0 cursor-pointer accent-forest-500"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4">
          <QuickAdd
            placeholder="Ziel für diesen Bereich …"
            onAdd={(title) =>
              update((s) => ({
                ...s,
                goals: [
                  ...s.goals,
                  {
                    id: newId('goal'),
                    title,
                    areaId: id,
                    horizon: 'season',
                    status: 'open',
                    progress: 0,
                    createdAt: new Date().toISOString(),
                  },
                ],
              }))
            }
          />
        </div>
      </section>

      <section className="mb-8">
        <SectionTitle>Gewohnheiten</SectionTitle>
        {habits.length === 0 ? (
          <Empty
            title="Keine Gewohnheiten"
            text="Gewohnheiten sind hier Erinnerungen, keine Ketten. Es gibt keine Streaks."
          />
        ) : (
          <Card>
            <ul className="divide-y rule">
              {habits.map((h) => {
                const doneToday = h.log.includes(t);
                const inWeek = habitCountInWeek(h, week);
                return (
                  <li
                    key={h.id}
                    className="group flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="text-[0.94rem] text-ink-600 dark:text-paper-200/85">
                        {h.title}
                      </p>
                      <p className="text-[0.78rem] text-ink-300 dark:text-paper-200/45">
                        {h.cadence === 'daily'
                          ? 'täglich'
                          : `diese Woche ${inWeek} von ${h.weeklyTarget ?? 1}`}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => update((s) => toggleHabit(s, h.id, t))}
                        className={cx('btn', doneToday ? 'btn-solid' : 'btn-quiet')}
                      >
                        Heute
                      </button>
                      <DeleteButton
                        label={`Gewohnheit „${h.title}“ entfernen`}
                        onDelete={() =>
                          update((s) => ({
                            ...s,
                            habits: s.habits.filter((x) => x.id !== h.id),
                          }))
                        }
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
        <div className="mt-4">
          <QuickAdd
            placeholder="Neue Gewohnheit …"
            onAdd={(title) =>
              update((s) => ({
                ...s,
                habits: [
                  ...s.habits,
                  { id: newId('habit'), title, areaId: id, cadence: 'daily', log: [] },
                ],
              }))
            }
          />
        </div>
      </section>

      <section className="mb-8">
        <SectionTitle
          right={
            <button
              type="button"
              onClick={() => navigate('projekte')}
              className="text-[0.78rem] text-ink-300 underline-offset-2 hover:text-ink-500 hover:underline dark:hover:text-paper-100"
            >
              alle Projekte
            </button>
          }
        >
          Projekte
        </SectionTitle>
        {projects.length === 0 ? (
          <Empty
            title="Kein Projekt"
            text="Nicht jeder Bereich braucht eines. Manche wollen nur regelmäßige Aufmerksamkeit."
          />
        ) : (
          <ul className="space-y-2">
            {projects.map((p) => (
              <li
                key={p.id}
                className="card flex flex-wrap items-baseline justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <p className="text-[0.95rem] text-ink-700 dark:text-paper-100">{p.title}</p>
                  <p className="text-[0.84rem] text-forest-600 dark:text-forest-300">
                    {p.nextAction || 'Nächste Handlung fehlt'}
                  </p>
                </div>
                <Pill tone={p.status === 'active' ? 'forest' : 'muted'}>
                  {PROJECT_STATUS[p.status]}
                </Pill>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <p className="label mb-2">Prinzipien & Routinen</p>
          <InlineEdit
            value={area.extra}
            onSave={(v) => patchArea({ extra: v })}
            placeholder="Regeln, die hier gelten — kurz und ohne Pathos."
            className="-mx-2 min-h-[6rem]"
            displayClassName="text-[0.92rem] leading-relaxed"
          />
        </Card>
        <Card>
          <p className="label mb-2">Notizen</p>
          <InlineEdit
            value={area.notes}
            onSave={(v) => patchArea({ notes: v })}
            placeholder="Gedanken, Beobachtungen …"
            className="-mx-2 min-h-[6rem]"
            displayClassName="text-[0.92rem] leading-relaxed"
          />
        </Card>
        <Card>
          <p className="label mb-2">Rückblick</p>
          <InlineEdit
            value={area.review}
            onSave={(v) => patchArea({ review: v })}
            placeholder="Was ist hier gewachsen — und was liegengeblieben?"
            className="-mx-2 min-h-[6rem]"
            displayClassName="text-[0.92rem] leading-relaxed"
          />
        </Card>
      </div>

      <p className="mt-8 text-center text-[0.8rem] text-ink-300 dark:text-paper-200/40">
        Angelegt als Vorlage · zuletzt gesehen {formatShort(t)}
      </p>

      <GoalModal id={openGoal} onClose={() => setOpenGoal(null)} />
    </div>
  );
}

export function Areas({ param }: { param?: string }) {
  if (param) return <AreaDetail id={param} />;
  return <AreaOverview />;
}
