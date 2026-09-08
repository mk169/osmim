import { useMemo, useState } from 'react';
import { useStore } from '../store/store';
import {
  DAY_TASK_LIMIT,
  addInbox,
  addTask,
  dayTaskCount,
  laneTasks,
  removeTask,
  setOneThing,
  toggleTask,
} from '../store/actions';
import type { AttentionCheck, TaskLane } from '../types';
import { LANE } from '../lib/labels';
import {
  Card,
  Checkbox,
  Empty,
  InlineEdit,
  Modal,
  Pill,
  QuickAdd,
  cx,
} from '../components/ui';
import { daypart, daypartLabel, formatLong, greeting, today } from '../lib/date';
import { navigate } from '../lib/router';

const ATTENTION: { key: keyof AttentionCheck; label: string }[] = [
  { key: 'morningNoFeed', label: 'Morgen ohne Feed' },
  { key: 'focusBlock', label: 'Fokusblock erledigt' },
  { key: 'movement', label: 'Bewegung erledigt' },
  { key: 'noDoomscroll', label: 'Kein Doomscrolling' },
  { key: 'eveningNoFeed', label: 'Abend ohne Feed' },
];

const LANE_ORDER: TaskLane[] = ['duty', 'body', 'mind'];

function LaneCard({ lane, date }: { lane: TaskLane; date: string }) {
  const { state, update } = useStore();
  const tasks = laneTasks(state, date, lane);
  const count = dayTaskCount(state, date);
  const full = count >= DAY_TASK_LIMIT;

  return (
    <Card className="flex flex-col">
      <header className="mb-4">
        <h3 className="display text-lg text-ink-700 dark:text-paper-100">
          {LANE[lane].title}
        </h3>
        <p className="mt-0.5 text-[0.78rem] text-ink-300 dark:text-paper-200/45">
          {LANE[lane].sub}
        </p>
      </header>

      <div className="-mx-2 flex-1 space-y-0.5">
        {tasks.length === 0 && (
          <p className="px-2 py-2 text-[0.88rem] text-ink-300 dark:text-paper-200/40">
            Heute nichts vorgesehen — das darf so sein.
          </p>
        )}
        {tasks.map((t) => (
          <div key={t.id} className="group relative">
            <Checkbox
              checked={t.done}
              onChange={() => update((s) => toggleTask(s, t.id))}
              label={t.title}
              hint={t.note}
            />
            <button
              type="button"
              aria-label="Vom Tag nehmen"
              onClick={() => update((s) => removeTask(s, t.id))}
              className="absolute right-1 top-2 rounded p-1 text-ink-300 opacity-0 transition-opacity duration-200 hover:text-wine-500 focus-visible:opacity-100 group-hover:opacity-100"
            >
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5">
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t rule pt-3">
        {full ? (
          <p className="text-[0.78rem] leading-relaxed text-ink-300 dark:text-paper-200/45">
            Drei Aufgaben genügen für heute.{' '}
            <button
              type="button"
              onClick={() => navigate('projekte')}
              className="underline decoration-paper-400 underline-offset-2 hover:text-ink-500 dark:hover:text-paper-100"
            >
              Weiteres in die Inbox
            </button>
            .
          </p>
        ) : (
          <QuickAdd
            placeholder="Eine Sache …"
            buttonLabel="+"
            onAdd={(title) =>
              update((s) => addTask(s, { title, lane, date, areaId: undefined }))
            }
          />
        )}
      </div>
    </Card>
  );
}

function OneThing({ date }: { date: string }) {
  const { state, update } = useStore();
  const [picking, setPicking] = useState(false);
  const one = state.tasks.find((t) => t.date === date && t.isOneThing);

  const candidates = useMemo(
    () =>
      state.tasks
        .filter((t) => !t.done && !t.isOneThing)
        .slice(0, 24),
    [state.tasks],
  );

  return (
    <Card className="relative overflow-hidden border-l-2 border-l-forest-500 dark:border-l-forest-300">
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="label">Das eine Wichtige</p>
        {one && (
          <button
            type="button"
            onClick={() => setPicking(true)}
            className="text-[0.75rem] text-ink-300 underline-offset-2 hover:text-ink-500 hover:underline dark:hover:text-paper-100"
          >
            ändern
          </button>
        )}
      </div>

      {one ? (
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => update((s) => toggleTask(s, one.id))}
            aria-label={one.done ? 'Wieder öffnen' : 'Als erledigt markieren'}
            className={cx(
              'mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ease-calm',
              one.done
                ? 'border-forest-500 bg-forest-500 dark:border-forest-300 dark:bg-forest-300'
                : 'border-paper-400 hover:border-forest-500 dark:border-ink-500 dark:hover:border-forest-300',
            )}
          >
            {one.done && (
              <svg viewBox="0 0 12 12" className="h-3 w-3 text-paper-50 dark:text-ink-800">
                <path
                  d="M2.5 6.2 4.8 8.5 9.5 3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
          <p
            className={cx(
              'display text-2xl leading-snug transition-colors duration-500 ease-calm sm:text-[1.7rem]',
              one.done
                ? 'text-ink-300 dark:text-paper-200/40'
                : 'text-ink-700 dark:text-paper-100',
            )}
          >
            {one.title}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-[0.92rem] leading-relaxed text-ink-300 dark:text-paper-200/50">
            Wenn heute nur eine Sache gelingt — welche wäre es?
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setPicking(true)} className="btn-quiet">
              Aus dem Bestand wählen
            </button>
          </div>
          <QuickAdd
            placeholder="… oder hier benennen"
            buttonLabel="Setzen"
            onAdd={(title) =>
              update((s) => {
                const withTask = addTask(s, { title, date, lane: 'duty' });
                return setOneThing(withTask, withTask.tasks[0].id, date);
              })
            }
          />
        </div>
      )}

      <Modal
        open={picking}
        onClose={() => setPicking(false)}
        title="Was zählt heute wirklich?"
      >
        {candidates.length === 0 ? (
          <Empty
            title="Nichts offen"
            text="Es liegt gerade keine Aufgabe bereit. Vielleicht ist das die Nachricht des Tages."
          />
        ) : (
          <ul className="-mx-2 max-h-[50vh] space-y-0.5 overflow-y-auto">
            {candidates.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => {
                    update((s) => setOneThing(s, t.id, date));
                    setPicking(false);
                  }}
                  className="w-full rounded-card px-2 py-2 text-left text-[0.95rem] text-ink-600 transition-colors duration-200 hover:bg-paper-100 dark:text-paper-200/90 dark:hover:bg-ink-700/60"
                >
                  {t.title}
                  {t.lane && (
                    <span className="ml-2 text-[0.72rem] text-ink-300">
                      {LANE[t.lane].title}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </Card>
  );
}

function AttentionRow({ date }: { date: string }) {
  const { day, patchDay } = useStore();
  const entry = day(date);
  const kept = ATTENTION.filter((a) => entry.attention[a.key]).length;

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="label">Aufmerksamkeit</p>
        <p className="text-[0.75rem] text-ink-300 dark:text-paper-200/45">
          {kept === 0
            ? 'Ohne Wertung — nur ein Blick.'
            : `${kept} von ${ATTENTION.length} gehalten`}
        </p>
      </div>
      <div className="-mx-2 grid gap-0.5 sm:grid-cols-2 lg:grid-cols-3">
        {ATTENTION.map((a) => (
          <Checkbox
            key={a.key}
            size="sm"
            checked={entry.attention[a.key]}
            onChange={(v) =>
              patchDay(date, { attention: { ...entry.attention, [a.key]: v } })
            }
            label={a.label}
          />
        ))}
      </div>
    </Card>
  );
}

export function Today() {
  const { state, day, patchDay, update } = useStore();
  const date = today();
  const entry = day(date);
  const part = daypart();
  const evening = part === 'evening' || part === 'night';

  const dayEvents = state.events
    .filter((e) => e.date === date)
    .sort((a, b) => (a.start ?? '').localeCompare(b.start ?? ''));

  return (
    <div className="space-y-8">
      <header className="border-b rule pb-8">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <p className="label">{formatLong(date)}</p>
          <Pill tone="muted">{daypartLabel(part)}</Pill>
        </div>
        <h1 className="display text-4xl leading-[1.08] text-ink-700 dark:text-paper-100 sm:text-5xl">
          {greeting(part)}.
        </h1>
        <p className="mt-4 max-w-lg text-[0.98rem] leading-relaxed text-ink-400 dark:text-paper-200/65">
          {evening
            ? 'Der Tag darf jetzt zu Ende gehen. Nichts muss mehr bewiesen werden.'
            : 'Ein Tag, drei Karten, eine wichtige Sache. Mehr braucht es nicht.'}
        </p>
      </header>

      <Card>
        <p className="label mb-2">Wie will ich heute auftreten?</p>
        <InlineEdit
          value={entry.intention}
          onSave={(v) => patchDay(date, { intention: v })}
          placeholder="Ruhig, aufmerksam, freundlich — und pünktlich."
          displayClassName="display text-xl sm:text-2xl leading-snug"
          className="-mx-2"
        />
      </Card>

      <OneThing date={date} />

      <div className="grid gap-4 lg:grid-cols-3">
        {LANE_ORDER.map((lane) => (
          <LaneCard key={lane} lane={lane} date={date} />
        ))}
      </div>

      <AttentionRow date={date} />

      {dayEvents.length > 0 && (
        <Card>
          <p className="label mb-4">Heute im Kalender</p>
          <ul className="space-y-2.5">
            {dayEvents.map((e) => (
              <li key={e.id} className="flex items-baseline gap-4 text-[0.92rem]">
                <span className="w-20 shrink-0 tabular-nums text-ink-300 dark:text-paper-200/45">
                  {e.start ?? '—'}
                </span>
                <span className="text-ink-600 dark:text-paper-200/85">{e.title}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <p className="label mb-2">Was ist gerade in meinem Kopf?</p>
          <InlineEdit
            value={entry.mind}
            onSave={(v) => patchDay(date, { mind: v })}
            placeholder="Ein paar Zeilen, ungeordnet. Niemand liest mit."
            className="-mx-2 min-h-[5rem]"
          />
          {entry.mind.trim().length > 0 && (
            <button
              type="button"
              onClick={() => {
                update((s) => addInbox(s, entry.mind.trim(), 'note'));
                patchDay(date, { mind: '' });
              }}
              className="mt-3 text-[0.78rem] text-ink-300 underline-offset-2 hover:text-ink-500 hover:underline dark:hover:text-paper-100"
            >
              In die Inbox legen und den Kopf freimachen
            </button>
          )}
        </Card>

        <Card
          className={cx(
            'transition-colors duration-500 ease-calm',
            evening && 'border-brass-300/60 dark:border-brass-500/40',
          )}
        >
          <p className="label mb-2">Was war heute ein guter Moment?</p>
          <InlineEdit
            value={entry.goodMoment}
            onSave={(v) => patchDay(date, { goodMoment: v })}
            placeholder={
              evening
                ? 'Auch ein kleiner zählt. Das Licht am Nachmittag zum Beispiel.'
                : 'Später am Abend, in Ruhe.'
            }
            className="-mx-2 min-h-[5rem]"
          />
        </Card>
      </div>

      <p className="pb-4 pt-2 text-center text-[0.8rem] italic text-ink-300 dark:text-paper-200/35">
        Alles Weitere liegt gut aufgehoben in Inbox, Projekten und Bereichen.
      </p>
    </div>
  );
}
