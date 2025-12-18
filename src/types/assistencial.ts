/**
 * Tipos para módulos assistenciais
 */

export interface FilterParams {
  period?: 'today' | 'week' | 'month' | 'quarter' | 'year';
  startDate?: string;
  endDate?: string;
  sector?: string;
  specialty?: string;
  insurance?: string;
  category?: string;
  status?: string;
}

// Atendimentos
export type AtendimentoStatus = 'waiting' | 'in_progress' | 'completed' | 'cancelled';

export interface Atendimento {
  id: string;
  patientId: string;
  patientName: string;
  specialty: string;
  insurance: string;
  status: AtendimentoStatus;
  startTime: string;
  endTime?: string;
  waitTime?: number;
  doctorName?: string;
}

// Internação
export type InternacaoStatus = 'active' | 'discharged' | 'transferred';
export type LeitoStatus = 'available' | 'occupied' | 'maintenance';

export interface Internacao {
  id: string;
  patientId: string;
  patientName: string;
  bedId: string;
  bedNumber: string;
  sector: string;
  admissionDate: string;
  expectedDischargeDate?: string;
  status: InternacaoStatus;
  doctorName?: string;
}

export interface Leito {
  id: string;
  number: string;
  sector: string;
  status: LeitoStatus;
  patientId?: string;
  patientName?: string;
}

// Agendas
export type AgendamentoStatus = 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export interface Agendamento {
  id: string;
  patientId: string;
  patientName: string;
  specialty: string;
  doctorName: string;
  date: string;
  time: string;
  status: AgendamentoStatus;
  notes?: string;
}

// Exames Laboratoriais
export interface ExameLaboratorial {
  id: string;
  patientId: string;
  patientName: string;
  examType: string;
  requestedDate: string;
  completedDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  results?: Record<string, unknown>;
}

// Farmácia
export interface Medicamento {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  lastUpdate: string;
}

// UTI
export interface UTIPatient {
  id: string;
  patientId: string;
  patientName: string;
  bedId: string;
  admissionDate: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'stable' | 'unstable' | 'critical';
}

// CCIH
export interface CCIHRecord {
  id: string;
  patientId: string;
  patientName: string;
  infectionType: string;
  date: string;
  status: 'active' | 'resolved' | 'monitoring';
  severity: 'low' | 'medium' | 'high';
}

// KPIs específicos por módulo
export interface InternacaoKPI {
  taxaOcupacao: { value: number; setor: string; total: number; ocupados: number };
  leitosDisponiveis: { value: number; total: number; setor: string };
  tempoMedioInternacao: { value: number; unit: 'dias' };
  altasPrevistas: { value: number; data: string };
}

export interface OcupacaoPorSetor {
  setor: string;
  ocupados: number;
  total: number;
  taxa: number;
}

export interface AgendasKPI {
  agendamentosHoje: { value: number; trend?: number };
  taxaComparecimento: { value: number; period: string };
  taxaNoShow: { value: number; period: string };
  agendamentosConfirmados: { value: number };
}

export interface AgendamentoPorDia {
  date: string;
  count: number;
}

export interface ExamesKPI {
  examesPendentes: { value: number };
  examesRealizados: { value: number; date: string };
  tempoMedioProcessamento: { value: number; unit: 'horas' };
  taxaConclusao: { value: number; period: string };
}

export interface FarmaciaKPI {
  medicamentosEstoque: { value: number; description: string };
  medicamentosCriticos: { value: number };
  dispensacoesHoje: { value: number };
  valorTotalEstoque: { value: number; format: 'currency' };
}

export interface UTIKPI {
  ocupacaoUTI: { value: number; ocupados: number; total: number };
  pacientesCriticos: { value: number };
  tempoMedioPermanencia: { value: number; unit: 'dias' };
  ocupacaoPorSeveridade: { severity: string; count: number }[];
}

export interface OcupacaoUTI {
  setor: string;
  ocupados: number;
  total: number;
  taxa: number;
}

export interface CCIHKPI {
  infeccoesAtivas: { value: number; period: string };
  infeccoesResolvidas: { value: number; period: string };
  taxaInfeccao: { value: number; unit: 'percentage' };
  casosPorTipo: { tipo: string; count: number }[];
}

export interface InfecaoPorTipo {
  tipo: string;
  count: number;
}

// Novos tipos para métricas expandidas de atendimentos
export interface AtendimentoPorConvenio {
  id: string;
  patientId: string;
  patientName: string;
  insurance: string;
  convenio?: string;
  centroCusto?: string;
  prestador?: string;
  specialty?: string;
  tipoAtendimento: string;
  startTime: string;
  endTime?: string;
}

export interface LeitoDetalhado {
  codigoLeito: string;
  leitoDia?: string;
  codigoAcomodacao?: string;
  centroCusto: string;
  numeroAtendimentoAtual?: string;
  paciente?: string;
  dataEntrada?: string;
  diasInternado?: number;
  plano?: string;
  convenio?: string;
  statusLeito?: string;
}

export interface OcupacaoLeitos {
  codigoCentroCusto: string;
  centroCusto: string;
  totalLeitosOperacionais: number;
  leitosOcupados: number;
  taxaOcupacaoPercentual: number;
  classificacaoOcupacao: string;
}

export interface LeitosDia {
  codigoCentroCusto: string;
  centroCusto: string;
  totalLeitosDia: number;
  mediaLeitosOcupadosDia: number;
  picoOcupacao: number;
  minimoOcupacao: number;
}

export interface OcupacaoPorConvenio {
  codigoConvenio: string;
  convenio: string;
  totalInternacoes: number;
  leitosOcupados: number;
  mediaPermanenciaDias: number;
  totalPacienteDia: number;
}

export interface OcupacaoPorEspecialidadeLeitos {
  codigoEspecialidade: string;
  especialidade: string;
  totalInternacoesAtivas: number;
  leitosOcupados: number;
  centrosCustoEnvolvidos: number;
  mediaPermanenciaDias: number;
}

export interface AlertaOcupacao {
  codigoCentroCusto: string;
  centroCusto: string;
  totalLeitos: number;
  leitosOcupados: number;
  leitosDisponiveis: number;
  taxaOcupacaoPercentual: number;
  alerta: string;
  alertaCritico?: string;
  statusOperacional?: string;
}

export interface TotalLeitos {
  codigoCentroCusto: string;
  centroCusto: string;
  totalLeitos: number;
  leitosAtivos: number;
  leitosBloqueados: number;
  leitosManutencao: number;
  leitosDesativados: number;
}

export interface ServicosPorEspecialidade {
  codigoEspecialidade: string;
  especialidade: string;
  totalAtendimentos: number;
  totalPacientes: number;
  internacoes: number;
  ambulatorio: number;
  urgencia: number;
  mediaPermanenciaDias?: number;
}

// Expandir AtendimentosKPI
export interface AtendimentosKPI {
  // Métricas existentes
  total: number;
  tempo_medio_minutos: number;
  ocupacao_por_especialidade: Array<{
    specialty: string;
    total: number;
    ativos: number;
  }>;
  por_tipo: Array<{
    tipo: string;
    total: number;
  }>;
  
  // Novas métricas - Atendimentos por Convênio
  atendimentos_sus?: number;
  atendimentos_convenios?: number;
  atendimentos_particulares?: number;
  
  // Novas métricas - Leitos
  leitos_ocupados?: number;
  leitos_livres?: number;
  leitos_total?: number;
  taxa_ocupacao_leitos?: number;
  
  // Ocupação detalhada
  ocupacao_por_convenio?: OcupacaoPorConvenio[];
  ocupacao_por_especialidade_leitos?: OcupacaoPorEspecialidadeLeitos[];
  
  // Leitos-Dia
  leitos_dia_total?: number;
  leitos_dia_ocupados?: number;
  
  // Alertas
  alertas_ocupacao_alta?: AlertaOcupacao[];
  alertas_ocupacao_critica?: AlertaOcupacao[];
}

