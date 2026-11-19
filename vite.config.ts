/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/* Vite config — React + Tailwind CSS v4 + Vitest
 * base: '/' — web/Netlify build uses root-relative paths.
 * Electron uses electron.vite.config.ts (base: './') independently.
 *
 * Note: sw.js cache-busting is handled by scripts/inject-sw-version.mjs
 * via the "postbuild" npm script — Vite 8 (Rolldown) plugin hooks fire
 * before Vite copies public/ assets, making in-plugin injection unreliable. */
const DIRT_SAMPLES_SHA = 'c74fc80f8db8038f6a33648ffef5ac00a07ad402'
const SOUNDFONTS_SHA = '23ca907d4370a04fd89ca483a92915e4d6159ab9'
const FIRST_PARTY_AUDIO_PROXY = {
  '/dirt-samples': {
    target: 'https://raw.githubusercontent.com',
    changeOrigin: true,
    rewrite: (p: string) =>
      `/tidalcycles/Dirt-Samples/${DIRT_SAMPLES_SHA}${p.slice('/dirt-samples'.length)}`,
  },
  '/soundfonts': {
    target: 'https://raw.githubusercontent.com',
    changeOrigin: true,
    rewrite: (p: string) =>
      `/felixroos/webaudiofontdata/${SOUNDFONTS_SHA}/sound${p.slice('/soundfonts'.length)}`,
  },
}

export default defineConfig({
  base: '/',
  server: {
    proxy: FIRST_PARTY_AUDIO_PROXY,
  },
  preview: {
    proxy: FIRST_PARTY_AUDIO_PROXY,
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    /* Force single instances of audio packages to avoid dead audio chains
     * and duplicate @strudel/core state (the double-instance MIDI bug) */
    dedupe: ['superdough', '@strudel/core', '@strudel/web', '@strudel/webaudio', '@strudel/soundfonts', '@strudel/midi', '@strudel/draw', '@strudel/codemirror'],
  },
  ssr: {
    /* Only the prerender's server bundle (vite build --ssr, scripts/prerender.mjs).
     * Vite leaves dependencies external there, and Node's ESM loader cannot read
     * the named exports of a CommonJS package: `import { compressToEncodedURIComponent }
     * from 'lz-string'` fails with "Named export … not found". Bundling it fixes that. */
    noExternal: ['lz-string'],
  },
  optimizeDeps: {
    /* Pre-bundle all strudel packages together */
    include: [
      '@strudel/core',
      '@strudel/web',
      '@strudel/webaudio',
      '@strudel/soundfonts',
      '@strudel/mini',
      '@strudel/tonal',
      '@strudel/transpiler',
      '@strudel/midi',
      '@strudel/draw',
      '@strudel/codemirror',
      '@strudel/xen',
      'superdough',
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/@strudel') || id.includes('node_modules/superdough')) return 'vendor-strudel'
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router') || id.includes('node_modules/zustand')) return 'vendor-react'
          if (id.includes('node_modules/@codemirror')) return 'vendor-codemirror'
          if (id.includes('node_modules/@xyflow')) return 'vendor-reactflow'
          if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) return 'vendor-i18n'
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
})
