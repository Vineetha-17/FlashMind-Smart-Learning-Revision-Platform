import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'LearnLoop'
const base = process.env.VITE_BASE_PATH || (process.env.GITHUB_ACTIONS ? `/${repoName}/` : '/')

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
  ],
})
