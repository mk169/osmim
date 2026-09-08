/**
 * Verschlüsselung für die Gerätesynchronisation.
 *
 * Aus einem einzigen Geheimnis — dem Sync-Schlüssel, den du von einem Gerät
 * aufs andere überträgst — entstehen zwei getrennte Dinge:
 *
 *   Kennung  (wo die Daten liegen)  — SHA-256 über das Geheimnis
 *   Schlüssel (womit sie gelesen werden) — HKDF über dasselbe Geheimnis
 *
 * Der Server bekommt nur die Kennung. Aus ihr lässt sich das Geheimnis nicht
 * zurückrechnen, also kann niemand außer dir den Inhalt lesen.
 */

const enc = new TextEncoder();
const dec = new TextDecoder();

/** Zeichenvorrat ohne 0/O und 1/I — beim Abtippen nicht zu verwechseln. */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Erzeugt einen neuen Sync-Schlüssel: 26 Zeichen, in Gruppen lesbar. */
export function createSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(26));
  const raw = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
  return raw.replace(/(.{6})(?=.)/g, '$1-');
}

/** Vereinheitlicht Eingaben: Großbuchstaben, ohne Trennzeichen. */
export function normalizeSecret(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, '0')).join('');
}

function toBase64(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

/** Gibt bewusst einen ArrayBuffer zurück — WebCrypto erwartet genau den. */
function fromBase64(s: string): ArrayBuffer {
  const bin = atob(s);
  const buffer = new ArrayBuffer(bin.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < bin.length; i += 1) view[i] = bin.charCodeAt(i);
  return buffer;
}

/** Die Kennung, unter der die Daten abgelegt werden. 32 Hex-Zeichen. */
export async function deriveId(secret: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    enc.encode(`personal-os-sync-id|${normalizeSecret(secret)}`),
  );
  return toHex(digest).slice(0, 32);
}

async function deriveKey(secret: string): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    enc.encode(normalizeSecret(secret)),
    'HKDF',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: enc.encode('personal-os-sync'),
      info: enc.encode('state-encryption'),
    },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export interface SealedState {
  iv: string;
  ciphertext: string;
}

export async function seal(secret: string, data: unknown): Promise<SealedState> {
  const key = await deriveKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(JSON.stringify(data)),
  );
  return { iv: toBase64(iv), ciphertext: toBase64(new Uint8Array(encrypted)) };
}

export async function open<T>(secret: string, sealed: SealedState): Promise<T> {
  const key = await deriveKey(secret);
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(sealed.iv) },
    key,
    fromBase64(sealed.ciphertext),
  );
  return JSON.parse(dec.decode(plain)) as T;
}
