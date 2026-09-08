import { useMemo, useState } from 'react';
import { useStore } from '../store/store';
import { newId } from '../store/actions';
import { JOURNAL_BODY, JOURNAL_TAGS, JOURNAL_TEMPLATE } from '../lib/labels';
import type { JournalEntry, JournalTemplate } from '../types';
import {
  AutoTextarea,
  Empty,
  Gauge,
  Modal,
  PageHeader,
  Pill,
  SectionTitle,
  TextField,
  cx,
} from '../components/ui';
import { formatLong } from '../lib/date';

const TEMPLATES = Object.keys(JOURNAL_TEMPLATE) as JournalTemplate[];

function Editor({
  entry,
  onClose,
}: {
  entry: JournalEntry;
  onClose: () => void;
}) {
  const { update } = useStore();

  const patch = (p: Partial<JournalEntry>) =>
    update((s) => ({
      ...s,
      journal: s.journal.map((j) => (j.id === entry.id ? { ...j, ...p } : j)),
    }));

  return (
    <Modal open onClose={onClose} title={JOURNAL_TEMPLATE[entry.template]} wide>
      <div className="space-y-5">
        <TextField
          label="Titel"
          value={entry.title}
          placeholder="Ohne Titel"
          onChange={(e) => patch({ title: e.target.value })}
        />
        <AutoTextarea
          label="Eintrag"
          value={entry.body}
          onChange={(e) => patch({ body: e.target.value })}
          className="min-h-[16rem]"
        />

        <div>
          <p className="label mb-2">Tags</p>
          <div className="flex flex-wrap gap-2">
            {JOURNAL_TAGS.map((tag) => {
              const on = entry.tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    patch({
                      tags: on
                        ? entry.tags.filter((t) => t !== tag)
                        : [...entry.tags, tag],
                    })
                  }
                  className={cx(
                    'rounded-full border px-3 py-1 text-[0.78rem] transition-colors duration-200 ease-calm',
                    on
                      ? 'border-forest-500 text-forest-600 dark:border-forest-300 dark:text-forest-300'
                      : 'border-paper-300 text-ink-300 hover:border-ink-300 dark:border-ink-600 dark:hover:border-ink-500',
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 border-t rule pt-5">
          <p className="label">Selbsteinschätzung — ohne Deutung</p>
          <Gauge label="Energie" value={entry.energy} onChange={(v) => patch({ energy: v })} />
          <Gauge label="Stimmung" value={entry.mood} onChange={(v) => patch({ mood: v })} />
        </div>

        <div className="flex items-center justify-between border-t rule pt-5">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Diesen Eintrag löschen?')) {
                update((s) => ({ ...s, journal: s.journal.filter((j) => j.id !== entry.id) }));
                onClose();
              }
            }}
            className="text-[0.8rem] text-ink-300 underline-offset-2 hover:text-wine-500 hover:underline"
          >
            Eintrag löschen
          </button>
          <button type="button" onClick={onClose} className="btn-quiet">
            Fertig
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function Journal() {
  const { state, update } = useStore();
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.journal
      .filter((j) => (tag ? j.tags.includes(tag) : true))
      .filter((j) =>
        q ? `${j.title} ${j.body} ${j.tags.join(' ')}`.toLowerCase().includes(q) : true,
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [state.journal, query, tag]);

  const create = (template: JournalTemplate) => {
    const id = newId('journal');
    update((s) => ({
      ...s,
      journal: [
        {
          id,
          title: '',
          body: JOURNAL_BODY[template],
          template,
          tags: [],
          createdAt: new Date().toISOString(),
        },
        ...s.journal,
      ],
    }));
    setOpenId(id);
  };

  const open = state.journal.find((j) => j.id === openId) ?? null;

  return (
    <div>
      <PageHeader
        eyebrow="Denken auf Papier"
        title="Journal"
        lead="Ein Ort für Sätze, die sonst im Kopf kreisen. Nichts davon muss klug sein."
      />

      <section className="mb-10">
        <SectionTitle>Beginnen</SectionTitle>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl}
              type="button"
              onClick={() => create(tpl)}
              className="card px-5 py-4 text-left transition-all duration-300 ease-calm hover:-translate-y-px hover:border-forest-300 dark:hover:border-forest-500/70"
            >
              <p className="display text-[1.05rem] text-ink-700 dark:text-paper-100">
                {JOURNAL_TEMPLATE[tpl]}
              </p>
              <p className="mt-1 text-[0.8rem] text-ink-300 dark:text-paper-200/45">
                {tpl === 'free' ? 'Leeres Blatt' : 'Mit Leitfragen'}
              </p>
            </button>
          ))}
        </div>
      </section>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Durchsuchen …"
          className="field max-w-xs flex-1"
        />
        <div className="flex flex-wrap gap-2">
          {JOURNAL_TAGS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTag(tag === t ? null : t)}
              className={cx(
                'rounded-full border px-3 py-1 text-[0.76rem] transition-colors duration-200 ease-calm',
                tag === t
                  ? 'border-forest-500 text-forest-600 dark:border-forest-300 dark:text-forest-300'
                  : 'border-transparent text-ink-300 hover:border-paper-300 dark:hover:border-ink-600',
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {entries.length === 0 ? (
        <Empty
          title={query || tag ? 'Nichts gefunden' : 'Noch kein Eintrag'}
          text={
            query || tag
              ? 'Vielleicht mit einem anderen Wort versuchen.'
              : 'Der erste Eintrag darf banal sein. Das Wetter genügt.'
          }
        />
      ) : (
        <ul className="space-y-3">
          {entries.map((j) => (
            <li key={j.id}>
              <button
                type="button"
                onClick={() => setOpenId(j.id)}
                className="card block w-full p-5 text-left transition-all duration-300 ease-calm hover:-translate-y-px sm:p-6"
              >
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="display text-lg text-ink-700 dark:text-paper-100">
                    {j.title || 'Ohne Titel'}
                  </h3>
                  <span className="text-[0.76rem] text-ink-300">
                    {formatLong(j.createdAt.slice(0, 10))}
                  </span>
                </div>
                <p className="line-clamp-3 whitespace-pre-wrap text-[0.9rem] leading-relaxed text-ink-400 dark:text-paper-200/60">
                  {j.body.trim() || 'Noch nichts geschrieben.'}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Pill tone="muted">{JOURNAL_TEMPLATE[j.template]}</Pill>
                  {j.tags.map((t) => (
                    <Pill key={t}>{t}</Pill>
                  ))}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && <Editor entry={open} onClose={() => setOpenId(null)} />}
    </div>
  );
}
