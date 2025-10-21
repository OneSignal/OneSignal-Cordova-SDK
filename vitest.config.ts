import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['**/*.test.ts', '**/*.test.tsx'],
    coverage: {
      enabled: true,
      reporter: ['lcov'],
      reportOnFailure: true,
      reportsDirectory: 'coverage',
    },
  },
});
