import { defineConfig } from 'vite-plus';

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  fmt: {
    singleQuote: true,
    sortImports: {
      enabled: true,
    },
  },
  lint: {
    plugins: ['react'],
    options: { typeAware: true, typeCheck: true },
    rules: {
      'react/exhaustive-deps': 'warn',
    },
  },
  pack: {
    entry: 'www/index.ts',
    dts: true,
    format: 'cjs',
    outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
  },
  test: {
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
