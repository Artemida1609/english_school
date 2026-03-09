import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

const apiUrl = process.env.VITE_API_URL

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    proxy: apiUrl
      ? {
          '/api': { target: apiUrl, changeOrigin: true },
          '/socket.io': { target: apiUrl, ws: true },
        }
      : undefined,
  },
})
