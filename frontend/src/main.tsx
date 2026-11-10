import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./App";
import { inicializarAuth } from "./stores/auth";
import "./index.css";

// Importe de CSS base entra na tarefa 2 (design system — ADR-002).
const raiz = document.getElementById("root");
if (!raiz) {
  throw new Error("Elemento #root ausente no index.html");
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

void inicializarAuth().then(() => {
  createRoot(raiz).render(
  <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
  </StrictMode>
  );
});
