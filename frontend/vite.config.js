import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    
      build: {
          outDir: 'build',
      },
      server: {
          proxy: {
              "/api":{
                target:'http://localhost:5555',
                changeOrigin: true,
                secure: false,
              }
          }
      },
      plugins: [react()],
  };
});
