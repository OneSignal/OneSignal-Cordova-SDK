import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  plugins: [react()],
  build: {
    // lightningcss doesn't recognize Ionic's `:host-context()` selectors and
    // logs a warning per usage. esbuild minifies the CSS without complaining.
    cssMinify: 'esbuild',
  },
});
