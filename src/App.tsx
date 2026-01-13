import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import { ModulePage } from "./pages/ModulePage";
import NotFound from "./pages/NotFound";

// Módulos Assistenciais
import AtendimentosPage from "./pages/modules/assistencial/AtendimentosPage";
import AmbulatorioPage from "./pages/modules/assistencial/AmbulatorioPage";
import AgendasPage from "./pages/modules/assistencial/AgendasPage";
import InternacaoPage from "./pages/modules/assistencial/InternacaoPage";
import LaboratorioPage from "./pages/modules/assistencial/LaboratorioPage";
import ImagemPage from "./pages/modules/assistencial/ImagemPage";
import TransfusionalPage from "./pages/modules/assistencial/TransfusionalPage";
import FarmaciaPage from "./pages/modules/assistencial/FarmaciaPage";
import CCIHPage from "./pages/modules/assistencial/CCIHPage";
import FisioterapiaPage from "./pages/modules/assistencial/FisioterapiaPage";
import UTIPage from "./pages/modules/assistencial/UTIPage";

// Módulos Gerenciais
import FinanceiroPage from "./pages/modules/gerencial/FinanceiroPage";
import FaturamentoPage from "./pages/modules/gerencial/FaturamentoPage";
import EstoquePage from "./pages/modules/gerencial/EstoquePage";
import NutricaoPage from "./pages/modules/gerencial/NutricaoPage";
import LavanderiaPage from "./pages/modules/gerencial/LavanderiaPage";
import HigienizacaoPage from "./pages/modules/gerencial/HigienizacaoPage";
import HotelariaPage from "./pages/modules/gerencial/HotelariaPage";
import SPPPage from "./pages/modules/gerencial/SPPPage";
import TIPage from "./pages/modules/gerencial/TIPage";
import SESMTPage from "./pages/modules/gerencial/SESMTPage";

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
          <Route path="/assistencial/atendimentos" element={<AtendimentosPage />} />
          <Route path="/assistencial/ambulatorio" element={<AmbulatorioPage />} />
          <Route path="/assistencial/agendas" element={<AgendasPage />} />
          <Route path="/assistencial/agencia-transfusional" element={<TransfusionalPage />} />
          <Route path="/assistencial/ccih" element={<CCIHPage />} />
          <Route path="/assistencial/exames-imagem" element={<ImagemPage />} />
          <Route path="/assistencial/exames-lab" element={<LaboratorioPage />} />
          <Route path="/assistencial/farmacia" element={<FarmaciaPage />} />
          <Route path="/assistencial/fisioterapia" element={<FisioterapiaPage />} />
          <Route path="/assistencial/internacao" element={<InternacaoPage />} />
          <Route path="/assistencial/nutricao" element={<NutricaoPage />} />
          <Route path="/assistencial/uti" element={<UTIPage />} />
          
          {/* Gerencial */}
          <Route path="/gerencial/estoque" element={<EstoquePage />} />
          <Route path="/gerencial/faturamento" element={<FaturamentoPage />} />
          <Route path="/gerencial/financeiro" element={<FinanceiroPage />} />
          <Route path="/gerencial/higienizacao" element={<HigienizacaoPage />} />
          <Route path="/gerencial/lavanderia" element={<LavanderiaPage />} />
          <Route path="/gerencial/relatorios" element={<ModulePage title="Relatórios" subtitle="Relatórios gerenciais" />} />
          <Route path="/gerencial/sesmt" element={<SESMTPage />} />
          <Route path="/gerencial/ti" element={<TIPage />} />
          <Route path="/gerencial/hotelaria" element={<HotelariaPage />} />
          <Route path="/gerencial/spp" element={<SPPPage />} />
          
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
