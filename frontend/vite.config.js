import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    // depending on your application, base can also be "/"
    base: '',
    plugins: [react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    })],
    server: {    
        // this ensures that the browser opens upon server start
        open: true,
        // this sets a default port to 3000  
        port: 3000, 
    },
    build: {
      outDir: 'build',
    }
})