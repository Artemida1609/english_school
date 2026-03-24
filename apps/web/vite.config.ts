import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:4001",
        changeOrigin: true,
        secure: false,
      },
      "/socket.io": {
        target: "http://localhost:4001",
        changeOrigin: true,
        ws: true, // ← важливо для WebSocket
        secure: false,
      },
    },
  },
})