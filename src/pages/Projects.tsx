import { useMemo, useState } from 'react';
import { useStore } from '../store/store';
import {
  ACTIVE_PROJECT_LIMIT,
  addInbox,
  addProject,
  addTask,
  newId,
  patchInbox,
  patchProject,
  removeInbox,
  removeProject,
} from '../store/actions';
import type { AreaKey, InboxItem, Project, ProjectStatus } from '../types';
import { INBOX_KIND, PROJECT_STATUS, PROJECT_STATUS_ORDER, options } from '../lib/labels';
import {
  AutoTextarea,
  Card,
  Empty,
  InlineEdit,
  Modal,
  PageHeader,
  Pill,
  QuickAdd,
  SectionTitle,
  Select,
  TextField,
  cx,
} from '../components/ui';
import { today } from '../lib/date';

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
        <button
          type="button"
          onClick={() => setSorting((v) => !v)}
          className="shrink-0 text-[0.78rem] text-ink-300 underline-offset-2 hover:text-ink-500 hover:underline dark:hover:text-paper-100"
        >
          {sorting ? 'schließen' : 'sortieren'}
        </button>
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

function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const { state, update } = useStore();
  const area = state.areas.find((a) => a.id === project.areaId);

  return (
    <li
      className={cx(
        'card p-5 transition-colors duration-300 ease-calm sm:p-6',
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
        </div>
      </div>

      {project.why && (
        <p className="mt-2 text-[0.88rem] leading-relaxed text-ink-400 dark:text-paper-200/60">
          {project.why}
        </p>
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

        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            label="Bereich"
            value={project.areaId}
            onChange={(v) => patch({ areaId: v as AreaKey })}
            options={state.areas.map((a) => ({ value: a.id, label: a.title }))}
          />
          <Select
            label="Status"
            value={project.status}
            onChange={(v) => patch({ status: v as ProjectStatus })}
            options={options(PROJECT_STATUS)}
          />
          <TextField
            label="Zeitrahmen"
            value={project.timeframe}
            placeholder="z. B. diese Saison"
            onChange={(e) => patch({ timeframe: e.target.value })}
          />
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
  const overLimit = activeCount > ACTIVE_PROJECT_LIMIT;

  return (
    <div>
      <PageHeader
        eyebrow="Inbox & Vorhaben"
        title="Projekte"
        lead="Höchstens fünf aktive Projekte. Alles andere darf ruhen, ohne verloren zu gehen."
        aside={
          <div className="text-right">
            <p className="display text-3xl text-ink-700 dark:text-paper-100">
              {activeCount}
              <span className="text-ink-300"> / {ACTIVE_PROJECT_LIMIT}</span>
            </p>
            <p className="mt-1 text-[0.78rem] text-ink-300">aktiv</p>
          </div>
        }
      />

      {overLimit && (
        <p className="mb-8 rounded-card border-l-2 border-l-brass-500 bg-paper-50 px-4 py-3 text-[0.88rem] leading-relaxed text-ink-500 dark:border-l-brass-300 dark:bg-ink-800 dark:text-paper-200/75">
          Mehr als fünf aktive Projekte. Das ist kein Fehler — aber vielleicht darf eines
          eine Weile pausieren.
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
