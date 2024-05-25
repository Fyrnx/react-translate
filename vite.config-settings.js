import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        app: '/src/Settings.jsx'
      },
      output: {
        entryFileNames: `assets/settings.js`,
        chunkFileNames: `assets/settings-chunk.js`,
        assetFileNames: `assets/settings.[ext]`,
      },
    },
  },
})


// export default defineConfig({
//   plugins: [react()],
// })
