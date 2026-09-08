import type { AppState } from '../types';
import { deriveId, normalizeSecret, open, seal } from '../lib/syncCrypto';

/**
 * Abgleich zwischen Geräten.
 *
 * Der Sync-Schlüssel liegt bewusst getrennt vom übrigen Zustand und wandert
 * nicht in den JSON-Export — ein Backup, das du weitergibst, verrät damit
 * nicht den Zugang zu deiner Ablage.
 */

const SECRET_KEY = 'personal-os-sync-secret';

export function readSecret(): string | null {
  try {
    return window.localStorage.getItem(SECRET_KEY);
  } catch {
    return null;
  }
}

export function writeSecret(secret: string | null): void {
  try {
    if (secret) window.localStorage.setItem(SECRET_KEY, normalizeSecret(secret));
    else window.localStorage.removeItem(SECRET_KEY);
  } catch {
    /* Privater Modus o. Ä. — die App bleibt ohne Abgleich benutzbar. */
  }
}

export interface RemoteState {
  updatedAt: string;
  state: AppState;
}

async function request(id: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(`/api/sync?id=${id}`, init);
  if (!res.ok) {
    let message = `Der Server antwortete mit ${res.status}.`;
    try {
      const body = await res.json();
      if (body?.error) message = String(body.error);
    } catch {
      /* Antwort ohne JSON — die allgemeine Meldung genügt. */
    }
    if (res.status === 404) {
      message =
        'Die Sync-Funktion ist an dieser Adresse nicht verfügbar. Sie läuft nur auf der Vercel-Fassung.';
    }
    throw new Error(message);
  }
  return res;
}

/** Holt den Stand aus der Ablage. `null`, wenn dort noch nichts liegt. */
export async function pull(secret: string): Promise<RemoteState | null> {
  const id = await deriveId(secret);
  const res = await request(id);
  const body = await res.json();
  if (!body?.found) return null;

  try {
    const state = await open<AppState>(secret, {
      iv: body.iv,
      ciphertext: body.ciphertext,
    });
    return { updatedAt: String(body.updatedAt), state };
  } catch {
    throw new Error(
      'Die Daten ließen sich nicht entschlüsseln. Stimmt der Sync-Schlüssel genau?',
    );
  }
}

/** Legt den aktuellen Stand verschlüsselt in der Ablage ab. */
export async function push(secret: string, state: AppState): Promise<string> {
  const id = await deriveId(secret);
  const updatedAt = new Date().toISOString();
  const sealed = await seal(secret, { ...state, updatedAt });

  await request(id, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ updatedAt, ...sealed }),
  });

  return updatedAt;
}
