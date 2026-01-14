// Tipos específicos para o Dashboard

export interface Internacao {
  id: string;
  paciente_id: string;
  paciente_nome: string;
  data_entrada: string;
  data_saida?: string;
  centro_custo: string;
  medico: string;
  especialidade: string;
  classificacao_risco?: 'vermelho' | 'laranja' | 'amarelo' | 'verde' | 'azul';
  proveniencia: string;
  vinculado_ps: boolean;
  obito: boolean;
  dias_permanencia?: number;
  convenio?: string;
  leito_id?: string;
}

export interface Leito {
  id: string;
  numero: string;
  centro_custo: string;
  tipo: 'enfermaria' | 'uti' | 'neonatal' | 'outro';
  status: 'ocupado' | 'disponivel' | 'manutencao' | 'reservado';
  paciente_id?: string;
  paciente_nome?: string;
  data_ocupacao?: string;
  data_liberacao?: string;
}

export interface OcupacaoLeito {
  centro_custo: string;
  leitos_cadastrados: number;
  leitos_ocupados: number;
  leitos_vagos: number;
  leitos_censo: number;
  taxa_ocupacao: number;
}

export interface OcupacaoPorConvenio {
  centro_custo: string;
  convenio: string;
  total_internacoes: number;
  leitos_ocupados: number;
}

export interface Atendimento {
  id: string;
  paciente_id: string;
  paciente_nome: string;
  data: string;
  hora?: string;
  tipo: string;
  tipo_servico: string;
  especialidade: string;
  centro_custo: string;
  convenio: string;
  categoria_convenio: 'SUS' | 'convenio' | 'particular';
  faixa_etaria: string;
  idade?: number;
}

export interface Proveniencia {
  proveniencia: string;
  quantidade: number;
  centro_custo?: string;
}

export interface InternacaoPS {
  medico: string;
  especialidade: string;
  quantidade: number;
  periodo: 'dia' | 'mes';
}

export interface ClassificacaoRisco {
  classificacao: string;
  quantidade: number;
  periodo: 'dia' | 'mes';
}

export interface EntradaSaida {
  data: string;
  entradas: number;
  saidas: number;
}

export interface PacienteDiaLeitoDia {
  data: string;
  paciente_dia: number;
  leito_dia: number;
}

export interface IntervaloSubstituicao {
  centro_custo: string;
  intervalo_medio: number; // em dias
  periodo: 'dia' | 'mes';
}

export interface RotatividadeLeito {
  centro_custo: string;
  rotatividade: number; // número de vezes que o leito foi ocupado/liberado
  periodo: 'dia' | 'mes';
}

export interface StatusOcupacao {
  centro_custo: string;
  ocupados: number;
  disponiveis: number;
  manutencao: number;
  reservados: number;
}

export interface TopEspecialidade {
  especialidade: string;
  quantidade: number;
  centro_custo?: string;
}

export interface AtendimentoPorHorario {
  horario: string;
  quantidade: number;
}

export interface DashboardFilter {
  periodo: 'dia' | 'mes' | 'semana' | 'trimestre';
  centro_custo?: string;
  data_inicio?: string;
  data_fim?: string;
}

// Tipos para gestão operacional de leitos
export interface LeitoOperacional {
  convenio: number;
  sus: number;
  ocupado: number;
  livre: number;
}

export interface TipoLeito {
  tipo: 'ENF' | 'UTI' | 'APT' | 'outro';
  quantidade: number;
  percentual: number;
}

export interface LeitoPorSetor {
  setor: string;
  livre: number;
  ocupado: number;
  total: number;
}

export interface OcupacaoConvenio {
  convenio: string;
  quantidade: number;
  percentual: number;
}

export interface OcupacaoEspecialidade {
  especialidade: string;
  quantidade: number;
  percentual: number;
}

export interface TreeMapData {
  name: string;
  value: number;
  children?: TreeMapData[];
}

export interface KPICritico {
  id: string;
  titulo: string;
  valor: number;
  ideal: { min?: number; max?: number };
  status: 'ideal' | 'atencao' | 'critico';
  mensagem?: string;
}
