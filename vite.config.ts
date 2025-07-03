import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3050,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})