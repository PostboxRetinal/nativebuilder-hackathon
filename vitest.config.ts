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
        // Baseline measured from current suite (see follow-up coverage plan).
        // Set just under the real numbers so the gate is green today but fails
        // on any regression. Raise as new component tests land.
        statements: 25,
        branches: 65,
        functions: 60,
        lines: 25,
      },
    },
  },
})
