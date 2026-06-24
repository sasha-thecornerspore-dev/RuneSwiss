import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// Standalone web build of the renderer — used for fast browser-based development/verification of the
// engine-backed panels. The Electron app uses electron.vite.config.ts. Panels guard window.api so
// AI/secrets features degrade gracefully outside Electron.
export default defineConfig({
  root: resolve(__dirname, 'src/renderer'),
  plugins: [react()],
  server: { port: 5273 },
})
