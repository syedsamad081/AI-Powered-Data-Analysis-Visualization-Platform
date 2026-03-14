import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Optional: uncomment to proxy API calls through Vite dev server
      // '/api': { target: 'http://localhost:5000', changeOrigin: true, rewrite: (p) => p.replace(/^\/api/, '') }
    },
  },
});
