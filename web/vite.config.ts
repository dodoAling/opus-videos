import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    proxy: {
      '/data': 'http://127.0.0.1:8791',
      '/media': 'http://127.0.0.1:8791',
      '/dl': 'http://127.0.0.1:8791',
    },
  },
});
