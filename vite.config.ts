import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import YNQQLog from './log/index'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [YNQQLog(), vue()],
})
