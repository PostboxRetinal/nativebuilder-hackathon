import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import csp from 'vite-plugin-csp-guard'
import { definePolicy, self, unsafeInline } from 'csp-toolkit'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    ...react(),
    csp({
      // OWASP A05: CSP - self-only, no external CDNs
      // Fixed 2026-08-07: default dev policy (`default-src 'self'`) blocked
      // Supabase + Speechmatics WS (no connect-src) and Vite's inline styles
      // (style-src-elem with hashes). Explicit policy adds the needed
      // connect-src, favicon/img hosts, and inline styles for dev/HMR.
      dev: { run: true, outlierSupport: ['tailwind'], override: false },
      build: { sri: true },
      policy: definePolicy({
        defaultSrc: [self],
        connectSrc: [
          self,
          'https://vpditxpomxixcijriyzg.supabase.co',
          'wss://vpditxpomxixcijriyzg.supabase.co',
          'wss://eu2.rt.speechmatics.com',
        ],
        scriptSrcElem: [self],
        styleSrcElem: [self, unsafeInline, 'https://fonts.googleapis.com'],
        imgSrc: [self, 'data:', 'https://www.google.com', 'https://*.gstatic.com'],
        fontSrc: [self, 'https://fonts.gstatic.com'],
      }),
    }),
    // Tailwind v3 via PostCSS — memory-friendly, no OOM
  ],
  server: {
    allowedHosts: true,
    hmr: true,
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
