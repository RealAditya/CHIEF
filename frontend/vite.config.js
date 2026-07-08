import { defineConfig } from 'vite'

// Minimal config: no react plugin to avoid peer dependency conflicts in some
// environments. Vite's esbuild supports JSX for development.
export default defineConfig({
  root: '.',
})
