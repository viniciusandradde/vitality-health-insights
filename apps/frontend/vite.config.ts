import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Detecta ambiente Docker pela existência do arquivo /.dockerenv
  const isDocker = fs.existsSync('/.dockerenv');
  // Se Docker, SEMPRE usa backend:8000. Senão, usa localhost:8000
  const apiTarget = isDocker ? "http://backend:8000" : "http://localhost:8000";
  console.log(`[vite] Docker: ${isDocker}, Proxy target: ${apiTarget}`);
  
  return {
    server: {
      host: "::",
      port: 3000,
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
