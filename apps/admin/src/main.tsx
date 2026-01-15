import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

console.log("🚀 Admin app starting...");
console.log("📍 Location:", window.location.href);
console.log("📄 Document title:", document.title);
console.log("🔍 Root element:", document.getElementById("root"));

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
