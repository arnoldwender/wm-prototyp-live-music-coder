/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/* Vite config — React + Tailwind CSS v4 + Vitest */
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    /* Force a single superdough instance — Vite may pre-bundle two copies
     * (one from @strudel/web, one standalone) causing a dead audio chain */
    dedupe: ['superdough', '@strudel/core'],
  },
  build: {
    rollupOptions: {
      output: {
        /* Split heavy deps into separate chunks — loaded on demand */
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
