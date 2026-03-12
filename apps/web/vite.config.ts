import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "https://english-school-1izu.onrender.com",
        changeOrigin: true,
        secure: false,
      },
      "/socket.io": {
        target: "https://english-school-1izu.onrender.com",
        changeOrigin: true,
        ws: true, // ← важливо для WebSocket
        secure: false,
      },
    },
  },
})