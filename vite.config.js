import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '192.168.0.102',
    proxy:{
      '/api':{

        target:'http://localhost:8080',
        changeOrigin:true,
        rewrite:(path) => path
      }
    }
  }
})
