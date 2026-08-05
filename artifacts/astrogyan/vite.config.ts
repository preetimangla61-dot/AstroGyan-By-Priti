import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    await import('@replit/vite-plugin-dev-banner').then(
      (m) => m.devBanner(),
    ).catch(() => []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '../..',
        '../..',
        'attached_assets',
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname, './'),
  build: {
    outDir: path.resolve(import.meta.dirname, '../../dist/public'),
    emptyOutDir: true,
  },
  server: {
    port: parseInt(process.env.PORT || '3000'),
    strictPort: false,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
