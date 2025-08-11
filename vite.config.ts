import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 自动复制 Cloudflare Pages 配置文件
    {
      name: 'copy-cloudflare-config',
      writeBundle() {
        try {
          copyFileSync(resolve(__dirname, '_headers'), resolve(__dirname, 'dist/_headers'))
          copyFileSync(resolve(__dirname, '_redirects'), resolve(__dirname, 'dist/_redirects'))
          console.log('✅ Cloudflare Pages 配置文件已复制到 dist/')
        } catch (error) {
          console.warn('⚠️ 复制 Cloudflare Pages 配置文件失败:', error)
        }
      }
    }
  ],
  base: './',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name].[hash].[ext]`;
          }
          if (/css/i.test(ext)) {
            return `assets/[name].[hash].[ext]`;
          }
          return `assets/[name].[hash].[ext]`;
        }
      }
    }
  }
})
