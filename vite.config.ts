import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const buildHash = process.env.VITE_BUILD_HASH || 'dev'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8077,
    proxy: {
      '/api': {
        target: 'http://localhost:8076',
        changeOrigin: true,
      },
    },
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify('1.0.0'),
    'import.meta.env.VITE_BUILD_HASH': JSON.stringify(buildHash),
  },
})
