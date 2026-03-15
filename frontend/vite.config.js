import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],

    // Dev proxy — avoids CORS issues during local development
    server: {
      host: true, // bind to 0.0.0.0 — fixes IPv4/IPv6 mismatch (127.0.0.1 vs ::1)
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
          manualChunks: {
            vendor: ['react', 'react-dom'],
            motion: ['framer-motion'],
            stellar: ['stellar-sdk', '@stellar/freighter-api'],
            map: ['leaflet', 'react-leaflet'],
          },
        },
      },
    },
  }
})
