import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => ({
  plugins: [
    react(),
    // Tailwind v3 via PostCSS — memory-friendly, no OOM
  ],
  server: {
    allowedHosts: true as const,
    hmr: false,
  },
  build: {
    target: 'esnext',
    minify: false,
    cssMinify: false,
    sourcemap: false,
    rollupOptions: {
      external: ['@supabase/supabase-js'],
      treeshake: false,
      maxParallelFileOps: 1,
    },
  },
}))
