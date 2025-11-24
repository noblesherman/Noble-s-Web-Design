import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const envDir = path.resolve(__dirname, 'frontend');
    const env = loadEnv(mode, envDir, '');
    const fallbackApi = mode === 'production'
      ? 'https://api.noblesweb.design'
      : 'http://localhost:4000';
    const apiUrl = env.VITE_API_URL || env.API_URL || fallbackApi;

    return {
      envDir,
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: apiUrl,
            changeOrigin: true,
            secure: false,
          },
          '/auth': {
            target: apiUrl,
            changeOrigin: true,
            secure: false,
          },
          '/admin/me': {
            target: apiUrl,
            changeOrigin: true,
            secure: false,
          },
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
