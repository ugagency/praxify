import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.', // Root is the current directory where index.html (landing) and src/ exist
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        app: resolve(__dirname, 'src/index.html'),
        login: resolve(__dirname, 'src/login.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});

// force refresh

// force refresh again

// force refresh try 3

// force refresh try 4

// force refresh try 5

// force refresh try 6
