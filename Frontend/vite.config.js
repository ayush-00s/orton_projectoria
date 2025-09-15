import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwinndcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwinndcss(),
  ],
})
