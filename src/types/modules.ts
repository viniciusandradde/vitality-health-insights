import { LucideIcon } from 'lucide-react';

// Tipos base para módulos
export interface ModuleKPI {
  id: string;
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  description?: string;
}

export interface ModuleFilter {
  id: string;
  label: string;
  type: 'select' | 'date' | 'daterange' | 'text' | 'number';
  options?: { label: string; value: string }[];
  defaultValue?: string | string[];
  placeholder?: string;
}

export interface ChartData {
  [key: string]: string | number;
}

export interface TableColumn {
  id: string;
  label: string;
  accessor: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface ModuleData {
  kpis: ModuleKPI[];
  charts: {
    id: string;
    title: string;
    description?: string;
    type: 'line' | 'bar' | 'area' | 'pie' | 'gauge' | 'multi-line';
    data: ChartData[];
    config?: Record<string, any>;
  }[];
  table: {
    columns: TableColumn[];
    data: Record<string, any>[];
    pagination?: {
      page: number;
      pageSize: number;
      total: number;
    };
  };
}

// Tipos específicos por módulo
export interface Atendimento {
  id: string;
  paciente_id: string;
  paciente_nome: string;
  data: string;
  hora: string;
  especialidade: string;
  profissional: string;
  convenio: string;
  tipo: 'ambulatorial' | 'emergencia' | 'internacao';
  status: 'aguardando' | 'em_atendimento' | 'finalizado' | 'cancelado';
  tempo_espera_minutos?: number;
  valor?: number;
}

export interface AmbulatorioAgendamento {
  id: string;
  paciente_id: string;
  paciente_nome: string;
  data: string;
  hora: string;
  especialidade: string;
  profissional: string;
  status: 'agendado' | 'confirmado' | 'em_atendimento' | 'finalizado' | 'no_show' | 'cancelado';
  tipo: 'consulta' | 'retorno' | 'exame' | 'procedimento';
  observacoes?: string;
}

export interface Internacao {
  id: string;
  paciente_id: string;
  paciente_nome: string;
  data_internacao: string;
  data_alta?: string;
  leito: string;
  setor: string;
  tipo: 'enfermaria' | 'uti' | 'isolamento';
  diagnostico: string;
  status: 'internado' | 'alta_medica' | 'alta_pedida' | 'obito' | 'transferencia';
  dias_internacao?: number;
  convenio?: string;
  especialidade?: string;
}

export interface FinanceiroTransacao {
  id: string;
  tipo: 'receita' | 'despesa';
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
  status: 'pendente' | 'pago' | 'vencido' | 'cancelado';
  fornecedor?: string;
  paciente?: string;
}

export interface FaturamentoFatura {
  id: string;
  numero: string;
  paciente_id: string;
  paciente_nome: string;
  data_emissao: string;
  data_vencimento: string;
  valor: number;
  valor_pago?: number;
  status: 'pendente' | 'parcial' | 'pago' | 'glosado' | 'cancelado';
  convenio: string;
  tipo: 'consulta' | 'exame' | 'procedimento' | 'internacao';
}

export interface EstoqueItem {
  id: string;
  codigo: string;
  nome: string;
  categoria: string;
  quantidade_atual: number;
  quantidade_minima: number;
  unidade: string;
  fornecedor?: string;
  data_validade?: string;
  status: 'disponivel' | 'baixo_estoque' | 'vencido' | 'indisponivel';
}

// Laboratório
export interface LaboratorioExame {
  id: string;
  paciente_id: string;
  paciente_nome: string;
  data: string;
  tipo_exame: string;
  convenio: 'SUS' | 'convenio' | 'particular';
  valor: number;
  custo_estimado: number;
  centro_custo: string;
  externo: boolean;
  repeticao?: boolean;
}

// Imagem
export interface ImagemExame {
  id: string;
  paciente_id: string;
  paciente_nome: string;
  data: string;
  tipo_exame: string;
  convenio: 'SUS' | 'convenio' | 'particular';
  valor: number;
  custo_estimado: number;
  centro_custo: string;
  externo: boolean;
  repeticao?: boolean;
}

// Agência Transfusional
export interface TransfusionalProcedimento {
  id: string;
  paciente_id: string;
  paciente_nome: string;
  data: string;
  tipo_procedimento: string;
  convenio: 'SUS' | 'convenio' | 'particular';
  valor: number;
  custo_estimado: number;
  centro_custo: string;
  repeticao?: boolean;
}

// Nutrição
export interface NutricaoRefeicao {
  id: string;
  data: string;
  tipo: 'paciente' | 'acompanhante' | 'refeitorio';
  quantidade: number;
  custo: number;
  perda_marmitas: number;
  receita_convenio: number;
  receita_particular: number;
}

// Lavanderia
export interface LavanderiaInsumo {
  id: string;
  data: string;
  insumo: string;
  quantidade: number;
  custo: number;
  centro_custo: string;
}

// Higienização
export interface HigienizacaoInsumo {
  id: string;
  data: string;
  insumo: string;
  quantidade: number;
  custo: number;
  centro_custo: string;
}

// Hotelaria
export interface HotelariaRouparia {
  id: string;
  data: string;
  tipo: string;
  quantidade: number;
  perda_percentual: number;
  chamados_manutencao: number;
}

// SPP (Serviço de Prontuário)
export interface SPPProntuario {
  id: string;
  data_arquivamento?: string;
  data_solicitacao?: string;
  setor_solicitante?: string;
  justificativa?: string;
  tempo_resposta?: number; // em horas
  tipo_solicitacao?: 'setor' | 'paciente';
}

// TI
export interface TIChamado {
  id: string;
  data: string;
  centro_custo: string;
  tipo: string;
  status: 'aberto' | 'em_andamento' | 'resolvido' | 'cancelado';
  equipamento_id?: string;
  localizacao?: string;
}

export interface TIImpressao {
  id: string;
  data: string;
  centro_custo: string;
  quantidade: number;
  tipo: string;
}

export interface TIEquipamento {
  id: string;
  centro_custo: string;
  tipo: string;
  localizacao: string;
  estado: 'operacional' | 'manutencao' | 'critico' | 'indisponivel';
  alugado: boolean;
}

// Farmácia
export interface FarmaciaMedicamento {
  id: string;
  data: string;
  medicamento: string;
  quantidade: number;
  centro_custo: string;
  marca?: string;
  tipo: 'medicamento' | 'material';
  antimicrobiano?: boolean;
  retorno?: boolean;
}

// SESMT
export interface SESMTAcidente {
  id: string;
  data: string;
  tipo: string;
  gravidade: 'leve' | 'moderado' | 'grave' | 'fatal';
  centro_custo: string;
}

export interface SESMTTreinamento {
  id: string;
  data: string;
  tipo: string;
  participantes: number;
  centro_custo: string;
}

// CCIH
export interface CCIHInfeccao {
  id: string;
  paciente_id: string;
  paciente_nome: string;
  data: string;
  tipo_infeccao: string;
  topografia: string;
  isolamento: boolean;
  antimicrobiano: string;
  desfecho: 'alta' | 'obito' | 'em_tratamento';
  sitio_cirurgico?: boolean;
  iras?: boolean;
}

export interface CCIHIsolamento {
  id: string;
  paciente_id: string;
  paciente_nome: string;
  data_inicio: string;
  data_fim?: string;
  tipo_isolamento: 'precaucao_contato' | 'precaucao_goticulos' | 'precaucao_aerossol' | 'isolamento_total';
  motivo: string;
  dias_isolamento?: number;
}

// Fisioterapia
export interface FisioterapiaSessao {
  id: string;
  paciente_id: string;
  paciente_nome: string;
  data: string;
  tipo_tratamento: string;
  fisioterapeuta: string;
  evolucao: 'melhora' | 'estavel' | 'piora';
  comparecimento: boolean;
  duracao_minutos?: number;
}

export interface FisioterapiaPaciente {
  id: string;
  paciente_id: string;
  paciente_nome: string;
  data_inicio: string;
  data_alta?: string;
  tipo_tratamento: string;
  status: 'em_tratamento' | 'alta' | 'transferido';
  total_sessoes?: number;
  dias_tratamento?: number;
}

// UTI
export interface UTIInternacao {
  id: string;
  paciente_id: string;
  paciente_nome: string;
  data_internacao: string;
  data_alta?: string;
  apache_score?: number;
  ventilacao_mecanica: boolean;
  desfecho: 'alta' | 'obito' | 'transferencia' | 'em_internacao';
  dias_permanencia?: number;
  readmissao?: boolean;
}

export interface UTIVentilacao {
  id: string;
  paciente_id: string;
  data_inicio: string;
  data_fim?: string;
  dias_ventilacao?: number;
  tipo: 'invasiva' | 'nao_invasiva';
}
