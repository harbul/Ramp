import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    // Same-origin in dev: /pdf/* and /api/* are proxied to the FastAPI backend,
    // so the browser makes no cross-origin request and there's no CORS to configure.
    proxy: {
      '/pdf': 'http://localhost:8000',
      '/api': 'http://localhost:8000',
    },
  },
})
