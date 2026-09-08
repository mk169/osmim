import { useRef, useState, type ReactNode } from 'react';
import { ROUTES, navigate, type Route } from '../lib/router';
import { useStore } from '../store/store';
import { cx, Modal } from './ui';
import { formatShort, today } from '../lib/date';

const NAV: { route: Route; label: string; hint: string }[] = [
  { route: 'heute', label: 'Heute', hint: 'Der Tag, klein gehalten' },
  { route: 'kompass', label: 'Kompass', hint: 'Identität und Richtung' },
  { route: 'saison', label: 'Saison', hint: 'Zeitraum und Ziele' },
  { route: 'bereiche', label: 'Bereiche', hint: 'Neun Lebensbereiche' },
  { route: 'projekte', label: 'Projekte', hint: 'Inbox und Vorhaben' },
  { route: 'woche', label: 'Woche', hint: 'Kalender und Review' },
  { route: 'journal', label: 'Journal', hint: 'Einträge und Vorlagen' },
  { route: 'archiv', label: 'Archiv', hint: 'Was gewesen ist' },
];

function Monogram() {
  return (
    <a
      href="#/heute"
      className="group flex items-center gap-3"
      aria-label="Personal OS — zur Heute-Ansicht"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-paper-400 text-[0.7rem] tracking-[0.08em] text-ink-500 transition-colors duration-300 ease-calm group-hover:border-forest-500 group-hover:text-forest-600 dark:border-ink-500 dark:text-paper-200/70 dark:group-hover:border-forest-300 dark:group-hover:text-forest-300">
        OS
      </span>
      <span className="leading-tight">
        <span className="display block text-[0.98rem] text-ink-700 dark:text-paper-100">
          Personal OS
        </span>
        <span className="block text-[0.68rem] uppercase tracking-[0.16em] text-ink-300">
          Zweite Fassung
        </span>
      </span>
    </a>
  );
}

function ThemeToggle() {
  const { state, toggleTheme } = useStore();
  const dark = state.theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex w-full items-center justify-between rounded-card px-2 py-2 text-[0.82rem] text-ink-400 transition-colors duration-200 ease-calm hover:bg-paper-100 hover:text-ink-600 dark:text-paper-200/60 dark:hover:bg-ink-700/60 dark:hover:text-paper-100"
    >
      <span>{dark ? 'Nachtmodus' : 'Tagmodus'}</span>
      <span
        aria-hidden
        className={cx(
          'relative h-4 w-8 rounded-full border transition-colors duration-300 ease-calm',
          dark ? 'border-forest-300/60 bg-ink-700' : 'border-paper-400 bg-paper-200',
        )}
      >
        <span
          className={cx(
            'absolute top-[2px] h-3 w-3 rounded-full transition-all duration-300 ease-calm',
            dark ? 'left-[17px] bg-forest-300' : 'left-[2px] bg-ink-300',
          )}
        />
      </span>
    </button>
  );
}

function DataMenu() {
  const { exportJSON, importJSON, reset, lastSaved } = useStore();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-card px-2 py-2 text-left text-[0.82rem] text-ink-400 transition-colors duration-200 ease-calm hover:bg-paper-100 hover:text-ink-600 dark:text-paper-200/60 dark:hover:bg-ink-700/60 dark:hover:text-paper-100"
      >
        Daten & Sicherung
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Daten & Sicherung">
        <p className="prose-note mb-6">
          Alles bleibt auf diesem Gerät. Nichts wird gesendet, nichts wird gemessen.
          Ein Backup ist eine einzelne JSON-Datei — lesbar, portabel, deins.
        </p>

        <div className="space-y-3">
          <button type="button" onClick={exportJSON} className="btn-quiet w-full justify-start">
            Backup exportieren (JSON)
          </button>

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="btn-quiet w-full justify-start"
          >
            Backup importieren …
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                await importJSON(file);
                setError(null);
                setOpen(false);
              } catch {
                setError('Die Datei konnte nicht gelesen werden.');
              } finally {
                e.target.value = '';
              }
            }}
          />

          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  'Alle Daten durch die Ausgangsfassung ersetzen? Das lässt sich nicht rückgängig machen.',
                )
              ) {
                reset();
                setOpen(false);
              }
            }}
            className="btn w-full justify-start border-wine-300/60 text-wine-500 hover:border-wine-500 dark:border-wine-300/30 dark:text-wine-300"
          >
            Auf Ausgangsfassung zurücksetzen
          </button>
        </div>

        {error && <p className="mt-4 text-[0.85rem] text-wine-500">{error}</p>}

        <p className="mt-6 border-t rule pt-4 text-[0.78rem] text-ink-300">
          {lastSaved
            ? `Zuletzt gespeichert um ${lastSaved.toLocaleTimeString('de-DE', {
                hour: '2-digit',
                minute: '2-digit',
              })} Uhr.`
            : 'Änderungen werden automatisch gespeichert.'}
        </p>
      </Modal>
    </>
  );
}

function NavList({ active, onPick }: { active: Route; onPick?: () => void }) {
  return (
    <nav className="space-y-0.5">
      {NAV.map((item, i) => {
        const isActive = item.route === active;
        return (
          <a
            key={item.route}
            href={`#/${item.route}`}
            onClick={onPick}
            aria-current={isActive ? 'page' : undefined}
            className={cx(
              'group flex items-baseline gap-3 rounded-card px-2 py-2 transition-colors duration-200 ease-calm',
              isActive
                ? 'bg-paper-200/70 dark:bg-ink-700/70'
                : 'hover:bg-paper-100 dark:hover:bg-ink-700/40',
            )}
          >
            <span
              className={cx(
                'w-4 shrink-0 text-[0.68rem] tabular-nums',
                isActive ? 'text-forest-600 dark:text-forest-300' : 'text-ink-300',
              )}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="min-w-0">
              <span
                className={cx(
                  'block text-[0.95rem] leading-snug',
                  isActive
                    ? 'text-ink-700 dark:text-paper-100'
                    : 'text-ink-500 group-hover:text-ink-700 dark:text-paper-200/75 dark:group-hover:text-paper-100',
                )}
              >
                {item.label}
              </span>
              <span className="block text-[0.72rem] text-ink-300 dark:text-paper-200/40">
                {item.hint}
              </span>
            </span>
          </a>
        );
      })}
    </nav>
  );
}

export function Shell({ active, children }: { active: Route; children: ReactNode }) {
  const [menu, setMenu] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Mobile Kopfzeile */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b rule bg-paper-100/90 px-4 py-3 backdrop-blur lg:hidden dark:bg-ink-900/90">
        <Monogram />
        <button
          type="button"
          onClick={() => setMenu((m) => !m)}
          aria-expanded={menu}
          aria-label="Navigation"
          className="rounded-card border border-paper-300 px-3 py-1.5 text-[0.8rem] text-ink-500 dark:border-ink-600 dark:text-paper-200/80"
        >
          {menu ? 'Schließen' : 'Menü'}
        </button>
      </header>

      {menu && (
        <div className="border-b rule bg-paper-50 px-4 py-4 lg:hidden dark:bg-ink-800">
          <NavList active={active} onPick={() => setMenu(false)} />
          <div className="mt-4 space-y-1 border-t rule pt-3">
            <ThemeToggle />
            <DataMenu />
          </div>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-[1500px]">
        {/* Feste Seitenspalte, Desktop */}
        <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col justify-between border-r rule px-5 py-8 lg:flex xl:w-[276px]">
          <div>
            <div className="mb-10 px-2">
              <Monogram />
            </div>
            <NavList active={active} />
          </div>
          <div className="space-y-1 border-t rule pt-4">
            <p className="px-2 pb-2 text-[0.72rem] text-ink-300">{formatShort(today())}</p>
            <ThemeToggle />
            <DataMenu />
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-14 xl:px-16">
          {/* Die Wochenansicht braucht sieben Spalten und darf breiter atmen. */}
          <div
            key={active}
            className={cx('mx-auto animate-rise', active === 'woche' ? 'max-w-6xl' : 'max-w-4xl')}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export { navigate, ROUTES };
