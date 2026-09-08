import { useState } from 'react';
import { useAccount } from '../store/account';
import { useCloudSync } from '../store/cloudSync';
import { SyncPanel } from './SyncPanel';
import { TextField, cx } from './ui';

type Mode = 'signIn' | 'signUp';

function when(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}, ${d.toLocaleTimeString(
    'de-DE',
    { hour: '2-digit', minute: '2-digit' },
  )} Uhr`;
}

export function AccountPanel() {
  const { auth, signIn, signUp, signOut, resetPassword } = useAccount();
  const { sync, syncNow } = useCloudSync();

  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ kind: 'info' | 'error'; text: string } | null>(null);

  // Ohne eingerichteten Dienst bleibt es beim Abgleich über Sync-Schlüssel.
  if (auth.kind === 'unconfigured') {
    return (
      <div className="space-y-4">
        <p className="text-[0.88rem] leading-relaxed text-ink-400 dark:text-paper-200/60">
          Profile sind für diese Fassung nicht eingerichtet. Bis dahin gleichen
          Geräte über einen Sync-Schlüssel ab — das funktioniert genauso, nur
          ohne Anmeldung.
        </p>
        <SyncPanel />
      </div>
    );
  }

  if (auth.kind === 'loading') {
    return (
      <p className="text-[0.88rem] text-ink-300 dark:text-paper-200/45">
        Profil wird geprüft …
      </p>
    );
  }

  if (auth.kind === 'signedIn') {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="label mb-1">Angemeldet</p>
            <p className="text-[0.98rem] text-ink-700 dark:text-paper-100">{auth.email}</p>
          </div>
          <button type="button" onClick={() => void signOut()} className="btn-quiet">
            Abmelden
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t rule pt-4">
          <p
            className={cx(
              'text-[0.85rem]',
              sync.kind === 'error'
                ? 'text-wine-500 dark:text-wine-300'
                : 'text-ink-400 dark:text-paper-200/60',
            )}
          >
            {sync.kind === 'ok' && `Gesichert · ${when(sync.at)}`}
            {sync.kind === 'working' && sync.text}
            {sync.kind === 'error' && sync.text}
            {sync.kind === 'off' && 'Abgleich ruht.'}
          </p>
          <button
            type="button"
            onClick={() => void syncNow()}
            disabled={sync.kind === 'working'}
            className="btn-quiet"
          >
            Jetzt abgleichen
          </button>
        </div>

        <p className="text-[0.82rem] leading-relaxed text-ink-300 dark:text-paper-200/45">
          Deine Einträge werden automatisch gesichert und auf jedem angemeldeten
          Gerät geladen. Melde dich auf dem iPhone mit derselben E-Mail an — mehr
          ist nicht nötig.
        </p>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setNote(null);
    try {
      if (mode === 'signUp') {
        await signUp(email.trim(), password);
        setNote({
          kind: 'info',
          text: 'Profil angelegt. Falls Supabase eine Bestätigungsmail schickt, bestätige sie zuerst.',
        });
      } else {
        await signIn(email.trim(), password);
      }
    } catch (err) {
      setNote({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Fehlgeschlagen.',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['signIn', 'signUp'] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setNote(null);
            }}
            className={cx(
              'rounded-full border px-3.5 py-1.5 text-[0.83rem] transition-colors duration-200 ease-calm',
              mode === m
                ? 'border-forest-500 text-forest-600 dark:border-forest-300 dark:text-forest-300'
                : 'border-paper-300 text-ink-400 hover:border-ink-300 dark:border-ink-600 dark:text-paper-200/70',
            )}
          >
            {m === 'signIn' ? 'Anmelden' : 'Profil anlegen'}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-3">
        <TextField
          label="E-Mail"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Passwort"
          type="password"
          autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={busy || !email.trim() || !password}
          className="btn-solid w-full justify-center"
        >
          {busy ? 'Einen Moment …' : mode === 'signIn' ? 'Anmelden' : 'Profil anlegen'}
        </button>
      </form>

      {mode === 'signIn' && (
        <button
          type="button"
          onClick={async () => {
            if (!email.trim()) {
              setNote({ kind: 'error', text: 'Trag zuerst deine E-Mail ein.' });
              return;
            }
            try {
              await resetPassword(email.trim());
              setNote({ kind: 'info', text: 'Wir haben dir einen Link geschickt.' });
            } catch (err) {
              setNote({
                kind: 'error',
                text: err instanceof Error ? err.message : 'Fehlgeschlagen.',
              });
            }
          }}
          className="text-[0.8rem] text-ink-300 underline-offset-2 hover:text-ink-500 hover:underline dark:hover:text-paper-100"
        >
          Passwort vergessen
        </button>
      )}

      {note && (
        <p
          className={cx(
            'text-[0.85rem] leading-relaxed',
            note.kind === 'error'
              ? 'text-wine-500 dark:text-wine-300'
              : 'text-ink-400 dark:text-paper-200/60',
          )}
        >
          {note.text}
        </p>
      )}

      <p className="border-t rule pt-4 text-[0.82rem] leading-relaxed text-ink-300 dark:text-paper-200/45">
        Ohne Anmeldung bleibt alles auf diesem Gerät — die App funktioniert
        vollständig. Ein Profil brauchst du nur, damit Mac und iPhone denselben
        Stand sehen.
      </p>
    </div>
  );
}
