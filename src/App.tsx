import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import { ModulePage } from "./pages/ModulePage";
import NotFound from "./pages/NotFound";

// Configurações
import ConfiguracoesIndex from "./pages/configuracoes";
import PerfilPage from "./pages/configuracoes/PerfilPage";
import OrganizacaoPage from "./pages/configuracoes/OrganizacaoPage";
import EquipePage from "./pages/configuracoes/EquipePage";
import ModulosPage from "./pages/configuracoes/ModulosPage";
import IntegracoesPage from "./pages/configuracoes/IntegracoesPage";
import NotificacoesPage from "./pages/configuracoes/NotificacoesPage";
import SegurancaPage from "./pages/configuracoes/SegurancaPage";
import PlanoFaturamentoPage from "./pages/configuracoes/PlanoFaturamentoPage";

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
          <Route path="/assistencial/ambulatorio" element={<ModulePage title="Ambulatório" subtitle="Gestão ambulatorial" />} />
          <Route path="/assistencial/agendas" element={<ModulePage title="Agendas" subtitle="Gestão de agendamentos" />} />
          <Route path="/assistencial/agencia-transfusional" element={<ModulePage title="Agência Transfusional" subtitle="Controle de sangue e hemocomponentes" />} />
          <Route path="/assistencial/ccih" element={<ModulePage title="CCIH" subtitle="Controle de Infecção Hospitalar" />} />
          <Route path="/assistencial/exames-imagem" element={<ModulePage title="Exames de Imagem" subtitle="Gestão de exames de imagem" />} />
          <Route path="/assistencial/exames-lab" element={<ModulePage title="Exames Laboratoriais" subtitle="Análise de exames" />} />
          <Route path="/assistencial/farmacia" element={<ModulePage title="Farmácia" subtitle="Gestão farmacêutica" />} />
          <Route path="/assistencial/fisioterapia" element={<ModulePage title="Fisioterapia" subtitle="Análise de sessões e evolução" />} />
          <Route path="/assistencial/internacao" element={<ModulePage title="Internação" subtitle="Gestão de leitos e internações" />} />
          <Route path="/assistencial/nutricao" element={<ModulePage title="Nutrição" subtitle="Gestão nutricional e dietas" />} />
          <Route path="/assistencial/uti" element={<ModulePage title="UTI" subtitle="Unidade de Terapia Intensiva" />} />
          
          {/* Gerencial */}
          <Route path="/gerencial/estoque" element={<ModulePage title="Estoque" subtitle="Controle de estoque" />} />
          <Route path="/gerencial/faturamento" element={<ModulePage title="Faturamento" subtitle="Gestão de faturamento" />} />
          <Route path="/gerencial/financeiro" element={<ModulePage title="Financeiro" subtitle="Gestão financeira" />} />
          <Route path="/gerencial/higienizacao" element={<ModulePage title="Higienização" subtitle="Gestão de limpeza e higienização" />} />
          <Route path="/gerencial/lavanderia" element={<ModulePage title="Lavanderia" subtitle="Gestão de lavanderia e roupas" />} />
          <Route path="/gerencial/relatorios" element={<ModulePage title="Relatórios" subtitle="Relatórios gerenciais" />} />
          <Route path="/gerencial/sesmt" element={<ModulePage title="SESMT" subtitle="Serviço Especializado em Engenharia de Segurança e em Medicina do Trabalho" />} />
          <Route path="/gerencial/ti" element={<ModulePage title="TI" subtitle="Tecnologia da Informação" />} />
          
          {/* Configurações */}
          <Route path="/configuracoes" element={<ConfiguracoesIndex />} />
          <Route path="/configuracoes/perfil" element={<PerfilPage />} />
          <Route path="/configuracoes/organizacao" element={<OrganizacaoPage />} />
          <Route path="/configuracoes/equipe" element={<EquipePage />} />
          <Route path="/configuracoes/modulos" element={<ModulosPage />} />
          <Route path="/configuracoes/integracoes" element={<IntegracoesPage />} />
          <Route path="/configuracoes/notificacoes" element={<NotificacoesPage />} />
          <Route path="/configuracoes/seguranca" element={<SegurancaPage />} />
          <Route path="/configuracoes/plano" element={<PlanoFaturamentoPage />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
