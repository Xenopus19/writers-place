import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // expose BACKEND_URL (Vite only exposes prefixed vars by default)
  envPrefix: ['VITE_', 'BACKEND_'],
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
