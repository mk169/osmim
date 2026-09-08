import { useMemo, useState } from 'react';
import { useStore } from '../store/store';
import { patchGoal, newId } from '../store/actions';
import { GOAL_STATUS, options } from '../lib/labels';
import type { GoalStatus } from '../types';
import {
  Card,
  Empty,
  InlineEdit,
  PageHeader,
  Pill,
  QuickAdd,
  QuietLine,
  SectionTitle,
  Select,
  cx,
} from '../components/ui';
import {
  currentMonth,
  daysBetween,
  formatShort,
  monthLabel,
  today,
} from '../lib/date';

function SeasonArc({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="w-full sm:w-64">
      <div className="mb-2 flex items-baseline justify-between text-[0.78rem] text-ink-300 dark:text-paper-200/45">
        <span>Tag {Math.max(0, done)}</span>
        <span>{total} Tage</span>
      </div>
      <QuietLine value={pct} label={`Saison zu ${pct} Prozent verstrichen`} />
      <p className="mt-2 text-[0.78rem] text-ink-300 dark:text-paper-200/45">
        {total - done > 0
          ? `Noch ${total - done} Tage. Es ist genug Zeit.`
          : 'Die Saison ist ausgelaufen — Zeit für eine neue.'}
      </p>
    </div>
  );
}

function GoalRow({ id }: { id: string }) {
  const { state, update } = useStore();
  const goal = state.goals.find((g) => g.id === id);
  const area = state.areas.find((a) => a.id === goal?.areaId);
  if (!goal) return null;

  return (
    <li className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <InlineEdit
            value={goal.title}
            multiline={false}
            onSave={(v) => update((s) => patchGoal(s, goal.id, { title: v }))}
            displayClassName="display text-lg leading-snug"
            className="-mx-2"
          />
          <div className="-mx-2">
            <InlineEdit
              value={goal.detail ?? ''}
              onSave={(v) => update((s) => patchGoal(s, goal.id, { detail: v }))}
              placeholder="Was heißt das konkret?"
              displayClassName="text-[0.9rem] text-ink-400 dark:text-paper-200/60"
            />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {area && <Pill tone="muted">{area.title.split(' ')[0]}</Pill>}
          <Pill tone={goal.status === 'done' ? 'forest' : 'neutral'}>
            {GOAL_STATUS[goal.status]}
          </Pill>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <QuietLine value={goal.progress} tone={goal.status === 'done' ? 'forest' : 'brass'} />
        <div className="flex shrink-0 items-center gap-1">
          {[0, 25, 50, 75, 100].map((v) => (
            <button
              key={v}
              type="button"
              aria-label={`Fortschritt auf ${v} Prozent setzen`}
              onClick={() =>
                update((s) =>
                  patchGoal(s, goal.id, {
                    progress: v,
                    status: v === 100 ? 'done' : goal.status === 'done' ? 'moving' : goal.status,
                  }),
                )
              }
              className={cx(
                'h-1.5 w-1.5 rounded-full transition-colors duration-300 ease-calm',
                goal.progress >= v && v > 0
                  ? 'bg-ink-300 dark:bg-paper-200/50'
                  : 'bg-paper-300 hover:bg-ink-300 dark:bg-ink-600 dark:hover:bg-paper-200/40',
              )}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 border-t rule pt-3">
        <Select
          value={goal.status}
          onChange={(v) => update((s) => patchGoal(s, goal.id, { status: v as GoalStatus }))}
          options={options(GOAL_STATUS)}
          className="w-44 py-1 text-[0.82rem]"
        />
        <button
          type="button"
          onClick={() =>
            update((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== goal.id) }))
          }
          className="text-[0.75rem] text-ink-300 underline-offset-2 hover:text-wine-500 hover:underline"
        >
          entfernen
        </button>
      </div>
    </li>
  );
}

export function Season() {
  const { state, update } = useStore();
  const t = today();
  const [month, setMonth] = useState(currentMonth());

  const seasonGoals = state.goals.filter((g) => g.horizon === 'season');
  const total = Math.max(1, daysBetween(state.season.startDate, state.season.endDate));
  const done = Math.max(0, Math.min(total, daysBetween(state.season.startDate, t)));

  const milestones = useMemo(
    () => [...state.season.milestones].sort((a, b) => a.date.localeCompare(b.date)),
    [state.season.milestones],
  );

  const reflection = state.monthReflections.find((m) => m.month === month);

  return (
    <div>
      <PageHeader
        eyebrow={`${state.season.title} · ${formatShort(state.season.startDate)} – ${formatShort(state.season.endDate)}`}
        title="Saison"
        lead="Neunzig Tage sind lang genug für Veränderung und kurz genug, um sie zu überblicken. Drei bis vier Ziele — nicht mehr."
        aside={<SeasonArc done={done} total={total} />}
      />

      <Card className="mb-10 border-l-2 border-l-forest-500 dark:border-l-forest-300">
        <p className="label mb-3">Worum es diese Saison geht</p>
        <InlineEdit
          value={state.season.statement}
          onSave={(v) =>
            update((s) => ({ ...s, season: { ...s.season, statement: v } }))
          }
          displayClassName="display text-2xl leading-snug sm:text-[1.75rem]"
          className="-mx-2"
        />
      </Card>

      <section className="mb-12">
        <SectionTitle
          right={
            <span className="text-[0.78rem] text-ink-300">
              {seasonGoals.length} von idealerweise 4
            </span>
          }
        >
          Saisonziele
        </SectionTitle>

        {seasonGoals.length === 0 ? (
          <Empty
            title="Noch keine Saisonziele"
            text="Drei bis vier Vorhaben genügen. Was soll in neunzig Tagen anders sein?"
          />
        ) : (
          <ul className="space-y-3">
            {seasonGoals.map((g) => (
              <GoalRow key={g.id} id={g.id} />
            ))}
          </ul>
        )}

        <div className="mt-4">
          <QuickAdd
            placeholder="Ein weiteres Saisonziel …"
            onAdd={(title) =>
              update((s) => ({
                ...s,
                goals: [
                  ...s.goals,
                  {
                    id: newId('goal'),
                    title,
                    areaId: 'attention',
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

      <div className="mb-12 grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle>Wichtige Termine</SectionTitle>
          {milestones.length === 0 ? (
            <p className="mb-4 text-[0.9rem] text-ink-300 dark:text-paper-200/45">
              Noch nichts eingetragen.
            </p>
          ) : (
            <ul className="mb-4 divide-y rule">
              {milestones.map((m) => {
                const days = daysBetween(t, m.date);
                return (
                  <li key={m.id} className="group flex items-baseline gap-4 py-2.5">
                    <span className="w-16 shrink-0 text-[0.8rem] tabular-nums text-ink-300 dark:text-paper-200/45">
                      {formatShort(m.date)}
                    </span>
                    <span className="min-w-0 flex-1 text-[0.93rem] text-ink-600 dark:text-paper-200/85">
                      {m.title}
                    </span>
                    <span className="shrink-0 text-[0.75rem] text-ink-300 dark:text-paper-200/40">
                      {days === 0 ? 'heute' : days > 0 ? `in ${days} T.` : 'vorbei'}
                    </span>
                    <button
                      type="button"
                      aria-label="Termin entfernen"
                      onClick={() =>
                        update((s) => ({
                          ...s,
                          season: {
                            ...s.season,
                            milestones: s.season.milestones.filter((x) => x.id !== m.id),
                          },
                        }))
                      }
                      className="shrink-0 text-ink-300 opacity-0 transition-opacity hover:text-wine-500 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <MilestoneAdd />
        </Card>

        <Card>
          <SectionTitle>„Nicht jetzt“</SectionTitle>
          <p className="mb-4 text-[0.85rem] leading-relaxed text-ink-300 dark:text-paper-200/50">
            Bewusst zurückgestellt. Nicht verworfen — nur nicht in diesen neunzig Tagen.
          </p>
          <ul className="mb-4 space-y-1">
            {state.season.notNow.map((item, i) => (
              <li
                key={`${item}-${i}`}
                className="group flex items-baseline gap-3 py-1 text-[0.92rem] text-ink-400 dark:text-paper-200/60"
              >
                <span aria-hidden className="text-ink-300">—</span>
                <span className="flex-1">{item}</span>
                <button
                  type="button"
                  aria-label="Von der Liste nehmen"
                  onClick={() =>
                    update((s) => ({
                      ...s,
                      season: {
                        ...s.season,
                        notNow: s.season.notNow.filter((_, idx) => idx !== i),
                      },
                    }))
                  }
                  className="text-ink-300 opacity-0 transition-opacity hover:text-wine-500 group-hover:opacity-100"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <QuickAdd
            placeholder="Was darf warten?"
            onAdd={(text) =>
              update((s) => ({
                ...s,
                season: { ...s.season, notNow: [...s.season.notNow, text] },
              }))
            }
          />
        </Card>
      </div>

      <section>
        <SectionTitle
          right={
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="field w-40 py-1 text-[0.82rem]"
            />
          }
        >
          Monatsreflexion
        </SectionTitle>
        <Card>
          <p className="label mb-3">{monthLabel(month)}</p>
          <InlineEdit
            value={reflection?.text ?? ''}
            placeholder="Was hat sich in diesem Monat wirklich verändert? Was habe ich über mich gelernt? Wo war ich großzügig, wo eng?"
            onSave={(v) =>
              update((s) => {
                const exists = s.monthReflections.find((m) => m.month === month);
                if (exists) {
                  return {
                    ...s,
                    monthReflections: s.monthReflections.map((m) =>
                      m.month === month ? { ...m, text: v } : m,
                    ),
                  };
                }
                return {
                  ...s,
                  monthReflections: [
                    ...s.monthReflections,
                    {
                      id: newId('month'),
                      month,
                      text: v,
                      createdAt: new Date().toISOString(),
                    },
                  ],
                };
              })
            }
            className="-mx-2 min-h-[8rem]"
          />
        </Card>
      </section>
    </div>
  );
}

function MilestoneAdd() {
  const { update } = useStore();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(today());

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        update((s) => ({
          ...s,
          season: {
            ...s.season,
            milestones: [
              ...s.season.milestones,
              { id: newId('ms'), title: title.trim(), date },
            ],
          },
        }));
        setTitle('');
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Termin …"
        className="field min-w-0 flex-1"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="field w-36 shrink-0"
      />
      <button type="submit" className="btn-quiet shrink-0" disabled={!title.trim()}>
        Eintragen
      </button>
    </form>
  );
}
