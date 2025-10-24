import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [dts({ exclude: ['**/*.test.ts'], rollupTypes: true })],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: 'www/index.ts',
      formats: ['es'],
      fileName: () => 'index.js',
    },
  },
});
