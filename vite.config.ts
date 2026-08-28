import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages 用 /First/；Vercel 等根路径部署用 /
const base = process.env.VITE_BASE_PATH ?? '/First/'

export default defineConfig({
  plugins: [react()],
  base,
})
