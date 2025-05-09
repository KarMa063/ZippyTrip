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
    port: 8087,  // Changed from 8082 to 8087 to avoid conflicts
    host: true,
    strictPort: false,  // Allow fallback to another port if 8087 is in use
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
