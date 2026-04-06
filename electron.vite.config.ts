import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * electron-vite config — builds main, preload, and renderer in one pipeline.
 * externalizeDepsPlugin() marks 'electron' and Node built-ins as external
 * so they resolve to Electron's internal modules at runtime.
 */
export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({ exclude: [] })],
    build: {
      outDir: 'out/main',
      lib: {
        entry: 'electron/main.ts',
        formats: ['cjs'],
        fileName: () => 'main.js',
      },
      rollupOptions: {
        external: ['electron', 'electron-updater', 'electron-log'],
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin({ exclude: [] })],
    build: {
      outDir: 'out/preload',
      lib: {
        entry: 'electron/preload.ts',
        formats: ['cjs'],
        fileName: () => 'preload.js',
      },
      rollupOptions: {
        external: ['electron'],
      },
    },
  },
  renderer: {
    root: '.',
    plugins: [react(), tailwindcss()],
    resolve: {
      /* Force a single superdough instance — Vite may pre-bundle two copies
       * (one from @strudel/web, one standalone) causing a dead audio chain */
      dedupe: ['superdough', '@strudel/core', '@strudel/web', '@strudel/webaudio'],
    },
    optimizeDeps: {
      /* Force all strudel packages into a single pre-bundle group so
       * @strudel/core is only evaluated once in dev mode */
      include: [
        '@strudel/core',
        '@strudel/web',
        '@strudel/webaudio',
        '@strudel/mini',
        '@strudel/tonal',
        '@strudel/transpiler',
        'superdough',
      ],
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: 'index.html',
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
  },
})
