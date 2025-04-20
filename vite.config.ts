import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue({
    template: {
      compilerOptions: {
        isCustomElement: (tag) => false
      }
    }
  })],
  server: {
    port: 3000,
    open: true
  },
  build: {
    sourcemap: true
  }
}) 