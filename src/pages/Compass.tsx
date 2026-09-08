import { useStore } from '../store/store';
import { FocusList } from '../components/FocusList';
import {
  Card,
  DeleteButton,
  InlineEdit,
  PageHeader,
  QuickAdd,
  SectionTitle,
  cx,
} from '../components/ui';

function ListBlock({
  items,
  onRemove,
  onAdd,
  placeholder,
  marker = '—',
}: {
  items: string[];
  onRemove: (index: number) => void;
  onAdd: (text: string) => void;
  placeholder: string;
  marker?: string;
}) {
  return (
    <>
      <ul className="mb-4 space-y-1">
        {items.map((item, i) => (
          <li
            key={`${item}-${i}`}
            className="group flex items-baseline gap-3 py-1 text-[0.93rem] leading-relaxed text-ink-500 dark:text-paper-200/75"
          >
            <span aria-hidden className="shrink-0 text-ink-300">
              {marker}
            </span>
            <span className="flex-1">{item}</span>
            <DeleteButton onDelete={() => onRemove(i)} />
          </li>
        ))}
      </ul>
      <QuickAdd placeholder={placeholder} onAdd={onAdd} />
    </>
  );
}

export function Compass() {
  const { state, update } = useStore();
  const c = state.compass;

  const patch = (p: Partial<typeof c>) =>
    update((s) => ({ ...s, compass: { ...s.compass, ...p } }));

  return (
    <div>
      <PageHeader
        eyebrow="Identität und Richtung"
        title="Kompass"
        lead="Kein Plan, sondern eine Himmelsrichtung. Wer weiß, wohin er will, muss nicht jede Woche neu verhandeln, wer er ist."
      />

      <Card className="mb-12 border-l-2 border-l-forest-500 px-6 py-8 dark:border-l-forest-300 sm:px-10 sm:py-12">
        <p className="label mb-4">Leitbild</p>
        <InlineEdit
          value={c.creed}
          onSave={(v) => patch({ creed: v })}
          displayClassName="display text-2xl leading-[1.35] sm:text-[1.9rem]"
          className="-mx-2"
        />
      </Card>

      <section className="mb-12">
        <SectionTitle>Persönliche Werte</SectionTitle>
        <div className="mb-4 flex flex-wrap gap-2">
          {c.values.map((v, i) => (
            <span
              key={`${v}-${i}`}
              className="group flex items-center gap-2 rounded-full border border-paper-300 px-4 py-1.5 text-[0.9rem] text-ink-600 transition-colors duration-300 ease-calm hover:border-forest-300 dark:border-ink-600 dark:text-paper-200/85 dark:hover:border-forest-500"
            >
              {v}
              <DeleteButton
                label={`${v} entfernen`}
                onDelete={() => patch({ values: c.values.filter((_, idx) => idx !== i) })}
                className="-mr-1"
              />
            </span>
          ))}
        </div>
        <div className="max-w-sm">
          <QuickAdd
            placeholder="Ein weiterer Wert …"
            onAdd={(text) => patch({ values: [...c.values, text] })}
          />
        </div>
      </section>

      <section className="mb-12">
        <SectionTitle>Vorbild-Qualitäten</SectionTitle>
        <p className="mb-5 max-w-xl text-[0.9rem] leading-relaxed text-ink-300 dark:text-paper-200/50">
          Nicht Menschen, die man beneidet — Eigenschaften, die man üben kann.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {c.qualities.map((q, i) => (
            <article
              key={q.title}
              className={cx(
                'card group p-5 transition-all duration-300 ease-calm',
                'hover:-translate-y-px hover:border-brass-300 dark:hover:border-brass-500/60',
              )}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="display text-[1.1rem] text-ink-700 dark:text-paper-100">
                  {q.title}
                </h3>
                <DeleteButton
                  label={`${q.title} entfernen`}
                  onDelete={() =>
                    patch({ qualities: c.qualities.filter((_, idx) => idx !== i) })
                  }
                />
              </div>
              <InlineEdit
                value={q.text}
                onSave={(v) =>
                  patch({
                    qualities: c.qualities.map((x, idx) =>
                      idx === i ? { ...x, text: v } : x,
                    ),
                  })
                }
                className="-mx-2"
                displayClassName="text-[0.88rem] leading-relaxed text-ink-400 dark:text-paper-200/60"
              />
            </article>
          ))}
        </div>
        <div className="mt-4 max-w-sm">
          <QuickAdd
            placeholder="Eine weitere Qualität …"
            onAdd={(title) =>
              patch({ qualities: [...c.qualities, { title, text: '' }] })
            }
          />
        </div>
      </section>

      <section className="mb-12">
        <FocusList />
      </section>

      <section className="mb-12">
        <SectionTitle>Anti-Vision</SectionTitle>
        <Card className="border-l-2 border-l-wine-500 dark:border-l-wine-300">
          <p className="mb-4 text-[0.9rem] leading-relaxed text-ink-300 dark:text-paper-200/50">
            Der Mensch, der ich nicht werden will. Hilfreicher als jedes Ziel, wenn man
            ihn ehrlich beschreibt.
          </p>
          <ListBlock
            items={c.antiVision}
            onRemove={(i) => patch({ antiVision: c.antiVision.filter((_, idx) => idx !== i) })}
            onAdd={(text) => patch({ antiVision: [...c.antiVision, text] })}
            placeholder="Was ich vermeiden will …"
          />
        </Card>
      </section>

      <section className="mb-12">
        <SectionTitle>Fünf-Jahres-Kompass</SectionTitle>
        <p className="mb-6 max-w-xl text-[0.9rem] leading-relaxed text-ink-300 dark:text-paper-200/50">
          Grobe Phasen, kein starrer Plan. Die Reihenfolge zählt mehr als die Jahreszahlen.
        </p>
        <ol className="relative space-y-0">
          {c.phases.map((p, i) => (
            <li key={p.id} className="relative flex gap-6 pb-8 last:pb-0">
              <div className="flex flex-col items-center">
                <span
                  className={cx(
                    'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                    i === 0 ? 'bg-forest-500 dark:bg-forest-300' : 'bg-paper-400 dark:bg-ink-500',
                  )}
                />
                {i < c.phases.length - 1 && (
                  <span className="mt-1 w-px flex-1 bg-paper-300 dark:bg-ink-600" />
                )}
              </div>
              <div className="group min-w-0 flex-1 pb-2">
                <p className="label mb-1">{p.label}</p>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="display text-xl text-ink-700 dark:text-paper-100">
                    {p.title}
                  </h3>
                  <DeleteButton
                    label={`Phase „${p.title}“ entfernen`}
                    onDelete={() =>
                      patch({ phases: c.phases.filter((x) => x.id !== p.id) })
                    }
                  />
                </div>
                <div className="-mx-2 mt-1">
                  <InlineEdit
                    value={p.text}
                    onSave={(v) =>
                      patch({
                        phases: c.phases.map((x) => (x.id === p.id ? { ...x, text: v } : x)),
                      })
                    }
                    displayClassName="text-[0.92rem] leading-relaxed text-ink-400 dark:text-paper-200/60"
                  />
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <SectionTitle>Nicht mein Maßstab</SectionTitle>
        <Card>
          <p className="mb-4 text-[0.9rem] leading-relaxed text-ink-300 dark:text-paper-200/50">
            Woran ich mich ausdrücklich nicht messe. Diese Liste ist eine Erlaubnis.
          </p>
          <ListBlock
            items={c.notMyMeasure}
            onRemove={(i) =>
              patch({ notMyMeasure: c.notMyMeasure.filter((_, idx) => idx !== i) })
            }
            onAdd={(text) => patch({ notMyMeasure: [...c.notMyMeasure, text] })}
            placeholder="Was mich nicht bewerten darf …"
            marker="×"
          />
        </Card>
      </section>
    </div>
  );
}
