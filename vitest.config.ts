import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    clearMocks: true,
    environment: 'happy-dom',
    include: ['**/*.test.ts', '**/*.test.tsx'],
    coverage: {
      exclude: ['mocks/**', 'www/helpers.ts'],
      enabled: true,
      reporter: ['text-summary', 'lcov'],
      reportOnFailure: true,
      reportsDirectory: 'coverage',
      thresholds: {
        statements: 95,
        branches: 95,
        functions: 95,
        lines: 95,
      },
    },
  },
});
