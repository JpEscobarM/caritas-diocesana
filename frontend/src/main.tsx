import { createRoot } from "react-dom/client";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App.tsx";
import { Toaster } from "sonner";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />

      {/* Toaster serve para exibir as notificações de sucesso e erro em todas as páginas.
       Os componentes chamam toast.success() ou toast.error() e o Toaster
       é quem renderiza o aviso na tela, no canto superior direito nesse caso :). */}
      <Toaster richColors position="top-right" />

    </BrowserRouter>
  </React.StrictMode>,
);
