import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const proxyTarget = process.env.VITE_PROXY_TARGET || 'http://localhost:3000';
const defaultAllowedHosts = ['localhost', '127.0.0.1', 'app.gardenwjs.tech'];
const envAllowedHosts = process.env.VITE_ALLOWED_HOSTS
  ? process.env.VITE_ALLOWED_HOSTS.split(',').map((h) => h.trim()).filter(Boolean)
  : [];
const allowedHosts = Array.from(new Set([...defaultAllowedHosts, ...envAllowedHosts]));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts,
    proxy: {
      // Encaminha chamadas /api -> backend em http://localhost:3000
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
});
