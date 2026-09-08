import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAccount } from './account';
import { useStore } from './store';
import type { AppState } from '../types';

/**
 * Abgleich mit dem Profil.
 *
 * Angemeldet läuft er von selbst: beim Anmelden einmal holen, danach jede
 * Änderung gebündelt sichern, beim Zurückkommen ans Fenster nachsehen, ob
 * ein anderes Gerät inzwischen etwas geschrieben hat.
 *
 * Nur an einer Stelle wird gefragt: wenn beim ersten Anmelden auf einem
 * Gerät sowohl hier als auch im Profil Daten liegen. Dort still zu
 * entscheiden hieße, einem von beiden Ständen die Arbeit zu nehmen.
 */

export type SyncState =
  | { kind: 'off' }
  | { kind: 'working'; text: string }
  | { kind: 'ok'; at: string }
  | { kind: 'error'; text: string };

interface CloudSyncValue {
  sync: SyncState;
  /** Von Hand anstoßen — für den Knopf im Profil-Feld. */
  syncNow: () => Promise<void>;
}

const CloudSyncContext = createContext<CloudSyncValue | null>(null);

/** Enthält der Zustand etwas, das zu verlieren wehtäte? */
function hasContent(s: AppState): boolean {
  return (
    s.goals.length > 0 ||
    s.projects.length > 0 ||
    s.tasks.length > 0 ||
    s.journal.length > 0 ||
    s.events.length > 0 ||
    s.habits.length > 0 ||
    s.compass.creed.trim().length > 0
  );
}

const PUSH_DELAY = 1500;

export function CloudSyncProvider({ children }: { children: ReactNode }) {
  const { auth, loadRemote, saveRemote } = useAccount();
  const { state, replaceState } = useStore();
  const [sync, setSync] = useState<SyncState>({ kind: 'off' });

  const signedIn = auth.kind === 'signedIn';
  const initialised = useRef(false);
  /** Überspringt das Sichern direkt nach einem übernommenen Fremdstand. */
  const skipNextPush = useRef(false);
  const lastKnownRemote = useRef<string | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  /** Holt den Profilstand und übernimmt ihn, wenn er neuer ist. */
  const pullAndMaybeAdopt = useCallback(
    async (first: boolean) => {
      const remote = await loadRemote();

      if (!remote) {
        // Noch nichts im Profil — der hiesige Stand zieht ein.
        const at = await saveRemote(stateRef.current);
        lastKnownRemote.current = at;
        return at;
      }

      const localHasContent = hasContent(stateRef.current);
      const conflict =
        first && localHasContent && remote.updatedAt !== lastKnownRemote.current;

      if (conflict) {
        const when = new Date(remote.updatedAt).toLocaleString('de-DE', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        });
        const takeRemote = window.confirm(
          `Im Profil liegt ein Stand vom ${when}, und auf diesem Gerät stehen ebenfalls Daten.\n\n` +
            'OK: den Stand aus dem Profil übernehmen (dieses Gerät wird überschrieben).\n' +
            'Abbrechen: behalten, was hier steht, und ins Profil hochladen.',
        );
        if (!takeRemote) {
          const at = await saveRemote(stateRef.current);
          lastKnownRemote.current = at;
          return at;
        }
      } else if (remote.updatedAt === lastKnownRemote.current) {
        return remote.updatedAt;
      }

      skipNextPush.current = true;
      replaceState(remote.state);
      lastKnownRemote.current = remote.updatedAt;
      return remote.updatedAt;
    },
    [loadRemote, saveRemote, replaceState],
  );

  const run = useCallback(
    async (first: boolean, label: string) => {
      setSync({ kind: 'working', text: label });
      try {
        const at = await pullAndMaybeAdopt(first);
        setSync({ kind: 'ok', at });
      } catch (e) {
        setSync({
          kind: 'error',
          text: e instanceof Error ? e.message : 'Abgleich fehlgeschlagen.',
        });
      }
    },
    [pullAndMaybeAdopt],
  );

  // Beim Anmelden einmal abgleichen.
  useEffect(() => {
    if (!signedIn) {
      initialised.current = false;
      lastKnownRemote.current = null;
      setSync({ kind: 'off' });
      return;
    }
    if (initialised.current) return;
    initialised.current = true;
    void run(true, 'Profil wird geladen …');
  }, [signedIn, run]);

  // Änderungen gebündelt sichern.
  useEffect(() => {
    if (!signedIn || !initialised.current) return;
    if (skipNextPush.current) {
      skipNextPush.current = false;
      return;
    }
    const timer = window.setTimeout(async () => {
      setSync({ kind: 'working', text: 'Wird gesichert …' });
      try {
        const at = await saveRemote(stateRef.current);
        lastKnownRemote.current = at;
        setSync({ kind: 'ok', at });
      } catch (e) {
        setSync({
          kind: 'error',
          text: e instanceof Error ? e.message : 'Sichern fehlgeschlagen.',
        });
      }
    }, PUSH_DELAY);
    return () => window.clearTimeout(timer);
  }, [state, signedIn, saveRemote]);

  // Zurück am Fenster: nachsehen, ob ein anderes Gerät geschrieben hat.
  useEffect(() => {
    if (!signedIn) return;
    const onFocus = () => {
      if (document.visibilityState === 'visible') void run(false, 'Wird geprüft …');
    };
    window.addEventListener('visibilitychange', onFocus);
    return () => window.removeEventListener('visibilitychange', onFocus);
  }, [signedIn, run]);

  const value = useMemo<CloudSyncValue>(
    () => ({ sync, syncNow: () => run(false, 'Wird abgeglichen …') }),
    [sync, run],
  );

  return <CloudSyncContext.Provider value={value}>{children}</CloudSyncContext.Provider>;
}

export function useCloudSync(): CloudSyncValue {
  const ctx = useContext(CloudSyncContext);
  if (!ctx) throw new Error('useCloudSync muss innerhalb von CloudSyncProvider stehen.');
  return ctx;
}
