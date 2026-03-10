import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default ({ mode }) => {
  // load .env files (including .env.local, .env.development, etc.)
  const env = loadEnv(mode, process.cwd(), '')

  return defineConfig({
    plugins: [react()],

    resolve: {
      alias: {
        src: resolve(__dirname, 'src'),
      },
    },

    server: {
      host: 'localhost',
      port: 5173,
      proxy: {
        '/api': {
          target: env.API_BASE_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  })
}
