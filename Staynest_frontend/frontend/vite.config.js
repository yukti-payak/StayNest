import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    host: true, // Listens on all local IP addresses
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
  },
})