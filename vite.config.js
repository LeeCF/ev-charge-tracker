import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/ev-charge-tracker/',
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
