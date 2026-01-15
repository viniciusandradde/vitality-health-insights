import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";

export default defineConfig(({ mode }) => {
  // Detecta ambiente Docker pela existência do arquivo /.dockerenv
  const isDocker = fs.existsSync('/.dockerenv');
  // Se Docker, SEMPRE usa backend:8000. Senão, usa localhost:8000
  const apiTarget = isDocker ? "http://backend:8000" : "http://localhost:8000";
  console.log(`[vite admin] Docker: ${isDocker}, Proxy target: ${apiTarget}`);
  
  return {
    server: {
      host: "::",
      port: 3001,
      watch: {
        ignored: ['**/.pnpm-store/**', '**/node_modules/.pnpm/**'],
      },
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
        },
      },
      // Headers para evitar cache em desenvolvimento
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    },
    // Limpar cache do Vite em cada build
    clearScreen: false,
    build: {
      emptyOutDir: true,
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
