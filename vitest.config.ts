import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Dedicated Vitest config. Kept separate from vite.config.ts on purpose so the
// CSP build plugin and the memory-sensitive production build settings never
// leak into the test environment.
export default defineConfig({
  plugins: [react()],
  // Mirror the production __APP_VERSION__ define so components that render it
  // (e.g. ConversationSidebar account footer) work under vitest too.
  define: {
    __APP_VERSION__: JSON.stringify('0.0.0-test'),
  },
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    globals: true,
    exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary'],
      exclude: [
        'src/types/models.ts',
        'src/lib/database.types.ts',
        'src/components/chat/index.ts',
      ],
      thresholds: {
        // Locked to observed coverage on 2026-08-10 after conversation UI
        // redesign (65.15/60.26/74.39/66.84). Floor set ~3pts below real so
        // the gate is green today but fails on any regression. Raise as new
        // tests land; never lower to mask one.
        statements: 62,
        branches: 57,
        functions: 71,
        lines: 64,
      },
    },
  },
})
