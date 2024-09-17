import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    
      build: {
          outDir: 'dist',
      },
      server: {
          // proxy: {
          //     "/api":{
          //       target:'https://souschef-backend.vercel.app',
          //       changeOrigin: true,
          //       secure: true,
          //     }
          // }
      },
      plugins: [react()],
  };
});
