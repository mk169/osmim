import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Auf GitHub Pages liegt die App unter /osmim/, lokal unter /.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/osmim/' : '/',
  plugins: [react()],
}));
