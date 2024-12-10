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
          //       target:'http://127.0.0.1:5555',
          //       changeOrigin: true,
          //       secure: true,
          //     }
          // }
      },
      plugins: [react()],
  };
});
