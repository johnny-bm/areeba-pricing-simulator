import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - only in build mode
    process.env.ANALYZE_BUNDLE && visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/tests": path.resolve(__dirname, "./tests"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React libraries
          if (id.includes('react') && !id.includes('react-router')) {
            return 'react-core';
          }
          
          // React Router
          if (id.includes('react-router')) {
            return 'react-router';
          }
          
          // Supabase
          if (id.includes('@supabase')) {
            return 'supabase';
          }
          
          // Radix UI components
          if (id.includes('@radix-ui')) {
            return 'radix-ui';
          }
          
          // Icons
          if (id.includes('lucide-react')) {
            return 'icons';
          }
          
          // PDF generation libraries
          if (id.includes('jspdf') || id.includes('html2canvas')) {
            return 'pdf-libs';
          }
          
          // Chart libraries
          if (id.includes('recharts') || id.includes('chart.js')) {
            return 'charts';
          }
          
          // Security libraries
          if (id.includes('dompurify')) {
            return 'security';
          }
          
          // Admin features
          if (id.includes('src/features/admin')) {
            return 'admin';
          }
          
          // PDF Builder features
          if (id.includes('src/features/pdfBuilder')) {
            return 'pdf-builder';
          }
          
          // Configuration features
          if (id.includes('src/features/configuration')) {
            return 'configuration';
          }
          
          // Auth features
          if (id.includes('src/features/auth')) {
            return 'auth';
          }
          
          // Pricing features
          if (id.includes('src/features/pricing')) {
            return 'pricing';
          }
          
          // Core domain
          if (id.includes('src/core')) {
            return 'core';
          }
          
          // Utils
          if (id.includes('src/utils')) {
            return 'utils';
          }
          
          // Components
          if (id.includes('src/components')) {
            return 'components';
          }
          
          // Node modules that don't fit above categories
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
    hmr: {
      overlay: false, // Disable error overlay for faster refresh
    },
    watch: {
      usePolling: false, // Use native file watching
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
    },
  },
  preview: {
    port: 3000,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
    ],
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
})