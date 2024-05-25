import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import {readdirSync} from 'fs'

const absolutePathAliases = {};
const srcPath = path.resolve('./src/');
const srcRootContent = readdirSync(srcPath, { withFileTypes: true }).map((dirent) => dirent.name.replace(/(\.js){1}(x?)/, ''));

srcRootContent.forEach((directory) => {
  absolutePathAliases[directory] = path.join(srcPath, directory);
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  outDir: "dist",

  resolve: {
    alias: {
      ...absolutePathAliases
    }
  },

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
