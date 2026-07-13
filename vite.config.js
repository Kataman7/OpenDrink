import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: '/OpenDrink/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    host: true,
  },
});
