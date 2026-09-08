import { useMemo, useState } from 'react';
import { useStore } from '../store/store';
import { patchGoal, newId } from '../store/actions';
import { GOAL_FRAMEWORK, GOAL_STATUS } from '../lib/labels';
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
import {
  addDays,
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

function GoalRow({ id, onOpen }: { id: string; onOpen: () => void }) {
  const { state, update } = useStore();
  const goal = state.goals.find((g) => g.id === id);
  const area = state.areas.find((a) => a.id === goal?.areaId);
  if (!goal) return null;

  const framework = goal.framework ?? 'none';

  return (
    <li className="card group p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
          <span className="display block text-lg leading-snug text-ink-700 hover:underline hover:decoration-paper-400 hover:underline-offset-4 dark:text-paper-100">
            {goal.title}
          </span>
          {goal.detail && (
            <span className="mt-0.5 block text-[0.9rem] text-ink-400 dark:text-paper-200/60">
              {goal.detail}
            </span>
          )}
        </button>
        <div className="flex shrink-0 items-center gap-2">
          {framework !== 'none' && (
            <Pill tone="brass">{GOAL_FRAMEWORK[framework].label}</Pill>
          )}
          {area && <Pill tone="muted">{area.letter}</Pill>}
          <Pill tone={goal.status === 'done' ? 'forest' : 'neutral'}>
            {GOAL_STATUS[goal.status]}
          </Pill>
          <DeleteButton
            label="Ziel entfernen"
            confirm={`„${goal.title}“ löschen?`}
            onDelete={() =>
              update((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== goal.id) }))
            }
          />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <QuietLine value={goal.progress} tone={goal.status === 'done' ? 'forest' : 'brass'} />
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={goal.progress}
          aria-label={`Fortschritt für ${goal.title}`}
          onChange={(e) =>
            update((s) =>
              patchGoal(s, goal.id, {
                progress: Number(e.target.value),
                status:
                  Number(e.target.value) === 100
                    ? 'done'
                    : goal.status === 'done'
                      ? 'moving'
                      : goal.status,
              }),
            )
          }
          className="h-1 w-28 shrink-0 cursor-pointer accent-forest-500"
        />
        <span className="w-9 shrink-0 text-right text-[0.78rem] tabular-nums text-ink-300">
          {goal.progress}%
        </span>
      </div>
    </li>
  );
}

/** Zeitraum der Saison: Vorlagen und freie Daten. */
const PERIODS: { label: string; days: number }[] = [
  { label: '30 Tage', days: 30 },
  { label: '90 Tage', days: 90 },
  { label: 'Halbjahr', days: 182 },
  { label: 'Jahr', days: 365 },
];

function PeriodControls() {
  const { state, update } = useStore();
  const { season } = state;
  const length = Math.max(1, daysBetween(season.startDate, season.endDate));

  const setSeason = (patch: Partial<typeof season>) =>
    update((s) => ({ ...s, season: { ...s.season, ...patch } }));

  return (
    <Card className="mb-8">
      <SectionTitle
        right={
          <span className="text-[0.78rem] tabular-nums text-ink-300">{length} Tage</span>
        }
      >
        Zeitraum
      </SectionTitle>

      <div className="mb-5 flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setSeason({ endDate: addDays(season.startDate, p.days) })}
            className={cx(
              'rounded-full border px-3.5 py-1.5 text-[0.83rem] transition-colors duration-200 ease-calm',
              length === p.days
                ? 'border-forest-500 text-forest-600 dark:border-forest-300 dark:text-forest-300'
                : 'border-paper-300 text-ink-400 hover:border-ink-300 dark:border-ink-600 dark:text-paper-200/70 dark:hover:border-ink-500',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="label mb-1.5 block">Name</span>
          <input
            value={season.title}
            onChange={(e) => setSeason({ title: e.target.value })}
            placeholder="Herbstsaison"
            className="field"
          />
        </label>
        <label className="block">
          <span className="label mb-1.5 block">Beginn</span>
          <input
            type="date"
            value={season.startDate}
            onChange={(e) => setSeason({ startDate: e.target.value })}
            className="field"
          />
        </label>
        <label className="block">
          <span className="label mb-1.5 block">Ende</span>
          <input
            type="date"
            value={season.endDate}
            onChange={(e) => setSeason({ endDate: e.target.value })}
            className="field"
          />
        </label>
      </div>

      <p className="mt-4 text-[0.83rem] leading-relaxed text-ink-300 dark:text-paper-200/45">
        Neunzig Tage sind eine gute Vorgabe, keine Vorschrift. Ein Monat reicht für
        eine Gewohnheit, ein Jahr für eine Richtung.
      </p>
    </Card>
  );
}

export function Season() {
  const { state, update } = useStore();
  const t = today();
  const [month, setMonth] = useState(currentMonth());
  const [openGoal, setOpenGoal] = useState<string | null>(null);

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
        lead="Ein Zeitraum, den du überblicken kannst — dreißig Tage oder ein ganzes Jahr. Drei bis vier Ziele darin, nicht mehr."
        aside={<SeasonArc done={done} total={total} />}
      />

      <PeriodControls />

      <Card className="mb-10 border-l-2 border-l-forest-500 dark:border-l-forest-300">
        <p className="label mb-3">Worum es diese Saison geht</p>
        <InlineEdit
          value={state.season.statement}
          placeholder="Worum geht es in diesem Zeitraum? Ein Satz genügt."
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
              <GoalRow key={g.id} id={g.id} onOpen={() => setOpenGoal(g.id)} />
            ))}
          </ul>
        )}

        <p className="mt-4 text-[0.83rem] text-ink-300 dark:text-paper-200/45">
          Ein Ziel anklicken, um es auszuarbeiten — mit SMART, OKR oder WOOP, wenn
          es das braucht.
        </p>

        <div className="mt-3">
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
                    <DeleteButton
                      label="Termin entfernen"
                      onDelete={() =>
                        update((s) => ({
                          ...s,
                          season: {
                            ...s.season,
                            milestones: s.season.milestones.filter((x) => x.id !== m.id),
                          },
                        }))
                      }
                    />
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
                <DeleteButton
                  label="Von der Liste nehmen"
                  onDelete={() =>
                    update((s) => ({
                      ...s,
                      season: {
                        ...s.season,
                        notNow: s.season.notNow.filter((_, idx) => idx !== i),
                      },
                    }))
                  }
                />
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

      <GoalModal id={openGoal} onClose={() => setOpenGoal(null)} />
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
