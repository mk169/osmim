import { useMemo, useState } from 'react';
import { useStore } from '../store/store';
import {
  ACTIVE_PROJECT_LIMIT,
  PIPELINE_LIMIT,
  addInbox,
  addProject,
  addTask,
  newId,
  patchInbox,
  patchProject,
  removeInbox,
  removeProject,
  patchTask,
  removeTask,
  toggleTask,
} from '../store/actions';
import type { AreaKey, InboxItem, Project, ProjectStatus } from '../types';
import { INBOX_KIND, PROJECT_STATUS, PROJECT_STATUS_ORDER, options } from '../lib/labels';
import {
  AutoTextarea,
  Card,
  Checkbox,
  DeleteButton,
  Empty,
  InlineEdit,
  Modal,
  PageHeader,
  Pill,
  QuickAdd,
  QuietLine,
  SectionTitle,
  Select,
  TextField,
  cx,
} from '../components/ui';
import { startOfWeek, today, weekDays } from '../lib/date';
import { navigate } from '../lib/router';

/* ---------------------------------------------------------------- Inbox */

function InboxRow({ item }: { item: InboxItem }) {
  const { state, update } = useStore();
  const [sorting, setSorting] = useState(false);

  return (
    <li className="group border-b rule py-3 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[0.94rem] leading-relaxed text-ink-600 dark:text-paper-200/85">
            {item.text}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <Pill tone="muted">{INBOX_KIND[item.kind]}</Pill>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setSorting((v) => !v)}
            className="text-[0.78rem] text-ink-300 underline-offset-2 hover:text-ink-500 hover:underline dark:hover:text-paper-100"
          >
            {sorting ? 'schließen' : 'sortieren'}
          </button>
          <DeleteButton
            label="Aus der Inbox löschen"
            onDelete={() => update((s) => removeInbox(s, item.id))}
          />
        </div>
      </div>

      {sorting && (
        <div className="mt-3 space-y-3 rounded-card bg-paper-100/60 p-4 dark:bg-ink-900/40">
          <p className="text-[0.8rem] text-ink-300 dark:text-paper-200/45">
            Löschen, archivieren, einem Bereich zuordnen — oder ein Projekt daraus machen.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => update((s) => removeInbox(s, item.id))}
              className="btn-quiet"
            >
              Löschen
            </button>
            <button
              type="button"
              onClick={() => update((s) => patchInbox(s, item.id, { state: 'archived' }))}
              className="btn-quiet"
            >
              Archivieren
            </button>
            <button
              type="button"
              onClick={() =>
                update((s) => {
                  const withTask = addTask(s, {
                    title: item.text,
                    date: today(),
                    lane: 'duty',
                  });
                  return removeInbox(withTask, item.id);
                })
              }
              className="btn-quiet"
            >
              Für heute übernehmen
            </button>
            <button
              type="button"
              onClick={() =>
                update((s) => {
                  const withProject = addProject(s, {
                    title: item.text,
                    status: 'idea',
                    why: '',
                  });
                  return removeInbox(withProject, item.id);
                })
              }
              className="btn-quiet"
            >
              Projekt daraus machen
            </button>
          </div>
          <Select
            label="Einem Bereich zuordnen"
            value=""
            onChange={(v) => {
              if (!v) return;
              update((s) => {
                const withGoal = {
                  ...s,
                  goals: [
                    ...s.goals,
                    {
                      id: newId('goal'),
                      title: item.text,
                      areaId: v as AreaKey,
                      horizon: 'horizon' as const,
                      status: 'open' as const,
                      progress: 0,
                      createdAt: new Date().toISOString(),
                    },
                  ],
                };
                return removeInbox(withGoal, item.id);
              });
            }}
            options={[
              { value: '', label: 'Bereich wählen …' },
              ...state.areas.map((a) => ({ value: a.id, label: a.title })),
            ]}
            className="max-w-xs"
          />
        </div>
      )}
    </li>
  );
}

function InboxPanel() {
  const { state, update } = useStore();
  const open = state.inbox.filter((i) => i.state === 'open');
  const [review, setReview] = useState(false);

  return (
    <Card className="mb-10">
      <SectionTitle
        right={
          <button
            type="button"
            onClick={() => setReview((v) => !v)}
            className="text-[0.8rem] text-ink-300 underline-offset-2 hover:text-ink-500 hover:underline dark:hover:text-paper-100"
          >
            {review ? 'Review beenden' : 'Wöchentliche Review'}
          </button>
        }
      >
        Inbox
      </SectionTitle>

      <p className="mb-5 text-[0.88rem] leading-relaxed text-ink-300 dark:text-paper-200/50">
        Jedes neue Ziel, jede Idee, jede Sorge landet zuerst hier. Sortiert wird später.
      </p>

      <div className="mb-5">
        <QuickAdd
          placeholder="Was liegt an oder geht dir durch den Kopf?"
          onAdd={(text) => update((s) => addInbox(s, text, 'note'))}
        />
      </div>

      {review && (
        <div className="mb-5 rounded-card border-l-2 border-l-brass-500 bg-paper-100/60 p-4 dark:border-l-brass-300 dark:bg-ink-900/40">
          <p className="display mb-2 text-[1.05rem] text-ink-700 dark:text-paper-100">
            Wöchentliche Review
          </p>
          <p className="text-[0.88rem] leading-relaxed text-ink-400 dark:text-paper-200/60">
            Gehe die Liste einmal von oben nach unten durch. Zu jedem Eintrag genau eine
            Entscheidung: löschen, archivieren, abgeben oder einem Bereich zuordnen.
            Was du drei Wochen lang nicht anfasst, darf gehen.
          </p>
        </div>
      )}

      {open.length === 0 ? (
        <Empty
          title="Die Inbox ist leer"
          text="Selten und schön. Der Kopf darf gerade frei sein."
        />
      ) : (
        <ul>
          {open.map((i) => (
            <InboxRow key={i.id} item={i} />
          ))}
        </ul>
      )}

      <p className="mt-6 border-t rule pt-4 text-center text-[0.85rem] italic text-ink-300 dark:text-paper-200/45">
        Eine gute Idee muss nicht sofort ein Projekt werden.
      </p>
    </Card>
  );
}

/* -------------------------------------------------------------- Projekte */

function Rating({ project }: { project: Project }) {
  const { update } = useStore();
  const keys: { key: keyof Project['rating']; label: string }[] = [
    { key: 'meaning', label: 'Bedeutung' },
    { key: 'energy', label: 'Energie' },
    { key: 'learning', label: 'Lernwert' },
    { key: 'feasibility', label: 'Realisierbarkeit' },
  ];
  return (
    <div className="space-y-2">
      {keys.map(({ key, label }) => (
        <div key={key} className="flex items-center justify-between gap-4">
          <span className="text-[0.84rem] text-ink-400 dark:text-paper-200/60">{label}</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${label}: ${n}`}
                onClick={() =>
                  update((s) =>
                    patchProject(s, project.id, {
                      rating: { ...project.rating, [key]: n },
                    }),
                  )
                }
                className={cx(
                  'h-1.5 w-5 rounded-full transition-colors duration-300 ease-calm',
                  project.rating[key] >= n
                    ? 'bg-brass-500 dark:bg-brass-300'
                    : 'bg-paper-300 hover:bg-paper-400 dark:bg-ink-600',
                )}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Der Weg eines Projekts. „Pausiert" liegt bewusst neben der Reihe —
 * eine Pause ist kein Rückschritt, sondern eine Entscheidung.
 */
const FLOW: ProjectStatus[] = ['idea', 'exploring', 'active', 'done'];

/** Was eine Stufe bedeutet — und was sie voraussetzt. */
const STAGE: Record<
  ProjectStatus,
  { meaning: string; needs: (p: Project, activeCount: number) => string | null }
> = {
  idea: {
    meaning: 'Aufgeschrieben, mehr nicht. Darf ewig hier liegen.',
    needs: () => null,
  },
  exploring: {
    meaning: 'Du prüfst, ob es das wert ist — ohne dich schon zu binden.',
    needs: (p) => (p.why.trim() ? null : 'Es fehlt das Warum.'),
  },
  active: {
    meaning: 'Läuft. Es gibt ein Ergebnis, eine nächste Handlung und einen Platz unter den fünf.',
    needs: (p, activeCount) => {
      if (!p.outcome.trim()) return 'Es fehlt das gewünschte Ergebnis.';
      if (!p.nextAction.trim()) return 'Es fehlt die nächste physische Handlung.';
      if (p.status !== 'active' && activeCount >= ACTIVE_PROJECT_LIMIT)
        return `Fünf Projekte laufen bereits. Pausiere eines, um Platz zu machen.`;
      return null;
    },
  },
  paused: {
    meaning: 'Bewusst zur Seite gelegt. Kein Rückschritt.',
    needs: () => null,
  },
  done: {
    meaning: 'Abgeschlossen und im Archiv.',
    needs: (p) => (p.outcome.trim() ? null : 'Ohne Ergebnis lässt sich nichts abschließen.'),
  },
};

function Workflow({ project }: { project: Project }) {
  const { state, update } = useStore();
  const paused = project.status === 'paused';
  const currentIndex = FLOW.indexOf(project.status);
  const activeCount = state.projects.filter((p) => p.status === 'active').length;

  const setStatus = (status: ProjectStatus) =>
    update((s) =>
      patchProject(s, project.id, {
        status,
        archivedAt: status === 'done' ? new Date().toISOString() : undefined,
      }),
    );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-1 gap-y-2">
        {FLOW.map((step, i) => {
          const reached = !paused && currentIndex >= i;
          const isCurrent = !paused && currentIndex === i;
          const blocker = STAGE[step].needs(project, activeCount);
          return (
            <div key={step} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => !blocker && setStatus(step)}
                disabled={Boolean(blocker) && !isCurrent}
                aria-current={isCurrent ? 'step' : undefined}
                title={blocker ?? STAGE[step].meaning}
                className={cx(
                  'rounded-full border px-3 py-1 text-[0.8rem] transition-colors duration-200 ease-calm',
                  isCurrent
                    ? 'border-forest-500 bg-forest-500 text-paper-50 dark:border-forest-300 dark:bg-forest-300 dark:text-ink-800'
                    : reached
                      ? 'border-forest-300 text-forest-600 dark:border-forest-500 dark:text-forest-300'
                      : blocker
                        ? 'border-paper-300/60 text-ink-300/60 dark:border-ink-700 dark:text-paper-200/25'
                        : 'border-paper-300 text-ink-300 hover:border-ink-300 hover:text-ink-500 dark:border-ink-600 dark:hover:border-ink-500 dark:hover:text-paper-200/80',
                )}
              >
                {PROJECT_STATUS[step]}
              </button>
              {i < FLOW.length - 1 && (
                <span
                  aria-hidden
                  className={cx(
                    'h-px w-4',
                    reached && currentIndex > i
                      ? 'bg-forest-300 dark:bg-forest-500'
                      : 'bg-paper-300 dark:bg-ink-600',
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[0.84rem] leading-relaxed text-ink-400 dark:text-paper-200/60">
        {STAGE[project.status].meaning}
      </p>

      {(() => {
        const next = FLOW[currentIndex + 1];
        if (paused || !next) return null;
        const blocker = STAGE[next].needs(project, activeCount);
        return (
          <p className="mt-1 text-[0.82rem] text-ink-300 dark:text-paper-200/45">
            {blocker
              ? `Für „${PROJECT_STATUS[next]}“: ${blocker}`
              : `Bereit für „${PROJECT_STATUS[next]}“.`}
          </p>
        );
      })()}

      <button
        type="button"
        onClick={() => setStatus(paused ? 'exploring' : 'paused')}
        className={cx(
          'mt-3 text-[0.78rem] underline-offset-2 hover:underline',
          paused
            ? 'text-brass-500 dark:text-brass-300'
            : 'text-ink-300 hover:text-ink-500 dark:hover:text-paper-100',
        )}
      >
        {paused ? 'Pausiert — wieder aufnehmen' : 'Projekt pausieren'}
      </button>
    </div>
  );
}

/** Wo dieses Projekt im Tag, in der Woche und in der Saison auftaucht. */
function ProjectLinks({ project }: { project: Project }) {
  const { state } = useStore();
  const t = today();
  const week = weekDays(startOfWeek(t));
  const tasks = state.tasks.filter((x) => x.projectId === project.id);
  const area = state.areas.find((a) => a.id === project.areaId);
  const seasonGoals = state.goals.filter(
    (g) => g.areaId === project.areaId && g.horizon === 'season',
  );

  const rows: { label: string; value: string; to: 'heute' | 'woche' | 'saison' }[] = [
    {
      label: 'Heute',
      value: `${tasks.filter((x) => x.date === t).length} Aufgaben eingeplant`,
      to: 'heute',
    },
    {
      label: 'Diese Woche',
      value: `${tasks.filter((x) => x.date && week.includes(x.date)).length} Aufgaben verteilt`,
      to: 'woche',
    },
    {
      label: 'Saison',
      value: seasonGoals.length
        ? `${seasonGoals.length} Ziele in ${area?.title ?? 'diesem Bereich'}`
        : 'kein Saisonziel im Bereich',
      to: 'saison',
    },
  ];

  return (
    <ul className="divide-y rule">
      {rows.map((r) => (
        <li key={r.label} className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
          <span className="text-[0.88rem] text-ink-600 dark:text-paper-200/85">{r.label}</span>
          <span className="flex items-center gap-4">
            <span className="text-[0.83rem] text-ink-300 dark:text-paper-200/45">{r.value}</span>
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
  );
}

/** Aufgaben, die zu genau diesem Projekt gehören. */
function ProjectTasks({ project }: { project: Project }) {
  const { state, update } = useStore();
  const tasks = state.tasks.filter((t) => t.projectId === project.id);
  const done = tasks.filter((t) => t.done).length;

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <p className="label">Aufgaben</p>
        {tasks.length > 0 && (
          <span className="text-[0.78rem] tabular-nums text-ink-300">
            {done} von {tasks.length}
          </span>
        )}
      </div>

      {tasks.length > 0 && (
        <div className="mb-3">
          <QuietLine value={tasks.length ? (done / tasks.length) * 100 : 0} />
        </div>
      )}

      {tasks.length === 0 ? (
        <p className="mb-3 text-[0.88rem] text-ink-300 dark:text-paper-200/45">
          Noch keine Aufgabe. Die erste ist meist die kleinste.
        </p>
      ) : (
        <ul className="-mx-2 mb-3 space-y-0.5">
          {tasks.map((t) => (
            <li key={t.id} className="group relative">
              <Checkbox
                checked={t.done}
                onChange={() => update((s) => toggleTask(s, t.id))}
                label={t.title}
                hint={t.date ? 'für heute eingeplant' : undefined}
              />
              <div className="absolute right-1 top-1.5 flex items-center gap-1">
                {!t.date && !t.done && (
                  <button
                    type="button"
                    onClick={() =>
                      update((s) =>
                        patchTask(s, t.id, { date: today(), lane: t.lane ?? 'duty' }),
                      )
                    }
                    className="rounded px-1.5 py-0.5 text-[0.72rem] text-ink-300 opacity-0 transition-opacity hover:text-forest-600 group-hover:opacity-100 dark:hover:text-forest-300"
                  >
                    heute
                  </button>
                )}
                <DeleteButton
                  label="Aufgabe entfernen"
                  onDelete={() => update((s) => removeTask(s, t.id))}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <QuickAdd
        placeholder="Aufgabe für dieses Projekt …"
        buttonLabel="+"
        onAdd={(title) =>
          update((s) =>
            addTask(s, { title, projectId: project.id, areaId: project.areaId, lane: 'duty' }),
          )
        }
      />
    </div>
  );
}

function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const { state, update } = useStore();
  const area = state.areas.find((a) => a.id === project.areaId);
  const tasks = state.tasks.filter((t) => t.projectId === project.id);
  const doneTasks = tasks.filter((t) => t.done).length;

  return (
    <li
      className={cx(
        'card group p-5 transition-colors duration-300 ease-calm sm:p-6',
        project.status === 'active' && 'border-l-2 border-l-forest-500 dark:border-l-forest-300',
        project.status === 'paused' && 'opacity-70',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
          <h3 className="display text-lg leading-snug text-ink-700 hover:underline hover:decoration-paper-400 hover:underline-offset-4 dark:text-paper-100">
            {project.title}
          </h3>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          {area && <Pill tone="muted">{area.letter}</Pill>}
          <Select
            value={project.status}
            onChange={(v) =>
              update((s) =>
                patchProject(s, project.id, {
                  status: v as ProjectStatus,
                  archivedAt: v === 'done' ? new Date().toISOString() : undefined,
                }),
              )
            }
            options={options(PROJECT_STATUS)}
            className="w-36 py-1 text-[0.78rem]"
          />
          <DeleteButton
            label={`Projekt „${project.title}“ löschen`}
            confirm={`„${project.title}“ löschen?`}
            onDelete={() => update((s) => removeProject(s, project.id))}
          />
        </div>
      </div>

      {project.why && (
        <p className="mt-2 text-[0.88rem] leading-relaxed text-ink-400 dark:text-paper-200/60">
          {project.why}
        </p>
      )}

      {tasks.length > 0 && (
        <div className="mt-4 flex items-center gap-3">
          <QuietLine value={(doneTasks / tasks.length) * 100} />
          <span className="shrink-0 text-[0.76rem] tabular-nums text-ink-300">
            {doneTasks}/{tasks.length} Aufgaben
          </span>
        </div>
      )}

      <div className="mt-4 border-t rule pt-3">
        <p className="label mb-1">Nächste physische Handlung</p>
        <div className="-mx-2">
          <InlineEdit
            value={project.nextAction}
            placeholder="Was genau würde ich als Erstes tun?"
            onSave={(v) => update((s) => patchProject(s, project.id, { nextAction: v }))}
            displayClassName="text-[0.92rem] text-forest-600 dark:text-forest-300"
          />
        </div>
        {project.nextAction && (
          <button
            type="button"
            onClick={() =>
              update((s) =>
                addTask(s, {
                  title: project.nextAction,
                  projectId: project.id,
                  areaId: project.areaId,
                  lane: 'duty',
                  date: today(),
                }),
              )
            }
            className="mt-2 text-[0.76rem] text-ink-300 underline-offset-2 hover:text-ink-500 hover:underline dark:hover:text-paper-100"
          >
            für heute übernehmen
          </button>
        )}
      </div>
    </li>
  );
}

function ProjectModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { state, update } = useStore();
  const project = state.projects.find((p) => p.id === id);
  if (!project) return null;

  const patch = (p: Partial<Project>) => update((s) => patchProject(s, project.id, p));

  return (
    <Modal open onClose={onClose} title={project.title} wide>
      <div className="space-y-5">
        <TextField
          label="Titel"
          value={project.title}
          onChange={(e) => patch({ title: e.target.value })}
        />
        <AutoTextarea
          label="Warum"
          value={project.why}
          placeholder="Warum ist das wichtig genug, um Platz einzunehmen?"
          onChange={(e) => patch({ why: e.target.value })}
        />
        <AutoTextarea
          label="Gewünschtes Ergebnis"
          value={project.outcome}
          placeholder="Woran erkenne ich, dass es fertig ist?"
          onChange={(e) => patch({ outcome: e.target.value })}
        />
        <AutoTextarea
          label="Nächste physische Handlung"
          value={project.nextAction}
          placeholder="Etwas, das man tatsächlich tun kann."
          onChange={(e) => patch({ nextAction: e.target.value })}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Bereich"
            value={project.areaId}
            onChange={(v) => patch({ areaId: v as AreaKey })}
            options={state.areas.map((a) => ({ value: a.id, label: a.title }))}
          />
          <TextField
            label="Zeitrahmen"
            value={project.timeframe}
            placeholder="z. B. diese Saison"
            onChange={(e) => patch({ timeframe: e.target.value })}
          />
        </div>

        <div className="border-t rule pt-5">
          <p className="label mb-3">Workflow</p>
          <Workflow project={project} />
        </div>

        <div className="border-t rule pt-5">
          <ProjectTasks project={project} />
        </div>

        <div className="border-t rule pt-5">
          <p className="label mb-3">Verbindungen</p>
          <ProjectLinks project={project} />
        </div>

        <div className="border-t rule pt-5">
          <p className="label mb-3">Bewertung</p>
          <Rating project={project} />
        </div>

        <div className="flex items-center justify-between border-t rule pt-5">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Projekt endgültig löschen?')) {
                update((s) => removeProject(s, project.id));
                onClose();
              }
            }}
            className="text-[0.8rem] text-ink-300 underline-offset-2 hover:text-wine-500 hover:underline"
          >
            Projekt löschen
          </button>
          <button type="button" onClick={onClose} className="btn-quiet">
            Schließen
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function Projects() {
  const { state, update } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<ProjectStatus, Project[]>();
    for (const status of PROJECT_STATUS_ORDER) {
      map.set(
        status,
        state.projects.filter((p) => p.status === status),
      );
    }
    return map;
  }, [state.projects]);

  const activeCount = grouped.get('active')?.length ?? 0;
  const pipelineCount = state.projects.filter(
    (p) => p.status !== 'active' && p.status !== 'done',
  ).length;
  const overLimit = activeCount > ACTIVE_PROJECT_LIMIT;
  const pipelineFull = pipelineCount > PIPELINE_LIMIT;

  return (
    <div>
      <PageHeader
        eyebrow="Inbox & Vorhaben"
        title="Projekte"
        lead="Fünf Projekte laufen parallel, zwanzig warten in der Pipeline. Die fünf sind die Arbeit — die zwanzig sind das, was du dafür gerade nicht tust."
        aside={
          <div className="flex gap-8 text-right">
            <div>
              <p className="display text-3xl text-ink-700 dark:text-paper-100">
                {activeCount}
                <span className="text-ink-300"> / {ACTIVE_PROJECT_LIMIT}</span>
              </p>
              <p className="mt-1 text-[0.78rem] text-ink-300">parallel</p>
            </div>
            <div>
              <p className="display text-3xl text-ink-400 dark:text-paper-200/60">
                {pipelineCount}
                <span className="text-ink-300"> / {PIPELINE_LIMIT}</span>
              </p>
              <p className="mt-1 text-[0.78rem] text-ink-300">Pipeline</p>
            </div>
          </div>
        }
      />

      {overLimit && (
        <p className="mb-4 rounded-card border-l-2 border-l-brass-500 bg-paper-50 px-4 py-3 text-[0.88rem] leading-relaxed text-ink-500 dark:border-l-brass-300 dark:bg-ink-800 dark:text-paper-200/75">
          Mehr als fünf Projekte laufen parallel. Das ist kein Fehler — aber die fünf
          verlieren an Kraft, sobald es sechs werden.
        </p>
      )}

      {pipelineFull && (
        <p className="mb-8 rounded-card border-l-2 border-l-wine-500 bg-paper-50 px-4 py-3 text-[0.88rem] leading-relaxed text-ink-500 dark:border-l-wine-300 dark:bg-ink-800 dark:text-paper-200/75">
          Die Pipeline führt {pipelineCount} Projekte. Zwanzig sind das ehrliche Maximum —
          darüber wird sie zum Friedhof. Was davon darf endgültig gehen?
        </p>
      )}

      <InboxPanel />

      <div className="mb-6">
        <QuickAdd
          placeholder="Neues Projekt …"
          buttonLabel="Anlegen"
          onAdd={(title) => update((s) => addProject(s, { title }))}
        />
      </div>

      <div className="space-y-10">
        {PROJECT_STATUS_ORDER.map((status) => {
          const list = grouped.get(status) ?? [];
          if (list.length === 0) return null;
          return (
            <section key={status}>
              <SectionTitle
                right={<span className="text-[0.78rem] text-ink-300">{list.length}</span>}
              >
                {PROJECT_STATUS[status]}
              </SectionTitle>
              <ul className="space-y-3">
                {list.map((p) => (
                  <ProjectCard key={p.id} project={p} onOpen={() => setOpenId(p.id)} />
                ))}
              </ul>
            </section>
          );
        })}

        {state.projects.length === 0 && (
          <Empty
            title="Noch keine Projekte"
            text="Ein Projekt ist etwas, das mehr als eine Handlung braucht und ein erkennbares Ende hat."
          />
        )}
      </div>

      <ProjectModal id={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}
