import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // "192.168.0.102" -дом
    // "192.168.1.124"
    host:"192.168.1.124",


    proxy:{
      '/api':{

        target:'http://localhost:8080',
        changeOrigin:true,
        rewrite:(path) => path
      },

      '/ws':{
        target:'http://localhost:8080',
        changeOrigin:true,
        rewrite:(path) => path,
        ws:true
      },

      '/auth':{
        target:'http://localhost:8080',
        changeOrigin:true,
        rewrite:(path) => path
        //ws:true
      }



    },




  }
})
