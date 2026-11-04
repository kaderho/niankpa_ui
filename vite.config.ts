import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// En développement, /api part vers l'API Django : pas de CORS à régler.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.NIANKPA_API_PROXY || 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
  }
})
