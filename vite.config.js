import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 只接受形如 /<repo>/ 的子路径；空值、'//' 这类协议相对路径一律回退到相对路径 './'
const rawBase = (process.env.VITE_BASE || '').trim()
const base = /^\/[^/](.*)\/$/.test(rawBase) ? rawBase : './'

export default defineConfig({
  // 相对路径，本地/任意静态服务器/GitHub Pages 子目录都能直接打开，无需知道仓库名
  base,
  plugins: [vue()],
  server: {
    // 监听 0.0.0.0：本机 localhost 和手机同一局域网都能访问
    host: true,
    port: 5173,
    strictPort: false
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1200
  }
})
