import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/store';
import { pull, push, readSecret, writeSecret } from '../store/sync';
import { createSecret, normalizeSecret } from '../lib/syncCrypto';
import { cx } from './ui';

type Status =
  | { kind: 'idle' }
  | { kind: 'busy'; text: string }
  | { kind: 'done'; text: string }
  | { kind: 'error'; text: string };

function format(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}, ${d.toLocaleTimeString(
    'de-DE',
    { hour: '2-digit', minute: '2-digit' },
  )} Uhr`;
}

/**
 * Abgleich zwischen Geräten. Bewusst mit sichtbaren Knöpfen statt
 * unsichtbarer Automatik: du entscheidest, wann welcher Stand gilt.
 */
export function SyncPanel() {
  const { state, replaceState } = useStore();
  const [secret, setSecret] = useState<string | null>(() => readSecret());
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [remoteAt, setRemoteAt] = useState<string | null>(null);
  const mounted = useRef(true);

  // Beim erneuten Einhängen wieder scharf schalten — sonst bliebe die
  // Sperre nach dem Doppel-Mount des StrictMode dauerhaft zu und jede
  // Statusmeldung fiele lautlos aus.
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const set = (s: Status) => {
    if (mounted.current) setStatus(s);
  };

  // Beim Öffnen einmal nachsehen, was in der Ablage liegt.
  useEffect(() => {
    if (!secret) return;
    let cancelled = false;
    (async () => {
      try {
        const remote = await pull(secret);
        if (!cancelled) setRemoteAt(remote?.updatedAt ?? null);
      } catch {
        /* Stillschweigend — die Knöpfe melden Fehler, wenn es darauf ankommt. */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [secret]);

  const activate = (value: string) => {
    const clean = normalizeSecret(value);
    if (clean.length < 20) {
      set({ kind: 'error', text: 'Der Schlüssel sieht zu kurz aus.' });
      return;
    }
    writeSecret(clean);
    setSecret(clean);
    setDraft('');
    set({ kind: 'idle' });
  };

  const doPush = async () => {
    if (!secret) return;
    set({ kind: 'busy', text: 'Wird hochgeladen …' });
    try {
      const at = await push(secret, state);
      setRemoteAt(at);
      set({ kind: 'done', text: `Hochgeladen um ${format(at)}.` });
    } catch (e) {
      set({ kind: 'error', text: e instanceof Error ? e.message : 'Fehlgeschlagen.' });
    }
  };

  const doPull = async () => {
    if (!secret) return;
    set({ kind: 'busy', text: 'Wird geholt …' });
    try {
      const remote = await pull(secret);
      if (!remote) {
        set({ kind: 'error', text: 'In der Ablage liegt noch nichts.' });
        return;
      }
      if (
        !window.confirm(
          `Stand vom ${format(remote.updatedAt)} übernehmen? Was auf diesem Gerät steht, wird ersetzt.`,
        )
      ) {
        set({ kind: 'idle' });
        return;
      }
      replaceState(remote.state);
      setRemoteAt(remote.updatedAt);
      set({ kind: 'done', text: 'Übernommen.' });
    } catch (e) {
      set({ kind: 'error', text: e instanceof Error ? e.message : 'Fehlgeschlagen.' });
    }
  };

  if (!secret) {
    return (
      <div className="space-y-4">
        <p className="text-[0.88rem] leading-relaxed text-ink-400 dark:text-paper-200/60">
          Ein Sync-Schlüssel verbindet deine Geräte. Er wird auf diesem Gerät
          erzeugt und auf dem anderen eingetragen — danach gleichen beide über
          dieselbe Ablage ab. Alles wird vorher im Browser verschlüsselt: der
          Server sieht nur unlesbaren Text.
        </p>

        <button
          type="button"
          onClick={() => activate(createSecret())}
          className="btn-solid w-full justify-center"
        >
          Neuen Sync-Schlüssel erzeugen
        </button>

        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-paper-300 dark:bg-ink-600" />
          <span className="text-[0.76rem] text-ink-300">oder vorhandenen eintragen</span>
          <span className="h-px flex-1 bg-paper-300 dark:bg-ink-600" />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            activate(draft);
          }}
          className="flex gap-2"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="ABCDEF-GHJKLM-…"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            className="field flex-1 font-mono tracking-wide"
          />
          <button type="submit" className="btn-quiet shrink-0" disabled={!draft.trim()}>
            Verbinden
          </button>
        </form>

        {status.kind === 'error' && (
          <p className="text-[0.85rem] text-wine-500 dark:text-wine-300">{status.text}</p>
        )}
      </div>
    );
  }

  const pretty = secret.replace(/(.{6})(?=.)/g, '$1-');

  return (
    <div className="space-y-4">
      <div>
        <p className="label mb-2">Dein Sync-Schlüssel</p>
        <div className="flex gap-2">
          <code className="field flex-1 select-all font-mono text-[0.9rem] tracking-wide">
            {pretty}
          </code>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(pretty).then(
                () => set({ kind: 'done', text: 'Schlüssel kopiert.' }),
                () => set({ kind: 'error', text: 'Kopieren ging nicht — bitte markieren.' }),
              );
            }}
            className="btn-quiet shrink-0"
          >
            Kopieren
          </button>
        </div>
        <p className="mt-2 text-[0.8rem] leading-relaxed text-ink-300 dark:text-paper-200/45">
          Trag ihn auf dem anderen Gerät ein. Wer ihn hat, kann deine Daten lesen —
          also behandle ihn wie ein Passwort. Verloren heißt verloren: ohne ihn
          lässt sich die Ablage nicht mehr entschlüsseln.
        </p>
      </div>

      <div className="grid gap-2 border-t rule pt-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={doPush}
          disabled={status.kind === 'busy'}
          className="btn-solid justify-center"
        >
          Auf dieses Gerät → Ablage
        </button>
        <button
          type="button"
          onClick={doPull}
          disabled={status.kind === 'busy'}
          className="btn-quiet justify-center"
        >
          Ablage → dieses Gerät
        </button>
      </div>

      <p className="text-[0.82rem] text-ink-300 dark:text-paper-200/45">
        {remoteAt
          ? `In der Ablage liegt der Stand vom ${format(remoteAt)}.`
          : 'In der Ablage liegt noch nichts.'}
      </p>

      {status.kind !== 'idle' && (
        <p
          className={cx(
            'text-[0.85rem]',
            status.kind === 'error'
              ? 'text-wine-500 dark:text-wine-300'
              : 'text-ink-400 dark:text-paper-200/60',
          )}
        >
          {status.text}
        </p>
      )}

      <button
        type="button"
        onClick={() => {
          if (
            window.confirm(
              'Diese Geräteverbindung trennen? Die Daten in der Ablage bleiben bestehen; ohne den Schlüssel kommst du aber nicht mehr heran.',
            )
          ) {
            writeSecret(null);
            setSecret(null);
            setRemoteAt(null);
            set({ kind: 'idle' });
          }
        }}
        className="text-[0.8rem] text-ink-300 underline-offset-2 hover:text-wine-500 hover:underline"
      >
        Verbindung auf diesem Gerät trennen
      </button>
    </div>
  );
}
