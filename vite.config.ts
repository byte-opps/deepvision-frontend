import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
})
