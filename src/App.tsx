import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import { ModulePage } from "./pages/ModulePage";
import AtendimentosPage from "./pages/assistencial/AtendimentosPage";
import InternacaoPage from "./pages/assistencial/InternacaoPage";
import AgendasPage from "./pages/assistencial/AgendasPage";
import ExamesLabPage from "./pages/assistencial/ExamesLabPage";
import FarmaciaPage from "./pages/assistencial/FarmaciaPage";
import UTIPage from "./pages/assistencial/UTIPage";
import CCIHPage from "./pages/assistencial/CCIHPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            
            {/* Assistencial */}
            <Route path="/assistencial/atendimentos" element={<AtendimentosPage />} />
            <Route path="/assistencial/internacao" element={<InternacaoPage />} />
            <Route path="/assistencial/agendas" element={<AgendasPage />} />
            <Route path="/assistencial/exames-lab" element={<ExamesLabPage />} />
            <Route path="/assistencial/farmacia" element={<FarmaciaPage />} />
            <Route path="/assistencial/uti" element={<UTIPage />} />
            <Route path="/assistencial/ccih" element={<CCIHPage />} />
            
            {/* Gerencial */}
            <Route path="/gerencial/financeiro" element={<ModulePage title="Financeiro" subtitle="Gestão financeira" />} />
            <Route path="/gerencial/faturamento" element={<ModulePage title="Faturamento" subtitle="Gestão de faturamento" />} />
            <Route path="/gerencial/estoque" element={<ModulePage title="Estoque" subtitle="Controle de estoque" />} />
            <Route path="/gerencial/relatorios" element={<ModulePage title="Relatórios" subtitle="Relatórios gerenciais" />} />
            
            {/* Configurações */}
            <Route path="/configuracoes" element={<ModulePage title="Configurações" subtitle="Configurações do sistema" />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
