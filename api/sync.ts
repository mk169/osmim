import { list, put } from '@vercel/blob';

/**
 * Ablage für die Synchronisation zwischen Geräten.
 *
 * Der Server sieht ausschließlich verschlüsselten Text. Der Schlüssel zum
 * Entschlüsseln verlässt den Browser nie — hier kommt nur eine daraus
 * abgeleitete Kennung an, aus der sich das Geheimnis nicht zurückrechnen
 * lässt. Ein Blick in den Speicher zeigt also nichts Lesbares.
 */
export const config = { runtime: 'edge' };

/** Aus dem Geheimnis abgeleitet: 32 Hex-Zeichen, sonst nichts. */
const ID = /^[a-f0-9]{32}$/;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const id = url.searchParams.get('id') ?? '';

  if (!ID.test(id)) {
    return json({ error: 'Ungültige Kennung.' }, 400);
  }

  const path = `sync/${id}.json`;

  try {
    if (request.method === 'GET') {
      const { blobs } = await list({ prefix: path, limit: 1 });
      const hit = blobs.find((b) => b.pathname === path);
      if (!hit) return json({ found: false });

      const stored = await fetch(hit.url, { cache: 'no-store' });
      if (!stored.ok) return json({ found: false });

      const payload = await stored.json();
      return json({ found: true, ...payload });
    }

    if (request.method === 'PUT') {
      const body = (await request.json()) as {
        updatedAt?: unknown;
        iv?: unknown;
        ciphertext?: unknown;
      };

      if (
        typeof body.updatedAt !== 'string' ||
        typeof body.iv !== 'string' ||
        typeof body.ciphertext !== 'string'
      ) {
        return json({ error: 'Unvollständige Daten.' }, 400);
      }

      const payload = {
        updatedAt: body.updatedAt,
        iv: body.iv,
        ciphertext: body.ciphertext,
      };

      await put(path, JSON.stringify(payload), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
        cacheControlMaxAge: 0,
      });

      return json({ ok: true, updatedAt: payload.updatedAt });
    }

    return json({ error: 'Methode nicht erlaubt.' }, 405);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unbekannter Fehler';
    // Fehlt der Speicher, sagt die Oberfläche das verständlich weiter.
    return json({ error: `Speicher nicht erreichbar: ${message}` }, 500);
  }
}
