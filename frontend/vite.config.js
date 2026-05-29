import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,           // 0.0.0.0 — LAN 전역 노출
    port: 5173,
    strictPort: true,
    proxy: {
      '/auth': { target: 'http://localhost:3001', changeOrigin: true },
      '/api':  { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
});
