import { defineConfig } from 'vite';
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

export default defineConfig(() => ({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
}));
