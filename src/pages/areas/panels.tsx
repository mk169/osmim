import { useState } from 'react';
import { useStore } from '../../store/store';
import { newId } from '../../store/actions';
import {
  APPLICATION_STATUS,
  CIRCLE,
  EXAM_STATUS,
  LIBRARY_KIND,
  options,
} from '../../lib/labels';
import type {
  ApplicationStatus,
  ContactCircle,
  ExamStatus,
  LibraryKind,
} from '../../types';
import {
  Card,
  DeleteButton,
  Empty,
  InlineEdit,
  Pill,
  QuickAdd,
  SectionTitle,
  Select,
  cx,
} from '../../components/ui';
import { daysBetween, formatShort, today } from '../../lib/date';

/* ------------------------------------------------- B — Klausuren & Thesis */

export function ExamPanel() {
  const { state, update } = useStore();
  const t = today();
  const exams = [...state.exams].sort((a, b) => (a.date ?? '9').localeCompare(b.date ?? '9'));

  return (
    <Card>
      <SectionTitle right={<span className="text-[0.78rem] text-ink-300">{exams.length} Klausuren</span>}>
        Klausuren
      </SectionTitle>

      {exams.length === 0 ? (
        <Empty title="Keine Klausuren eingetragen" text="Sobald Termine feststehen, finden sie hier ihren Platz." />
      ) : (
        <ul className="divide-y rule">
          {exams.map((ex) => {
            const days = ex.date ? daysBetween(t, ex.date) : null;
            return (
              <li key={ex.id} className="group py-4 first:pt-0">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h4 className="display text-[1.05rem] text-ink-700 dark:text-paper-100">
                    {ex.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <Pill tone="muted">{ex.weight}</Pill>
                    <Select
                      value={ex.status}
                      onChange={(v) =>
                        update((s) => ({
                          ...s,
                          exams: s.exams.map((e) =>
                            e.id === ex.id ? { ...e, status: v as ExamStatus } : e,
                          ),
                        }))
                      }
                      options={options(EXAM_STATUS)}
                      className="w-36 py-1 text-[0.78rem]"
                    />
                    <DeleteButton
                      label={`Klausur „${ex.title}“ entfernen`}
                      onDelete={() =>
                        update((s) => ({
                          ...s,
                          exams: s.exams.filter((e) => e.id !== ex.id),
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8rem] text-ink-300 dark:text-paper-200/45">
                  <span>{ex.date ? formatShort(ex.date) : 'Termin offen'}</span>
                  {days !== null && days >= 0 && <span>in {days} Tagen</span>}
                </div>

                <div className="-mx-2 mt-2 grid gap-1 sm:grid-cols-2">
                  <InlineEdit
                    value={ex.plan}
                    placeholder="Lernplan …"
                    onSave={(v) =>
                      update((s) => ({
                        ...s,
                        exams: s.exams.map((e) => (e.id === ex.id ? { ...e, plan: v } : e)),
                      }))
                    }
                    displayClassName="text-[0.88rem] text-ink-400 dark:text-paper-200/60"
                  />
                  <InlineEdit
                    value={ex.nextStep}
                    placeholder="Nächster Schritt …"
                    onSave={(v) =>
                      update((s) => ({
                        ...s,
                        exams: s.exams.map((e) => (e.id === ex.id ? { ...e, nextStep: v } : e)),
                      }))
                    }
                    displayClassName="text-[0.88rem] text-forest-600 dark:text-forest-300"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-5 border-t rule pt-4">
        <QuickAdd
          placeholder="Weitere Klausur …"
          onAdd={(title) =>
            update((s) => ({
              ...s,
              exams: [
                ...s.exams,
                {
                  id: newId('ex'),
                  title,
                  weight: '5 ECTS',
                  status: 'planned',
                  plan: '',
                  nextStep: '',
                },
              ],
            }))
          }
        />
      </div>
    </Card>
  );
}

export function ApplicationPanel() {
  const { state, update } = useStore();

  return (
    <Card>
      <SectionTitle>Praktikums-Pipeline</SectionTitle>
      {state.applications.length === 0 ? (
        <Empty
          title="Noch keine Station"
          text="Richtung findet man, indem man irgendwo mitarbeitet. Ein Haus genügt für den Anfang."
        />
      ) : (
        <ul className="divide-y rule">
          {state.applications.map((a) => (
            <li key={a.id} className="group py-4 first:pt-0">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h4 className="text-[0.98rem] text-ink-700 dark:text-paper-100">{a.company}</h4>
                  <p className="text-[0.85rem] text-ink-400 dark:text-paper-200/60">{a.role}</p>
                </div>
                <Select
                  value={a.status}
                  onChange={(v) =>
                    update((s) => ({
                      ...s,
                      applications: s.applications.map((x) =>
                        x.id === a.id ? { ...x, status: v as ApplicationStatus } : x,
                      ),
                    }))
                  }
                  options={options(APPLICATION_STATUS)}
                  className="w-40 py-1 text-[0.78rem]"
                />
                <DeleteButton
                  label={`${a.company} entfernen`}
                  onDelete={() =>
                    update((s) => ({
                      ...s,
                      applications: s.applications.filter((x) => x.id !== a.id),
                    }))
                  }
                />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[0.8rem] text-ink-300 dark:text-paper-200/45">
                {a.contact && <span>Kontakt: {a.contact}</span>}
                {a.deadline && <span>Frist: {formatShort(a.deadline)}</span>}
              </div>
              <div className="-mx-2 mt-1">
                <InlineEdit
                  value={a.nextAction ?? ''}
                  placeholder="Nächste Aktion …"
                  onSave={(v) =>
                    update((s) => ({
                      ...s,
                      applications: s.applications.map((x) =>
                        x.id === a.id ? { ...x, nextAction: v } : x,
                      ),
                    }))
                  }
                  displayClassName="text-[0.88rem] text-forest-600 dark:text-forest-300"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-5 border-t rule pt-4">
        <QuickAdd
          placeholder="Unternehmen …"
          onAdd={(company) =>
            update((s) => ({
              ...s,
              applications: [
                ...s.applications,
                { id: newId('app'), company, role: 'Praktikum', status: 'research' },
              ],
            }))
          }
        />
      </div>
    </Card>
  );
}

export function CareerHypotheses() {
  const { state, update } = useStore();
  const area = state.areas.find((a) => a.id === 'study');
  if (!area) return null;
  return (
    <Card>
      <SectionTitle>Karriere-Hypothesen</SectionTitle>
      <p className="mb-3 text-[0.85rem] leading-relaxed text-ink-300 dark:text-paper-200/50">
        Hypothesen, keine Entscheidungen. Sie dürfen sich widersprechen.
      </p>
      <InlineEdit
        value={area.extra}
        placeholder="Welche Richtungen kommen infrage?"
        onSave={(v) =>
          update((s) => ({
            ...s,
            areas: s.areas.map((a) => (a.id === 'study' ? { ...a, extra: v } : a)),
          }))
        }
        className="-mx-2"
        displayClassName="text-[0.92rem]"
      />
    </Card>
  );
}

/* ------------------------------------------------------- D — Beziehungen */

export function ContactPanel() {
  const { state, update } = useStore();
  const t = today();
  const [circle, setCircle] = useState<ContactCircle | 'all'>('all');

  const shown = state.contacts.filter((c) => circle === 'all' || c.circle === circle);

  return (
    <Card>
      <SectionTitle
        right={
          <Select
            value={circle}
            onChange={(v) => setCircle(v as ContactCircle | 'all')}
            options={[{ value: 'all', label: 'Alle' }, ...options(CIRCLE)]}
            className="w-44 py-1 text-[0.8rem]"
          />
        }
      >
        Menschen
      </SectionTitle>

      {shown.length === 0 ? (
        <Empty title="Niemand in dieser Ansicht" text="Beziehungen wachsen durch kleine, wiederholte Gesten." />
      ) : (
        <ul className="divide-y rule">
          {shown.map((c) => {
            const since = c.lastMet ? -daysBetween(t, c.lastMet) : null;
            return (
              <li key={c.id} className="group py-4 first:pt-0">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h4 className="text-[0.98rem] text-ink-700 dark:text-paper-100">{c.name}</h4>
                  <div className="flex items-center gap-2">
                    <Pill tone="muted">{CIRCLE[c.circle]}</Pill>
                    <span
                      className={cx(
                        'text-[0.78rem]',
                        since !== null && since > 30
                          ? 'text-wine-500 dark:text-wine-300'
                          : 'text-ink-300 dark:text-paper-200/45',
                      )}
                    >
                      {since === null
                        ? 'noch nicht notiert'
                        : since === 0
                          ? 'heute gesehen'
                          : `vor ${since} Tagen`}
                    </span>
                    <DeleteButton
                      label={`${c.name} entfernen`}
                      onDelete={() =>
                        update((s) => ({
                          ...s,
                          contacts: s.contacts.filter((x) => x.id !== c.id),
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="-mx-2 mt-1">
                  <InlineEdit
                    value={c.nextStep ?? ''}
                    placeholder="Nächster kleiner Schritt …"
                    onSave={(v) =>
                      update((s) => ({
                        ...s,
                        contacts: s.contacts.map((x) =>
                          x.id === c.id ? { ...x, nextStep: v } : x,
                        ),
                      }))
                    }
                    displayClassName="text-[0.88rem] text-forest-600 dark:text-forest-300"
                  />
                  <InlineEdit
                    value={c.note ?? ''}
                    placeholder="Notiz …"
                    onSave={(v) =>
                      update((s) => ({
                        ...s,
                        contacts: s.contacts.map((x) => (x.id === c.id ? { ...x, note: v } : x)),
                      }))
                    }
                    displayClassName="text-[0.86rem] text-ink-400 dark:text-paper-200/55"
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    update((s) => ({
                      ...s,
                      contacts: s.contacts.map((x) =>
                        x.id === c.id ? { ...x, lastMet: t } : x,
                      ),
                    }))
                  }
                  className="mt-2 text-[0.76rem] text-ink-300 underline-offset-2 hover:text-ink-500 hover:underline dark:hover:text-paper-100"
                >
                  heute begegnet
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-5 border-t rule pt-4">
        <QuickAdd
          placeholder="Name …"
          onAdd={(name) =>
            update((s) => ({
              ...s,
              contacts: [
                ...s.contacts,
                { id: newId('c'), name, circle: circle === 'all' ? 'new' : circle },
              ],
            }))
          }
        />
      </div>
      <p className="mt-4 text-[0.8rem] leading-relaxed text-ink-300 dark:text-paper-200/45">
        Keine Taktiken. Interesse zeigen, einladen, zuhören, verlässlich bleiben.
      </p>
    </Card>
  );
}

/* ---------------------------------------------------------- F — Bibliothek */

export function LibraryPanel({ compact }: { compact?: boolean }) {
  const { state, update } = useStore();
  const [kind, setKind] = useState<LibraryKind>('book');

  const items = compact ? state.library.slice(0, 6) : state.library;

  return (
    <Card>
      <SectionTitle
        right={
          <Select
            value={kind}
            onChange={(v) => setKind(v as LibraryKind)}
            options={options(LIBRARY_KIND)}
            className="w-32 py-1 text-[0.8rem]"
          />
        }
      >
        Lese- & Kulturarchiv
      </SectionTitle>

      {items.length === 0 ? (
        <Empty title="Noch leer" text="Bücher, Zitate, Bilder, Orte — was bleiben soll, kommt hierher." />
      ) : (
        <ul className="divide-y rule">
          {items.map((it) => (
            <li key={it.id} className="group flex items-baseline gap-4 py-3">
              <span className="w-14 shrink-0 text-[0.72rem] uppercase tracking-wide text-ink-300">
                {LIBRARY_KIND[it.kind]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[0.94rem] text-ink-700 dark:text-paper-100">
                  {it.title}
                </span>
                {(it.author || it.note) && (
                  <span className="block text-[0.83rem] text-ink-300 dark:text-paper-200/50">
                    {[it.author, it.note].filter(Boolean).join(' · ')}
                  </span>
                )}
              </span>
              <DeleteButton
                label="Eintrag entfernen"
                onDelete={() =>
                  update((s) => ({ ...s, library: s.library.filter((x) => x.id !== it.id) }))
                }
              />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 border-t rule pt-4">
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
    </Card>
  );
}

export function LanguagePanel() {
  const { state, update } = useStore();
  const habit = state.habits.find((h) => h.title.includes('Italienisch'));
  const t = today();
  const doneToday = habit?.log.includes(t) ?? false;

  return (
    <Card>
      <SectionTitle>Sprachen</SectionTitle>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 border-b rule pb-4">
          <div>
            <p className="text-[0.98rem] text-ink-700 dark:text-paper-100">Italienisch</p>
            <p className="text-[0.84rem] text-ink-300 dark:text-paper-200/50">
              Aktive Sprache · zehn Minuten täglich
            </p>
          </div>
          {habit && (
            <button
              type="button"
              onClick={() =>
                update((s) => ({
                  ...s,
                  habits: s.habits.map((h) =>
                    h.id === habit.id
                      ? {
                          ...h,
                          log: doneToday
                            ? h.log.filter((d) => d !== t)
                            : [...h.log, t].sort(),
                        }
                      : h,
                  ),
                }))
              }
              className={cx('btn', doneToday ? 'btn-solid' : 'btn-quiet')}
            >
              {doneToday ? 'Heute gemacht' : 'Heute machen'}
            </button>
          )}
        </div>
        <div className="space-y-2 text-[0.9rem] text-ink-400 dark:text-paper-200/60">
          <p className="text-ink-300 dark:text-paper-200/45">Später, ohne Eile:</p>
          <p>Französisch · Spanisch · vertieftes Englisch</p>
        </div>
        <div className="border-t rule pt-4">
          <p className="label mb-2">Lernpfade</p>
          <p className="text-[0.9rem] leading-relaxed text-ink-400 dark:text-paper-200/60">
            Rhetorik · Grammatik · Trivium · Allgemeinwissen
          </p>
        </div>
      </div>
    </Card>
  );
}

/* --------------------------------------------------------- I — Finanzen */

const euro = (n: number) =>
  n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

export function FinancePanel() {
  const { state, update } = useStore();
  const f = state.finances;
  const income = f.income.reduce((a, b) => a + b.amount, 0);
  const fixed = f.fixed.reduce((a, b) => a + b.amount, 0);
  const rest = income - fixed;
  const savedPct = f.savingsGoal.target
    ? Math.round((f.savingsGoal.saved / f.savingsGoal.target) * 100)
    : 0;

  return (
    <Card>
      <SectionTitle>Finanzen</SectionTitle>
      <div className="grid gap-6 sm:grid-cols-3">
        <div>
          <p className="label mb-2">Einnahmen</p>
          <ul className="space-y-1 text-[0.88rem] text-ink-400 dark:text-paper-200/60">
            {f.income.map((i) => (
              <li key={i.id} className="group flex items-center justify-between gap-2">
                <span className="min-w-0 flex-1 truncate">{i.label}</span>
                <span className="tabular-nums">{euro(i.amount)}</span>
                <DeleteButton
                  label={`${i.label} entfernen`}
                  onDelete={() =>
                    update((s) => ({
                      ...s,
                      finances: {
                        ...s.finances,
                        income: s.finances.income.filter((x) => x.id !== i.id),
                      },
                    }))
                  }
                />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="label mb-2">Fixkosten</p>
          <ul className="space-y-1 text-[0.88rem] text-ink-400 dark:text-paper-200/60">
            {f.fixed.map((i) => (
              <li key={i.id} className="group flex items-center justify-between gap-2">
                <span className="min-w-0 flex-1 truncate">{i.label}</span>
                <span className="tabular-nums">{euro(i.amount)}</span>
                <DeleteButton
                  label={`${i.label} entfernen`}
                  onDelete={() =>
                    update((s) => ({
                      ...s,
                      finances: {
                        ...s.finances,
                        fixed: s.finances.fixed.filter((x) => x.id !== i.id),
                      },
                    }))
                  }
                />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="label mb-2">Bleibt</p>
          <p className="display text-3xl text-ink-700 dark:text-paper-100">{euro(rest)}</p>
          <p className="mt-1 text-[0.8rem] text-ink-300 dark:text-paper-200/45">
            pro Monat, grob gerechnet
          </p>
        </div>
      </div>

      <div className="mt-6 border-t rule pt-5">
        <div className="mb-2 flex items-baseline justify-between gap-4">
          <p className="label">{f.savingsGoal.label}</p>
          <p className="text-[0.85rem] tabular-nums text-ink-400 dark:text-paper-200/60">
            {euro(f.savingsGoal.saved)} / {euro(f.savingsGoal.target)}
          </p>
        </div>
        <div className="h-px w-full bg-paper-300 dark:bg-ink-600">
          <div
            className="h-px bg-forest-500 transition-[width] duration-700 ease-calm dark:bg-forest-300"
            style={{ width: `${Math.min(100, savedPct)}%` }}
          />
        </div>
      </div>

      <div className="mt-6 border-t rule pt-5">
        <p className="label mb-3">Offene Zahlungen</p>
        <ul className="space-y-2">
          {f.openPayments.length === 0 && (
            <li className="text-[0.88rem] text-ink-300 dark:text-paper-200/45">
              Nichts offen. Angenehm.
            </li>
          )}
          {f.openPayments.map((p) => (
            <li key={p.id} className="flex items-baseline justify-between gap-4 text-[0.9rem]">
              <span className="text-ink-600 dark:text-paper-200/85">{p.label}</span>
              <span className="flex items-baseline gap-4">
                {p.due && (
                  <span className="text-[0.78rem] text-ink-300 dark:text-paper-200/45">
                    bis {formatShort(p.due)}
                  </span>
                )}
                <span className="tabular-nums text-ink-500 dark:text-paper-200/70">
                  {euro(p.amount)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    update((s) => ({
                      ...s,
                      finances: {
                        ...s.finances,
                        openPayments: s.finances.openPayments.filter((x) => x.id !== p.id),
                      },
                    }))
                  }
                  className="text-[0.76rem] text-ink-300 underline-offset-2 hover:text-forest-600 hover:underline"
                >
                  bezahlt
                </button>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

export function KrakauPanel() {
  const { state, update } = useStore();
  const project = state.projects.find((p) => p.id === 'proj_krakau');
  const area = state.areas.find((a) => a.id === 'daily');

  return (
    <Card>
      <SectionTitle>Krakau & Reisenotizen</SectionTitle>
      {project ? (
        <div className="space-y-3">
          <p className="text-[0.95rem] text-ink-600 dark:text-paper-200/85">{project.outcome}</p>
          <div className="-mx-2">
            <InlineEdit
              value={project.nextAction}
              placeholder="Nächste Handlung …"
              onSave={(v) =>
                update((s) => ({
                  ...s,
                  projects: s.projects.map((p) =>
                    p.id === project.id ? { ...p, nextAction: v } : p,
                  ),
                }))
              }
              displayClassName="text-[0.9rem] text-forest-600 dark:text-forest-300"
            />
          </div>
        </div>
      ) : (
        <p className="text-[0.9rem] text-ink-300">Kein Reiseprojekt angelegt.</p>
      )}
      {area && (
        <div className="mt-5 border-t rule pt-4">
          <p className="label mb-2">Haushaltsroutinen</p>
          <div className="-mx-2">
            <InlineEdit
              value={area.extra}
              placeholder="Wiederkehrende Routinen …"
              onSave={(v) =>
                update((s) => ({
                  ...s,
                  areas: s.areas.map((a) => (a.id === 'daily' ? { ...a, extra: v } : a)),
                }))
              }
              displayClassName="text-[0.9rem]"
            />
          </div>
        </div>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------- C — Körper */

export function BodyPanel() {
  const { state, update } = useStore();
  const area = state.areas.find((a) => a.id === 'body');
  const [log, setLog] = useState('');

  const trainings = state.events.filter((e) => e.kind === 'training').length;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <SectionTitle>Körperbild</SectionTitle>
        <dl className="space-y-3 text-[0.92rem]">
          <div className="flex justify-between gap-4 border-b rule pb-3">
            <dt className="text-ink-300 dark:text-paper-200/50">Ziel</dt>
            <dd className="text-ink-600 dark:text-paper-200/85">ca. 16 % KFA, gesund</dd>
          </div>
          <div className="flex justify-between gap-4 border-b rule pb-3">
            <dt className="text-ink-300 dark:text-paper-200/50">Rhythmus</dt>
            <dd className="text-ink-600 dark:text-paper-200/85">3 Einheiten pro Woche</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-300 dark:text-paper-200/50">Im Kalender</dt>
            <dd className="text-ink-600 dark:text-paper-200/85">{trainings} Einheiten geplant</dd>
          </div>
        </dl>
        {area && (
          <div className="mt-5 border-t rule pt-4">
            <p className="label mb-2">Ernährungsprinzipien</p>
            <div className="-mx-2">
              <InlineEdit
                value={area.extra}
                placeholder="Einfache Prinzipien statt Kalorienzählen …"
                onSave={(v) =>
                  update((s) => ({
                    ...s,
                    areas: s.areas.map((a) => (a.id === 'body' ? { ...a, extra: v } : a)),
                  }))
                }
                displayClassName="text-[0.9rem] leading-relaxed"
              />
            </div>
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle>Trainingstagebuch</SectionTitle>
        <p className="mb-3 text-[0.85rem] leading-relaxed text-ink-300 dark:text-paper-200/50">
          Kurz notieren, was war — Übungen, Schritte, Schlaf, Energie. Keine Zahlenjagd.
        </p>
        <textarea
          value={log}
          onChange={(e) => setLog(e.target.value)}
          rows={4}
          placeholder="Kniebeugen 4×6, danach 20 Min. Rad. Schlaf gut, Energie mittel."
          className="field resize-none leading-relaxed"
        />
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            disabled={!log.trim()}
            onClick={() => {
              update((s) => ({
                ...s,
                journal: [
                  {
                    id: newId('journal'),
                    title: `Training ${formatShort(today())}`,
                    body: log.trim(),
                    template: 'free',
                    tags: ['körper'],
                    createdAt: new Date().toISOString(),
                  },
                  ...s.journal,
                ],
              }));
              setLog('');
            }}
            className="btn-quiet"
          >
            Ins Journal legen
          </button>
        </div>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------- E — Glaube */

export function FaithPanel() {
  const { state, update } = useStore();
  const t = today();
  const habits = state.habits.filter((h) => h.areaId === 'faith');

  return (
    <Card>
      <SectionTitle>Praxis</SectionTitle>
      <p className="mb-4 text-[0.85rem] leading-relaxed text-ink-300 dark:text-paper-200/50">
        Hier wird nichts gezählt und nichts bewertet. Nur eine sanfte Erinnerung,
        dass es diese Dinge gibt.
      </p>
      <ul className="space-y-1">
        {habits.map((h) => {
          const done = h.log.includes(t);
          return (
            <li key={h.id} className="group flex items-center justify-between gap-4 py-1.5">
              <span className="text-[0.94rem] text-ink-600 dark:text-paper-200/85">{h.title}</span>
              <button
                type="button"
                onClick={() =>
                  update((s) => ({
                    ...s,
                    habits: s.habits.map((x) =>
                      x.id === h.id
                        ? {
                            ...x,
                            log: done ? x.log.filter((d) => d !== t) : [...x.log, t].sort(),
                          }
                        : x,
                    ),
                  }))
                }
                className={cx(
                  'text-[0.78rem] transition-colors duration-300',
                  done
                    ? 'text-forest-600 dark:text-forest-300'
                    : 'text-ink-300 hover:text-ink-500 dark:hover:text-paper-100',
                )}
              >
                {done ? 'heute gehalten' : 'heute'}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-5 space-y-2 border-t rule pt-4 text-[0.9rem] text-ink-400 dark:text-paper-200/60">
        <p>Messe · Beichte · geistliche Lektüre · Dankbarkeit</p>
        <p className="italic text-ink-300 dark:text-paper-200/45">
          „Unruhig ist unser Herz, bis es ruht in dir.“
        </p>
      </div>
    </Card>
  );
}
