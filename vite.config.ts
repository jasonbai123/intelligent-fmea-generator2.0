import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/',
      build: {
        outDir: 'docs',
        chunkSizeWarningLimit: 1000,
        sourcemap: mode === 'development',
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: mode === 'production',
            drop_debugger: mode === 'production',
            pure_funcs: mode === 'production' ? ['console.log', 'console.info', 'console.debug'] : []
          }
        },
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              if (id.includes('node_modules')) {
                if (id.includes('react') || id.includes('react-dom')) {
                  return 'react';
                }
                if (id.includes('lucide-react')) {
                  return 'lucide';
                }
                if (id.includes('xlsx') || id.includes('exceljs')) {
                  return 'xlsx';
                }
                if (id.includes('@google/genai')) {
                  return 'google';
                }
                if (id.includes('marked') || id.includes('dompurify')) {
                  return 'markdown';
                }
                return 'vendor';
              }
            },
            chunkFileNames: 'assets/[name]-[hash].js',
            entryFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash].[ext]'
          }
        }
      },
      server: {
        port: 3000,
        host: '0.0.0.0',
        strictPort: false,
        open: false
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL || 'https://iatf-cara-backend.baipj123.workers.dev'),
        'import.meta.env.VITE_APP_VERSION': JSON.stringify('1.0.0'),
        'import.meta.env.VITE_BUILD_TIME': JSON.stringify(new Date().toISOString())
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          '@components': path.resolve(__dirname, './components'),
          '@services': path.resolve(__dirname, './services'),
          '@config': path.resolve(__dirname, './config'),
          '@types': path.resolve(__dirname, './types'),
          '@utils': path.resolve(__dirname, './utils')
        }
      },
      optimizeDeps: {
        include: ['react', 'react-dom', 'lucide-react'],
        exclude: ['@google/genai']
      }
    };
});
