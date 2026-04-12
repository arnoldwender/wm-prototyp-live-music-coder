/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/* Vite config — React + Tailwind CSS v4 + Vitest
 * base: './' is required for Electron file:// protocol loading
 *
 * Note: sw.js cache-busting is handled by scripts/inject-sw-version.mjs
 * via the "postbuild" npm script — Vite 8 (Rolldown) plugin hooks fire
 * before Vite copies public/ assets, making in-plugin injection unreliable. */
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    /* Force single instances of audio packages to avoid dead audio chains
     * and duplicate @strudel/core state (the double-instance MIDI bug) */
    dedupe: ['superdough', '@strudel/core', '@strudel/web', '@strudel/webaudio', '@strudel/midi', '@strudel/draw', '@strudel/codemirror'],
  },
  optimizeDeps: {
    /* Pre-bundle all strudel packages together */
    include: [
      '@strudel/core',
      '@strudel/web',
      '@strudel/webaudio',
      '@strudel/mini',
      '@strudel/tonal',
      '@strudel/transpiler',
      '@strudel/midi',
      '@strudel/draw',
      '@strudel/codemirror',
      'superdough',
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
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
