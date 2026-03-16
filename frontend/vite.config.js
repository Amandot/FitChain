import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],

    // Dev proxy — avoids CORS issues during local development
    server: {
      host: true, // bind to 0.0.0.0 — fixes IPv4/IPv6 mismatch (127.0.0.1 vs ::1)
      hmr: {
        host: 'localhost',
      },
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
      // Chunk splitting for better caching
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'vendor';
            if (id.includes('node_modules/framer-motion')) return 'motion';
            if (id.includes('node_modules/stellar-sdk') || id.includes('node_modules/@stellar')) return 'stellar';
            if (id.includes('node_modules/leaflet') || id.includes('node_modules/react-leaflet')) return 'map';
          },
        },
      },
    },
  }
})
