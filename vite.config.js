import { defineConfig } from 'vite';

export default defineConfig({
  // Keep the build deployable below any URL prefix (for example /viewer/).
  base: './',
  server: {
    port: 5173,
    open: false,
  },
});
