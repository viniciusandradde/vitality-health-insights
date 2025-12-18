import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Verificar se o elemento root existe
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Adicionar tratamento de erro global
window.addEventListener("error", (event) => {
  console.error("Global error:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
});

try {
  const root = createRoot(rootElement);
  root.render(<App />);
} catch (error) {
  console.error("Error rendering app:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1>Erro ao carregar aplicação</h1>
      <p>${error instanceof Error ? error.message : String(error)}</p>
      <p>Verifique o console do navegador para mais detalhes.</p>
    </div>
  `;
}
