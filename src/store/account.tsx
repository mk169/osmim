import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { STATE_TABLE, getSupabase, supabaseConfigured } from '../lib/supabase';
import type { AppState } from '../types';

/**
 * Profil und Anmeldung.
 *
 * Ein Profil je Person, eine Zeile je Profil. Die Zeile gehört über
 * `user_id` zum angemeldeten Konto; die Datenbank gibt sie über eine
 * Sicherheitsregel niemandem sonst heraus.
 */

export type AuthState =
  | { kind: 'unconfigured' }
  | { kind: 'loading' }
  | { kind: 'signedOut' }
  | { kind: 'signedIn'; email: string; userId: string };

interface AccountValue {
  auth: AuthState;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  /** Holt den Stand des Profils. `null`, wenn dort noch keiner liegt. */
  loadRemote: () => Promise<{ state: AppState; updatedAt: string } | null>;
  /** Legt den Stand im Profil ab. */
  saveRemote: (state: AppState) => Promise<string>;
}

const AccountContext = createContext<AccountValue | null>(null);

/** Wirft verständlich, wenn kein Profil-Dienst eingerichtet ist. */
async function required(): Promise<SupabaseClient> {
  const pending = getSupabase();
  if (!pending) throw new Error('Kein Profil-Dienst eingerichtet.');
  return pending;
}

function describe(error: { message?: string } | null): string {
  const raw = error?.message ?? '';
  if (/failed to fetch|networkerror|load failed/i.test(raw))
    return 'Der Profil-Dienst ist nicht erreichbar. Stimmen die Zugangsdaten des Projekts, und bist du online?';
  if (/invalid login credentials/i.test(raw))
    return 'E-Mail oder Passwort stimmen nicht.';
  if (/user already registered/i.test(raw))
    return 'Für diese E-Mail gibt es schon ein Profil. Melde dich einfach an.';
  if (/password should be at least/i.test(raw))
    return 'Das Passwort ist zu kurz — mindestens sechs Zeichen.';
  if (/email not confirmed/i.test(raw))
    return 'Bitte bestätige zuerst die E-Mail, die dir Supabase geschickt hat.';
  if (/relation .* does not exist/i.test(raw))
    return 'Die Tabelle fehlt noch in der Datenbank. Führe das SQL aus der README aus.';
  return raw || 'Unbekannter Fehler.';
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(
    supabaseConfigured ? { kind: 'loading' } : { kind: 'unconfigured' },
  );

  useEffect(() => {
    const pending = getSupabase();
    if (!pending) return;

    const apply = (session: Session | null) => {
      setAuth(
        session?.user
          ? {
              kind: 'signedIn',
              email: session.user.email ?? '',
              userId: session.user.id,
            }
          : { kind: 'signedOut' },
      );
    };

    let unsubscribe = () => {};
    void pending.then((sb) => {
      sb.auth.getSession().then(({ data }) => apply(data.session));
      const { data: sub } = sb.auth.onAuthStateChange((_e, session) => apply(session));
      unsubscribe = () => sub.subscription.unsubscribe();
    });
    return () => unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const sb = await required();
    const { error } = await sb.auth.signUp({ email, password });
    if (error) throw new Error(describe(error));
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const sb = await required();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw new Error(describe(error));
  }, []);

  const signOut = useCallback(async () => {
    const pending = getSupabase();
    if (!pending) return;
    await (await pending).auth.signOut();
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const sb = await required();
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw new Error(describe(error));
  }, []);

  const loadRemote = useCallback(async () => {
    const pending = getSupabase();
    if (!pending) return null;
    const sb = await pending;
    const { data, error } = await sb
      .from(STATE_TABLE)
      .select('data, updated_at')
      .maybeSingle();
    if (error) throw new Error(describe(error));
    if (!data?.data) return null;
    return {
      state: data.data as AppState,
      updatedAt: String(data.updated_at),
    };
  }, []);

  const saveRemote = useCallback(async (state: AppState) => {
    const sb = await required();
    const { data: userData } = await sb.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error('Nicht angemeldet.');

    const updatedAt = new Date().toISOString();
    const { error } = await sb
      .from(STATE_TABLE)
      .upsert(
        { user_id: userId, data: state, updated_at: updatedAt },
        { onConflict: 'user_id' },
      );
    if (error) throw new Error(describe(error));
    return updatedAt;
  }, []);

  const value = useMemo<AccountValue>(
    () => ({ auth, signUp, signIn, signOut, resetPassword, loadRemote, saveRemote }),
    [auth, signUp, signIn, signOut, resetPassword, loadRemote, saveRemote],
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount(): AccountValue {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error('useAccount muss innerhalb von AccountProvider stehen.');
  return ctx;
}
