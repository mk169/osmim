import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store/store';
import { newId } from '../store/actions';
import { EVENT_COLOR, EVENT_KIND, options } from '../lib/labels';
import { WeekTrend } from '../components/WeekTrend';
import type { CalendarEvent, EventKind, WeekReview } from '../types';
import {
  AutoTextarea,
  Card,
  DeleteButton,
  Empty,
  InlineEdit,
  Modal,
  PageHeader,
  Pill,
  SectionTitle,
  Select,
  TextField,
  cx,
} from '../components/ui';
import {
  addDays,
  formatShort,
  startOfWeek,
  today,
  weekDays,
  weekdayShort,
} from '../lib/date';

const DEMANDING_LIMIT = 3;

function CapacityMark({ count }: { count: number }) {
  const over = count > DEMANDING_LIMIT;
  return (
    <div className="flex items-center gap-1" title={`${count} anspruchsvolle Prioritäten`}>
      {Array.from({ length: Math.max(DEMANDING_LIMIT, count) }, (_, i) => (
        <span
          key={i}
          className={cx(
            'h-1 w-3 rounded-full transition-colors duration-300 ease-calm',
            i >= DEMANDING_LIMIT
              ? 'bg-wine-300 dark:bg-wine-300/70'
              : i < count
                ? 'bg-forest-500 dark:bg-forest-300'
                : 'bg-paper-300 dark:bg-ink-600',
          )}
        />
      ))}
      {over && (
        <span className="ml-1 text-[0.68rem] text-wine-500 dark:text-wine-300">voll</span>
      )}
    </div>
  );
}

/**
 * Ein Formular für neue und bestehende Termine. `event` leer heißt: neu
 * anlegen am übergebenen Datum.
 */
function EventModal({
  open,
  date,
  event,
  onClose,
}: {
  open: boolean;
  date: string;
  event?: CalendarEvent;
  onClose: () => void;
}) {
  const { update } = useStore();
  const [draft, setDraft] = useState<Omit<CalendarEvent, 'id'>>(() => ({
    title: '',
    kind: 'study',
    date,
    start: '',
    end: '',
    note: '',
    demanding: false,
  }));

  // Beim Öffnen den Entwurf frisch aus dem Termin befüllen.
  useEffect(() => {
    if (!open) return;
    setDraft(
      event
        ? { ...event }
        : {
            title: '',
            kind: 'study',
            date,
            start: '',
            end: '',
            note: '',
            demanding: false,
          },
    );
  }, [open, event, date]);

  const save = () => {
    const title = draft.title.trim();
    if (!title) return;
    const clean: Omit<CalendarEvent, 'id'> = {
      ...draft,
      title,
      start: draft.start || undefined,
      end: draft.end || undefined,
      note: draft.note?.trim() || undefined,
    };
    update((s) =>
      event
        ? {
            ...s,
            events: s.events.map((e) => (e.id === event.id ? { ...e, ...clean } : e)),
          }
        : { ...s, events: [...s.events, { id: newId('ev'), ...clean }] },
    );
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={event ? 'Termin bearbeiten' : `Neuer Termin · ${formatShort(date)}`}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="space-y-4"
      >
        <TextField
          label="Was"
          value={draft.title}
          autoFocus
          placeholder="Fokusblock, Training, Abendessen …"
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Art"
            value={draft.kind}
            onChange={(v) => setDraft({ ...draft, kind: v as EventKind })}
            options={options(EVENT_KIND)}
          />
          <TextField
            label="Tag"
            type="date"
            value={draft.date}
            onChange={(e) => setDraft({ ...draft, date: e.target.value })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Von"
            type="time"
            value={draft.start ?? ''}
            onChange={(e) => setDraft({ ...draft, start: e.target.value })}
          />
          <TextField
            label="Bis"
            type="time"
            value={draft.end ?? ''}
            onChange={(e) => setDraft({ ...draft, end: e.target.value })}
          />
        </div>

        <AutoTextarea
          label="Notiz"
          value={draft.note ?? ''}
          placeholder="Optional — Ort, Mitbringsel, Gedanke."
          onChange={(e) => setDraft({ ...draft, note: e.target.value })}
        />

        <label className="flex cursor-pointer items-start gap-3 text-[0.9rem] leading-snug text-ink-500 dark:text-paper-200/75">
          <input
            type="checkbox"
            checked={draft.demanding ?? false}
            onChange={(e) => setDraft({ ...draft, demanding: e.target.checked })}
            className="mt-0.5 h-3.5 w-3.5 accent-forest-500"
          />
          <span>
            Anspruchsvolle Priorität
            <span className="block text-[0.8rem] text-ink-300 dark:text-paper-200/45">
              Zählt in die Kapazität — höchstens drei pro Tag.
            </span>
          </span>
        </label>

        <div className="flex items-center justify-between border-t rule pt-4">
          {event ? (
            <button
              type="button"
              onClick={() => {
                update((s) => ({ ...s, events: s.events.filter((e) => e.id !== event.id) }));
                onClose();
              }}
              className="text-[0.8rem] text-ink-300 underline-offset-2 hover:text-wine-500 hover:underline"
            >
              Termin löschen
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-quiet">
              Abbrechen
            </button>
            <button type="submit" className="btn-solid" disabled={!draft.title.trim()}>
              {event ? 'Sichern' : 'Eintragen'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function DayColumn({ date }: { date: string }) {
  const { state } = useStore();
  const isToday = date === today();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);

  const events = state.events
    .filter((e) => e.date === date)
    .sort((a, b) => (a.start ?? '~').localeCompare(b.start ?? '~'));
  const tasks = state.tasks.filter((t) => t.date === date);
  const demanding =
    events.filter((e) => e.demanding).length + tasks.filter((t) => t.isOneThing).length;

  return (
    <div
      className={cx(
        'flex min-h-[13rem] flex-col rounded-card border p-3 transition-colors duration-300 ease-calm',
        isToday
          ? 'border-forest-300 bg-paper-50 dark:border-forest-500/60 dark:bg-ink-800'
          : 'border-paper-300/70 dark:border-ink-600/60',
      )}
    >
      <header className="mb-3 flex items-baseline justify-between gap-2">
        <div>
          <p
            className={cx(
              'text-[0.72rem] uppercase tracking-[0.12em]',
              isToday ? 'text-forest-600 dark:text-forest-300' : 'text-ink-300',
            )}
          >
            {weekdayShort(date)}
          </p>
          <p className="display text-[1.05rem] text-ink-700 dark:text-paper-100">
            {formatShort(date)}
          </p>
        </div>
      </header>

      <div className="flex-1 space-y-1.5">
        {events.map((e) => (
          <EventChip key={e.id} event={e} onEdit={() => setEditing(e)} />
        ))}
        {tasks.map((t) => (
          <p
            key={t.id}
            className={cx(
              'rounded-[3px] px-2 py-1 text-[0.78rem] leading-snug',
              t.done
                ? 'text-ink-300 line-through dark:text-paper-200/35'
                : 'text-ink-500 dark:text-paper-200/70',
            )}
          >
            {t.isOneThing && <span className="mr-1 text-forest-500">·</span>}
            {t.title}
          </p>
        ))}
        {events.length === 0 && tasks.length === 0 && (
          <p className="px-2 py-1 text-[0.78rem] text-ink-300 dark:text-paper-200/35">
            frei
          </p>
        )}
      </div>

      <footer className="mt-3 flex items-center justify-between gap-2 border-t rule pt-2">
        <CapacityMark count={demanding} />
        <button
          type="button"
          onClick={() => setAdding(true)}
          aria-label={`Eintrag am ${formatShort(date)} hinzufügen`}
          className="rounded px-1 text-[0.95rem] leading-none text-ink-300 transition-colors hover:text-forest-600 dark:hover:text-forest-300"
        >
          +
        </button>
      </footer>

      <EventModal open={adding} date={date} onClose={() => setAdding(false)} />
      <EventModal
        open={editing !== null}
        date={date}
        event={editing ?? undefined}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}

function EventChip({
  event,
  onEdit,
}: {
  event: CalendarEvent;
  onEdit: () => void;
}) {
  const { update } = useStore();
  const time = [event.start, event.end].filter(Boolean).join('–');

  return (
    <div
      className={cx(
        'group relative rounded-[3px] border-l-2 bg-paper-100/70 dark:bg-ink-900/40',
        EVENT_COLOR[event.kind],
      )}
    >
      <button
        type="button"
        onClick={onEdit}
        title="Bearbeiten"
        className="block w-full py-1 pl-2 pr-6 text-left"
      >
        <span className="block text-[0.8rem] leading-snug text-ink-600 dark:text-paper-200/85">
          {event.title}
        </span>
        <span className="block text-[0.7rem] text-ink-300 dark:text-paper-200/45">
          {[time, EVENT_KIND[event.kind]].filter(Boolean).join(' · ')}
          {event.demanding && ' · anspruchsvoll'}
        </span>
      </button>
      <DeleteButton
        label="Termin entfernen"
        className="absolute right-0.5 top-0.5"
        onDelete={() =>
          update((s) => ({ ...s, events: s.events.filter((e) => e.id !== event.id) }))
        }
      />
    </div>
  );
}

type ReviewKey = 'finished' | 'energy' | 'distraction' | 'people' | 'waiting';

const REVIEW_FIELDS: { key: ReviewKey; q: string }[] = [
  { key: 'finished', q: 'Was habe ich beendet?' },
  { key: 'energy', q: 'Was hat mir Energie gegeben?' },
  { key: 'distraction', q: 'Wo bin ich wieder in Zerstreuung geraten?' },
  { key: 'people', q: 'Wem möchte ich mich nächste Woche zuwenden?' },
  { key: 'waiting', q: 'Was darf bewusst warten?' },
];

/** Skala 1–10, ohne Wertung: nur, wie die Woche sich angefühlt hat. */
function ScoreScale({
  value,
  onChange,
}: {
  value?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} von 10`}
            aria-pressed={value === n}
            onClick={() => onChange(n)}
            className={cx(
              'h-9 w-9 rounded-full border text-[0.85rem] tabular-nums transition-colors duration-200 ease-calm',
              value === n
                ? 'border-forest-500 bg-forest-500 text-paper-50 dark:border-forest-300 dark:bg-forest-300 dark:text-ink-800'
                : 'border-paper-300 text-ink-400 hover:border-ink-300 dark:border-ink-600 dark:text-paper-200/70 dark:hover:border-ink-500',
            )}
          >
            {n}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[0.78rem] text-ink-300 dark:text-paper-200/45">
        1 = zäh und zerstreut · 10 = klar und getragen. Es gibt keinen richtigen Wert.
      </p>
    </div>
  );
}

function WeekReviewPanel({ weekStart }: { weekStart: string }) {
  const { state, update } = useStore();
  const review = state.weekReviews.find((r) => r.weekStart === weekStart);
  const saved = Boolean(review?.savedAt);

  const patch = (patchValue: Partial<WeekReview>) =>
    update((s) => {
      const existing = s.weekReviews.find((r) => r.weekStart === weekStart);
      if (existing) {
        return {
          ...s,
          weekReviews: s.weekReviews.map((r) =>
            r.weekStart === weekStart ? { ...r, ...patchValue } : r,
          ),
        };
      }
      return {
        ...s,
        weekReviews: [
          ...s.weekReviews,
          {
            id: newId('wr'),
            weekStart,
            focus: '',
            finished: '',
            energy: '',
            distraction: '',
            people: '',
            waiting: '',
            createdAt: new Date().toISOString(),
            ...patchValue,
          },
        ],
      };
    });

  return (
    <Card>
      <SectionTitle
        right={
          saved ? (
            <Pill tone="forest">abgeschlossen</Pill>
          ) : (
            <span className="text-[0.78rem] text-ink-300">offen</span>
          )
        }
      >
        Wochenreview
      </SectionTitle>
      <p className="mb-6 text-[0.88rem] leading-relaxed text-ink-300 dark:text-paper-200/50">
        Fünf Fragen, in Ruhe beantwortet. Es gibt keine falschen Antworten und keine Punkte.
      </p>

      <div className="space-y-5">
        {REVIEW_FIELDS.map(({ key, q }, i) => (
          <div key={key} className="border-b rule pb-5">
            <div className="mb-1 flex items-baseline gap-3">
              <span className="text-[0.72rem] tabular-nums text-ink-300">{i + 1}</span>
              <p className="display text-[1.05rem] text-ink-700 dark:text-paper-100">{q}</p>
            </div>
            <div className="-mx-2 pl-6">
              <InlineEdit
                value={review?.[key] ?? ''}
                onSave={(v) => patch({ [key]: v } as Partial<WeekReview>)}
                placeholder="…"
                displayClassName="text-[0.93rem] leading-relaxed"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <p className="label mb-3">Wie war die Woche insgesamt?</p>
        <ScoreScale value={review?.score} onChange={(v) => patch({ score: v })} />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t rule pt-5">
        <p className="text-[0.83rem] text-ink-300 dark:text-paper-200/45">
          {saved
            ? 'Diese Woche liegt im Archiv und zählt im Verlauf.'
            : 'Abschließen legt die Review ins Archiv und trägt sie in den Verlauf ein.'}
        </p>
        {saved ? (
          <button
            type="button"
            onClick={() => patch({ savedAt: undefined })}
            className="btn-quiet"
          >
            Wieder öffnen
          </button>
        ) : (
          <button
            type="button"
            onClick={() => patch({ savedAt: new Date().toISOString() })}
            disabled={!review?.score}
            title={!review?.score ? 'Bitte zuerst die Woche einschätzen.' : undefined}
            className="btn-solid"
          >
            Woche abschließen
          </button>
        )}
      </div>
    </Card>
  );
}

function WeekTrendPanel() {
  const { state } = useStore();
  const saved = state.weekReviews.filter((r) => r.savedAt);
  return (
    <Card>
      <SectionTitle>Verlauf</SectionTitle>
      <WeekTrend reviews={saved} />
    </Card>
  );
}

export function Week() {
  const { state, update } = useStore();
  const [offset, setOffset] = useState(0);
  const weekStart = useMemo(
    () => startOfWeek(addDays(today(), offset * 7)),
    [offset],
  );
  const days = weekDays(weekStart);
  const focus = state.weekFocus[weekStart] ?? '';

  const demandingTotal = days.reduce((acc, d) => {
    const ev = state.events.filter((e) => e.date === d && e.demanding).length;
    const one = state.tasks.filter((t) => t.date === d && t.isOneThing).length;
    return acc + ev + one;
  }, 0);

  return (
    <div>
      <PageHeader
        eyebrow={`${formatShort(weekStart)} – ${formatShort(addDays(weekStart, 6))}`}
        title="Woche"
        lead="Eine Woche trägt etwa fünfzehn anspruchsvolle Stunden. Alles darüber geht auf Kosten von etwas anderem."
        aside={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOffset((o) => o - 1)}
              className="btn-quiet"
              aria-label="Vorige Woche"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => setOffset(0)}
              className={cx('btn-quiet', offset === 0 && 'opacity-40')}
              disabled={offset === 0}
            >
              Diese Woche
            </button>
            <button
              type="button"
              onClick={() => setOffset((o) => o + 1)}
              className="btn-quiet"
              aria-label="Nächste Woche"
            >
              →
            </button>
          </div>
        }
      />

      <Card className="mb-8 border-l-2 border-l-forest-500 dark:border-l-forest-300">
        <p className="label mb-2">Wochenfokus — eine Sache, die wirklich zählt</p>
        <InlineEdit
          value={focus}
          onSave={(v) =>
            update((s) => ({ ...s, weekFocus: { ...s.weekFocus, [weekStart]: v } }))
          }
          placeholder="Wenn diese Woche nur eine Sache gelingt, dann …"
          displayClassName="display text-xl leading-snug sm:text-2xl"
          className="-mx-2"
        />
      </Card>

      <section className="mb-10">
        <SectionTitle
          right={
            <span className="flex items-center gap-3 text-[0.78rem] text-ink-300">
              {demandingTotal} anspruchsvolle Blöcke
            </span>
          }
        >
          Kalender
        </SectionTitle>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {days.map((d) => (
            <DayColumn key={d} date={d} />
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          {(Object.keys(EVENT_KIND) as EventKind[]).map((k) => (
            <span key={k} className="flex items-center gap-2 text-[0.75rem] text-ink-300">
              <span className={cx('h-3 w-0.5 border-l-2', EVENT_COLOR[k])} />
              {EVENT_KIND[k]}
            </span>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <SectionTitle>Kapazität</SectionTitle>
        <Card>
          <p className="mb-5 text-[0.9rem] leading-relaxed text-ink-400 dark:text-paper-200/60">
            Höchstens drei anspruchsvolle Prioritäten pro Tag. Was darüber liegt, ist keine
            Planung mehr, sondern eine Hoffnung.
          </p>
          <ul className="space-y-3">
            {days.map((d) => {
              const count =
                state.events.filter((e) => e.date === d && e.demanding).length +
                state.tasks.filter((t) => t.date === d && t.isOneThing).length;
              return (
                <li key={d} className="flex items-center justify-between gap-4">
                  <span className="w-28 shrink-0 text-[0.86rem] text-ink-400 dark:text-paper-200/60">
                    {weekdayShort(d)}, {formatShort(d)}
                  </span>
                  <div className="flex-1">
                    <CapacityMark count={count} />
                  </div>
                  {count > DEMANDING_LIMIT && <Pill tone="wine">zu voll</Pill>}
                </li>
              );
            })}
          </ul>
        </Card>
      </section>

      <div className="space-y-4">
        <WeekReviewPanel weekStart={weekStart} />
        <WeekTrendPanel />
      </div>

      {state.events.length === 0 && (
        <div className="mt-8">
          <Empty
            title="Die Woche ist noch unbeschrieben"
            text="Trage zuerst das ein, was ohnehin feststeht — Vorlesungen, Training, Verabredungen. Der Rest findet dann seinen Platz."
          />
        </div>
      )}
    </div>
  );
}
