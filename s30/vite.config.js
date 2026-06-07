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
        'about/governance': resolve(__dirname, 'about/governance/index.html'),
        achievements: resolve(__dirname, 'achievements/index.html'),
        'achievements/robocup': resolve(__dirname, 'achievements/robocup/index.html'),
        'achievements/quantum': resolve(__dirname, 'achievements/quantum/index.html'),
        'achievements/papers': resolve(__dirname, 'achievements/papers/index.html'),
        'achievements/transfer': resolve(__dirname, 'achievements/transfer/index.html'),
        news:         resolve(__dirname, 'news/index.html'),
        partners:     resolve(__dirname, 'partners/index.html'),
        'partners/google':   resolve(__dirname, 'partners/google/index.html'),
        'partners/industry': resolve(__dirname, 'partners/industry/index.html'),
        'partners/global':   resolve(__dirname, 'partners/global/index.html'),
        'partners/govt':     resolve(__dirname, 'partners/govt/index.html'),
        programs:     resolve(__dirname, 'programs/index.html'),
        'programs/education': resolve(__dirname, 'programs/education/index.html'),
        'programs/research': resolve(__dirname, 'programs/research/index.html'),
        'programs/industry': resolve(__dirname, 'programs/industry/index.html'),
        'programs/infra': resolve(__dirname, 'programs/infra/index.html'),
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
