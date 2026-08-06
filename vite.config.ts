import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import csp from 'vite-plugin-csp-guard'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    ...react(),
    csp({
      // OWASP A05: CSP - self-only, no external CDNs
      dev: { run: true, outlierSupport: ['tailwind'] },
      build: { sri: true },
    }),
    // Tailwind v3 via PostCSS — memory-friendly, no OOM
  ],
  server: {
    allowedHosts: true,
    hmr: false,
  },
  build: {
    target: 'esnext',
    // NOTE: minify was `false` due to web container OOM.
    // On VPS/dev machines, esbuild minification is safe and recommended.
    // Revert to `false` only if OOM reappears.
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: 'hidden',
    rollupOptions: {
      // @supabase/supabase-js is external but bundled locally via importmap.
      // SRI not applicable — no CDN loading.
      external: ['@supabase/supabase-js'],
      treeshake: false,
    },
  },
})
