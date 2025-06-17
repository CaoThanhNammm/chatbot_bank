import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow external connections
    port: 3000,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '6343-171-247-78-59.ngrok-free.app',
      '.ngrok-free.app' // Allow all ngrok-free.app subdomains
    ],
    proxy: {
      '/api': {
        target: 'http://192.168.101.7:5000', // Backend chạy trên IP 192.168.101.7
        changeOrigin: true,
        secure: false
      }
    }
  }
})
