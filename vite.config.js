import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // 默认相对路径，本地/任意静态服务器可直接打开；
  // 部署 GitHub Pages 时由 CI 注入 VITE_BASE=/<repo名>/
  base: process.env.VITE_BASE || './',
  plugins: [vue()],
  server: {
    host: true,
    port: 5173
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1200
  }
})
