import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 9080,
    host: true,
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:8090',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 9080,
    host: true,
  },
});
