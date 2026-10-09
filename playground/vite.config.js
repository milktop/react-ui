import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Examples import the library by its package name, as an app would.
  resolve: { alias: { '@milktop/react-ui': fileURLToPath(new URL('../src/index.ts', import.meta.url)) } },
  server: { fs: { allow: ['..'] } },
})
