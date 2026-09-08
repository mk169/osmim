import { useState } from 'react';
import { useStore } from '../store/store';
import { newId } from '../store/actions';
import { LIBRARY_KIND, options } from '../lib/labels';
import type { LibraryKind, LivedMoment } from '../types';
import {
  Card,
  DeleteButton,
  Empty,
  PageHeader,
  Pill,
  QuickAdd,
  SectionTitle,
  Select,
  cx,
} from '../components/ui';
import { formatShort, monthLabel } from '../lib/date';

type Tab = 'projects' | 'reviews' | 'library' | 'lived';

const TABS: { id: Tab; label: string }[] = [
  { id: 'projects', label: 'Abgeschlossene Projekte' },
  { id: 'reviews', label: 'Rückblicke' },
  { id: 'library', label: 'Bibliothek' },
  { id: 'lived', label: 'Leben erlebt' },
];

const LIVED_KIND: Record<LivedMoment['kind'], string> = {
  travel: 'Reise',
  encounter: 'Begegnung',
  moment: 'Moment',
};

export function Archive() {
  const { state, update } = useStore();
  const [tab, setTab] = useState<Tab>('projects');
  const [kind, setKind] = useState<LibraryKind>('book');
  const [livedKind, setLivedKind] = useState<LivedMoment['kind']>('moment');

  const doneProjects = state.projects.filter((p) => p.status === 'done');

  return (
    <div>
      <PageHeader
        eyebrow="Was gewesen ist"
        title="Archiv"
        lead="Nicht alles muss vorwärts zeigen. Manches darf einfach aufbewahrt werden."
      />

      <nav className="mb-8 flex flex-wrap gap-x-6 gap-y-2 border-b rule pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cx(
              'relative pb-1 text-[0.92rem] transition-colors duration-200 ease-calm',
              tab === t.id
                ? 'text-ink-700 dark:text-paper-100'
                : 'text-ink-300 hover:text-ink-500 dark:hover:text-paper-200/80',
            )}
          >
            {t.label}
            {tab === t.id && (
              <span className="absolute -bottom-[13px] left-0 h-px w-full bg-forest-500 dark:bg-forest-300" />
            )}
          </button>
        ))}
      </nav>

      {tab === 'projects' &&
        (doneProjects.length === 0 ? (
          <Empty
            title="Noch nichts abgeschlossen"
            text="Wenn ein Projekt fertig ist, kommt es hierher — als Beweis, dass Dinge tatsächlich enden."
          />
        ) : (
          <ul className="space-y-3">
            {doneProjects.map((p) => (
              <li key={p.id} className="card group p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="display text-lg text-ink-700 dark:text-paper-100">{p.title}</h3>
                  <div className="flex items-center gap-2">
                    {p.archivedAt && (
                      <span className="text-[0.76rem] text-ink-300">
                        {formatShort(p.archivedAt.slice(0, 10))}
                      </span>
                    )}
                    <DeleteButton
                      label={`„${p.title}“ endgültig löschen`}
                      confirm={`„${p.title}“ endgültig aus dem Archiv löschen?`}
                      onDelete={() =>
                        update((s) => ({
                          ...s,
                          projects: s.projects.filter((x) => x.id !== p.id),
                        }))
                      }
                    />
                  </div>
                </div>
                {p.outcome && (
                  <p className="mt-1 text-[0.9rem] text-ink-400 dark:text-paper-200/60">
                    {p.outcome}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ))}

      {tab === 'reviews' && (
        <div className="space-y-10">
          <section>
            <SectionTitle>Wochenrückblicke</SectionTitle>
            {state.weekReviews.length === 0 ? (
              <Empty
                title="Noch kein Wochenrückblick"
                text="Sonntagabend, zehn Minuten, fünf Fragen. Mehr braucht es nicht."
              />
            ) : (
              <ul className="space-y-3">
                {[...state.weekReviews]
                  .sort((a, b) => b.weekStart.localeCompare(a.weekStart))
                  .map((r) => (
                    <li key={r.id} className="card group p-5">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <p className="label">Woche ab {formatShort(r.weekStart)}</p>
                        <DeleteButton
                          label="Rückblick entfernen"
                          confirm="Diesen Wochenrückblick löschen?"
                          onDelete={() =>
                            update((s) => ({
                              ...s,
                              weekReviews: s.weekReviews.filter((x) => x.id !== r.id),
                            }))
                          }
                        />
                      </div>
                      <dl className="space-y-2 text-[0.9rem]">
                        {[
                          ['Beendet', r.finished],
                          ['Energie', r.energy],
                          ['Zerstreuung', r.distraction],
                          ['Menschen', r.people],
                          ['Darf warten', r.waiting],
                        ]
                          .filter(([, v]) => v)
                          .map(([k, v]) => (
                            <div key={k} className="flex flex-wrap gap-x-3">
                              <dt className="w-28 shrink-0 text-ink-300">{k}</dt>
                              <dd className="min-w-0 flex-1 text-ink-500 dark:text-paper-200/75">
                                {v}
                              </dd>
                            </div>
                          ))}
                      </dl>
                    </li>
                  ))}
              </ul>
            )}
          </section>

          <section>
            <SectionTitle>Monatsreflexionen</SectionTitle>
            {state.monthReflections.length === 0 ? (
              <Empty
                title="Noch keine Monatsreflexion"
                text="Am Monatsende ein paar Absätze — später liest man sie gern."
              />
            ) : (
              <ul className="space-y-3">
                {[...state.monthReflections]
                  .sort((a, b) => b.month.localeCompare(a.month))
                  .map((m) => (
                    <li key={m.id} className="card group p-5">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <p className="label">{monthLabel(m.month)}</p>
                        <DeleteButton
                          label="Reflexion entfernen"
                          confirm="Diese Monatsreflexion löschen?"
                          onDelete={() =>
                            update((s) => ({
                              ...s,
                              monthReflections: s.monthReflections.filter(
                                (x) => x.id !== m.id,
                              ),
                            }))
                          }
                        />
                      </div>
                      <p className="prose-note">{m.text}</p>
                    </li>
                  ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {tab === 'library' && (
        <div>
          <div className="mb-6 flex flex-wrap items-end gap-3">
            <div className="w-40">
              <Select
                label="Art"
                value={kind}
                onChange={(v) => setKind(v as LibraryKind)}
                options={options(LIBRARY_KIND)}
              />
            </div>
            <div className="min-w-[16rem] flex-1">
              <QuickAdd
                placeholder={`Neuer Eintrag (${LIBRARY_KIND[kind]}) …`}
                onAdd={(title) =>
                  update((s) => ({
                    ...s,
                    library: [
                      { id: newId('lib'), title, kind, createdAt: new Date().toISOString() },
                      ...s.library,
                    ],
                  }))
                }
              />
            </div>
          </div>

          {state.library.length === 0 ? (
            <Empty
              title="Die Bibliothek ist leer"
              text="Bücher, Zitate, Bilder, Musik, Orte — was einen geprägt hat, gehört gesammelt."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {state.library.map((it) => (
                <Card key={it.id} as="article" className="group">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <Pill tone="muted">{LIBRARY_KIND[it.kind]}</Pill>
                    <DeleteButton
                      label="Eintrag entfernen"
                      onDelete={() =>
                        update((s) => ({
                          ...s,
                          library: s.library.filter((x) => x.id !== it.id),
                        }))
                      }
                    />
                  </div>
                  <p className="display text-[1.05rem] leading-snug text-ink-700 dark:text-paper-100">
                    {it.title}
                  </p>
                  {(it.author || it.note) && (
                    <p className="mt-1 text-[0.86rem] text-ink-300 dark:text-paper-200/50">
                      {[it.author, it.note].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'lived' && (
        <div>
          <p className="mb-6 max-w-xl text-[0.92rem] leading-relaxed text-ink-400 dark:text-paper-200/60">
            Reisen, Begegnungen und Momente, die nichts beweisen mussten. Dieser Abschnitt
            hat keinen Zweck — das ist sein Zweck.
          </p>

          <div className="mb-6 flex flex-wrap items-end gap-3">
            <div className="w-40">
              <Select
                label="Art"
                value={livedKind}
                onChange={(v) => setLivedKind(v as LivedMoment['kind'])}
                options={(Object.keys(LIVED_KIND) as LivedMoment['kind'][]).map((k) => ({
                  value: k,
                  label: LIVED_KIND[k],
                }))}
              />
            </div>
            <div className="min-w-[16rem] flex-1">
              <QuickAdd
                placeholder="Was war?"
                onAdd={(title) =>
                  update((s) => ({
                    ...s,
                    lived: [
                      {
                        id: newId('lv'),
                        title,
                        kind: livedKind,
                        date: new Date().toISOString().slice(0, 10),
                      },
                      ...s.lived,
                    ],
                  }))
                }
              />
            </div>
          </div>

          {state.lived.length === 0 ? (
            <Empty
              title="Noch nichts festgehalten"
              text="Ein Regennachmittag zählt genauso wie eine Reise."
            />
          ) : (
            <ul className="space-y-0">
              {[...state.lived]
                .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
                .map((l) => (
                  <li
                    key={l.id}
                    className="group flex items-baseline gap-5 border-b rule py-4 last:border-b-0"
                  >
                    <span className="w-20 shrink-0 text-[0.78rem] text-ink-300">
                      {l.date ? formatShort(l.date) : '—'}
                    </span>
                    <span className="w-24 shrink-0 text-[0.75rem] uppercase tracking-wide text-ink-300">
                      {LIVED_KIND[l.kind]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.98rem] text-ink-700 dark:text-paper-100">
                        {l.title}
                      </span>
                      {l.note && (
                        <span className="block text-[0.85rem] text-ink-300 dark:text-paper-200/50">
                          {l.note}
                        </span>
                      )}
                    </span>
                    <DeleteButton
                      label="Eintrag entfernen"
                      onDelete={() =>
                        update((s) => ({ ...s, lived: s.lived.filter((x) => x.id !== l.id) }))
                      }
                    />
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
