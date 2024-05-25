import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    rollupOptions: {
      input: {
        app: '/src/App.jsx'
      },
      output: {
        entryFileNames: `assets/translatePopup.js`,
        chunkFileNames: `assets/translatePopup-chunk.js`,
        assetFileNames: `assets/translate.[ext]`,
      },
    },

  },
})


// export default defineConfig({
//   plugins: [react()],
// })
