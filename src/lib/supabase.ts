import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Verbindung zu Supabase — Anmeldung und Ablage der Daten.
 *
 * Die Bibliothek wird erst geladen, wenn sie gebraucht wird: ohne
 * eingerichtetes Profil zahlt niemand mit Ladezeit dafür, und selbst mit
 * Profil startet die App zuerst und holt die Anmeldung danach nach.
 *
 * Ist nichts eingerichtet, bleibt der Client `null`. Die App läuft dann
 * ohne Profil weiter: alles bleibt lokal, der Abgleich über Sync-Schlüssel
 * steht weiterhin zur Verfügung.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured = Boolean(url && anonKey);

/** Tabelle mit genau einer Zeile je Profil. */
export const STATE_TABLE = 'personal_os_state';

let client: Promise<SupabaseClient> | null = null;

export function getSupabase(): Promise<SupabaseClient> | null {
  if (!supabaseConfigured) return null;
  if (!client) {
    client = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(url as string, anonKey as string, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }),
    );
  }
  return client;
}
