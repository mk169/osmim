import { useStore } from '../store/store';
import { newId } from '../store/actions';
import { Card, DeleteButton, Empty, QuickAdd, SectionTitle, cx } from './ui';

const MAX_ITEMS = 25;
const MAX_CHOSEN = 5;

/**
 * Die 25/5-Übung nach Buffett: fünfundzwanzig Ziele aufschreiben, fünf
 * auswählen — und die übrigen zwanzig bewusst meiden. Der harte Teil ist
 * nicht das Wählen, sondern das Meiden.
 */
export function FocusList() {
  const { state, update } = useStore();
  const items = state.focusList;
  const chosen = items.filter((i) => i.chosen);
  const rest = items.filter((i) => !i.chosen);
  const full = chosen.length >= MAX_CHOSEN;

  const toggle = (id: string) =>
    update((s) => ({
      ...s,
      focusList: s.focusList.map((i) =>
        i.id === id ? { ...i, chosen: !i.chosen } : i,
      ),
    }));

  return (
    <Card>
      <SectionTitle
        right={
          <span className="text-[0.78rem] tabular-nums text-ink-300">
            {chosen.length}/{MAX_CHOSEN} gewählt · {items.length}/{MAX_ITEMS}
          </span>
        }
      >
        Die 25/5-Liste
      </SectionTitle>

      <p className="mb-5 max-w-xl text-[0.88rem] leading-relaxed text-ink-300 dark:text-paper-200/50">
        Fünfundzwanzig Dinge aufschreiben, die du erreichen willst. Dann fünf
        wählen. Die übrigen zwanzig sind nicht „später“ — sie sind das, was
        dich von den fünf abhält.
      </p>

      {items.length === 0 ? (
        <Empty
          title="Noch nichts aufgeschrieben"
          text="Schreib erst alles auf, ohne zu filtern. Ausgewählt wird danach."
        />
      ) : (
        <div className="space-y-6">
          <div>
            <p className="label mb-2">
              {chosen.length === 0 ? 'Noch nichts gewählt' : 'Die fünf'}
            </p>
            <ul className="space-y-1">
              {chosen.map((i) => (
                <li key={i.id} className="group flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggle(i.id)}
                    className="flex-1 rounded-card border-l-2 border-l-forest-500 bg-paper-100/60 px-3 py-2 text-left text-[0.94rem] text-ink-700 transition-colors duration-200 hover:bg-paper-200/60 dark:border-l-forest-300 dark:bg-ink-900/40 dark:text-paper-100 dark:hover:bg-ink-700/50"
                  >
                    {i.text}
                  </button>
                  <DeleteButton
                    onDelete={() =>
                      update((s) => ({
                        ...s,
                        focusList: s.focusList.filter((x) => x.id !== i.id),
                      }))
                    }
                  />
                </li>
              ))}
              {chosen.length === 0 && (
                <li className="px-3 py-2 text-[0.88rem] text-ink-300 dark:text-paper-200/45">
                  Tippe unten auf einen Eintrag, um ihn zu wählen.
                </li>
              )}
            </ul>
          </div>

          {rest.length > 0 && (
            <div>
              <p className="label mb-2">
                {full ? 'Bewusst meiden' : 'Noch nicht gewählt'}
              </p>
              <ul className="space-y-1">
                {rest.map((i) => (
                  <li key={i.id} className="group flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => !full && toggle(i.id)}
                      disabled={full}
                      title={
                        full
                          ? 'Fünf sind gewählt — dieser Eintrag gehört auf die Vermeidungsliste.'
                          : 'Zu den fünf hinzufügen'
                      }
                      className={cx(
                        'flex-1 rounded-card px-3 py-2 text-left text-[0.92rem] transition-colors duration-200',
                        full
                          ? 'cursor-default text-ink-300 line-through decoration-ink-300/40 dark:text-paper-200/35'
                          : 'text-ink-500 hover:bg-paper-100 dark:text-paper-200/75 dark:hover:bg-ink-700/50',
                      )}
                    >
                      {i.text}
                    </button>
                    <DeleteButton
                      onDelete={() =>
                        update((s) => ({
                          ...s,
                          focusList: s.focusList.filter((x) => x.id !== i.id),
                        }))
                      }
                    />
                  </li>
                ))}
              </ul>
              {full && (
                <p className="mt-3 text-[0.83rem] italic leading-relaxed text-ink-300 dark:text-paper-200/45">
                  Diese Liste ist keine Warteschlange. Sie ist der Grund, warum die
                  fünf gelingen können.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {items.length < MAX_ITEMS && (
        <div className="mt-5 border-t rule pt-4">
          <QuickAdd
            placeholder="Was willst du erreichen?"
            onAdd={(text) =>
              update((s) => ({
                ...s,
                focusList: [
                  ...s.focusList,
                  { id: newId('focus'), text, chosen: false },
                ],
              }))
            }
          />
        </div>
      )}
    </Card>
  );
}
