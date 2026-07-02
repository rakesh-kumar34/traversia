import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // relative asset paths so the static build works at any mount point
  // (rakeshcgk.com/algoarcade/, GitHub Pages, etc.)
  base: './',
})
