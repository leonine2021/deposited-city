import { defineConfig } from 'vite'

// The repo `exhibition` is served at wenluguo.com/exhibition/. Each show lives in its own
// folder under it; this one builds into dist/deposited-city/ (→ /exhibition/deposited-city/).
// Asset paths stay relative, so the build works under any path.
export default defineConfig({
  base: './',
  build: { outDir: 'dist/deposited-city', emptyOutDir: true },
})
