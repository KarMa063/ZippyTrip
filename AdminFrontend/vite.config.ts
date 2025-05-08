import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      }
    }
  },
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    hmr: {
      overlay: false
    }
  },
  build: {
    rollupOptions: {
      external: ['pg-native']
    }
  }
})

// ... existing code ...
