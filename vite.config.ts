import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/*
 * Der Basispfad hängt davon ab, wo die App liegt:
 *
 *   Vercel, eigene Domain, lokal   →  /          (Standard)
 *   GitHub Pages unter /osmim/     →  BASE_PATH=/osmim/
 *
 * Der Pages-Workflow setzt BASE_PATH; überall sonst bleibt es bei „/",
 * sodass ein Deploy ohne Konfiguration funktioniert.
 */

// Die Konfiguration läuft in Node, das Projekt selbst nur im Browser —
// deshalb hier eine schmale Deklaration statt der vollen Node-Typen.
declare const process: { env: Record<string, string | undefined> };

/**
 * Attrappe für /api/sync während der Entwicklung.
 *
 * In der Produktion übernimmt die Serverless-Funktion in api/sync.ts mit
 * echtem Speicher; hier genügt ein Objekt im Arbeitsspeicher, damit sich
 * der Abgleich lokal ausprobieren lässt. Läuft nur bei `npm run dev`.
 */
function syncMock(): Plugin {
  const store = new Map<string, unknown>();
  return {
    name: 'sync-mock',
    apply: 'serve',
    configureServer(server) {
      // Schmale Formen statt der Node-Typen, die das Projekt nicht lädt.
      type Req = {
        url?: string;
        method?: string;
        on: (event: string, cb: (chunk: unknown) => void) => void;
      };
      type Res = {
        statusCode: number;
        setHeader: (k: string, v: string) => void;
        end: (body?: string) => void;
      };

      server.middlewares.use('/api/sync', (rawReq, rawRes) => {
        const req = rawReq as unknown as Req;
        const res = rawRes as unknown as Res;
        const url = new URL(req.url ?? '', 'http://localhost');
        const id = url.searchParams.get('id') ?? '';
        const send = (body: unknown, status = 200) => {
          res.statusCode = status;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify(body));
        };

        if (!/^[a-f0-9]{32}$/.test(id)) return send({ error: 'Ungültige Kennung.' }, 400);

        if (req.method === 'GET') {
          const hit = store.get(id);
          return send(hit ? { found: true, ...(hit as object) } : { found: false });
        }

        if (req.method === 'PUT') {
          let raw = '';
          req.on('data', (c) => {
            raw += c;
          });
          req.on('end', () => {
            try {
              const body = JSON.parse(raw);
              store.set(id, body);
              send({ ok: true, updatedAt: body.updatedAt });
            } catch {
              send({ error: 'Ungültige Daten.' }, 400);
            }
          });
          return;
        }

        return send({ error: 'Methode nicht erlaubt.' }, 405);
      });
    },
  };
}

export default defineConfig(() => ({
  base: process.env.BASE_PATH || '/',
  plugins: [react(), syncMock()],
}));
