import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';
import type { PluginOption } from 'vite';

export default defineConfig({
  plugins: [
    react() as PluginOption,
    compression() as PluginOption,
    visualizer({
      open: true,
      gzipSize: true
    }) as PluginOption
  ],
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material'],
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@mui/material']
  },
  server: {
    cors: true,
    proxy: {
      '/api': {
        target: 'http://47.93.216.125:7777',
        changeOrigin: true
      }
    }
  }
}); 