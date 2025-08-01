import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // "192.168.0.101" -дом
    // "192.168.1.124"
    host:"192.168.0.101",


    proxy:{
      '/api':{

        target:'http://localhost:8080',
        changeOrigin:true,
        rewrite:(path) => path
      },



    }
  }
})
