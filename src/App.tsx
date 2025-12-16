import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import { ModulePage } from "./pages/ModulePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          
          {/* Assistencial */}
          <Route path="/assistencial/atendimentos" element={<ModulePage title="Atendimentos" subtitle="Análise de atendimentos em tempo real" />} />
          <Route path="/assistencial/internacao" element={<ModulePage title="Internação" subtitle="Gestão de leitos e internações" />} />
          <Route path="/assistencial/agendas" element={<ModulePage title="Agendas" subtitle="Gestão de agendamentos" />} />
          <Route path="/assistencial/exames-lab" element={<ModulePage title="Exames Laboratoriais" subtitle="Análise de exames" />} />
          <Route path="/assistencial/farmacia" element={<ModulePage title="Farmácia" subtitle="Gestão farmacêutica" />} />
          <Route path="/assistencial/uti" element={<ModulePage title="UTI" subtitle="Unidade de Terapia Intensiva" />} />
          <Route path="/assistencial/ccih" element={<ModulePage title="CCIH" subtitle="Controle de Infecção Hospitalar" />} />
          
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
);

export default App;
