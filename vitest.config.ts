import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['tests/vitest.setup.ts'],
    // Exclude dist, engine tests (engine runs separately), and any tests inside node_modules (some packages ship tests that expect other runners).
    exclude: ['dist/**', 'engine/**', '**/node_modules/**']
  }
});
