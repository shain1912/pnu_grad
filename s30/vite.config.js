import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  base: '/s30/',
  build: {
    rollupOptions: {
      input: {
        main:         resolve(__dirname, 'index.html'),
        about:        resolve(__dirname, 'about/index.html'),
        'about/aura': resolve(__dirname, 'about/aura.html'),
        'about/governance': resolve(__dirname, 'about/governance.html'),
        achievements: resolve(__dirname, 'achievements/index.html'),
        news:         resolve(__dirname, 'news/index.html'),
        partners:     resolve(__dirname, 'partners/index.html'),
        programs:     resolve(__dirname, 'programs/index.html'),
        roadmap:      resolve(__dirname, 'roadmap/index.html'),
      },
      output: {
        entryFileNames: `assets/[name]-refresh-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-refresh-${Date.now()}.js`,
        assetFileNames: `assets/[name]-refresh-${Date.now()}.[ext]`
      }
    }
  }
})
