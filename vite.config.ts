import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split heavy 3D libraries into a separate chunk
          'three-vendor': ['three', '@react-three/fiber', '@react-three/postprocessing', 'postprocessing'],
          // Split animation library
          'framer': ['framer-motion'],
        },
      },
    },
  },
})
