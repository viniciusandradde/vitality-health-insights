// Tipos para KPIs e métricas

export interface KPITrend {
  value: number; // Percentual de variação
  label?: string; // Ex: "vs ontem", "vs semana passada"
  isPositive?: boolean; // Se true, aumento é positivo
}

export interface KPIDefinition {
  id: string;
  title: string;
  description?: string;
  unit?: string; // Ex: "min", "%", "R$"
  format?: 'number' | 'currency' | 'percentage' | 'duration';
  category: 'assistencial' | 'gerencial' | 'dashboard';
  module?: string; // Módulo específico
  calculation?: string; // Descrição da fórmula
}

export interface KPIMetric {
  kpi_id: string;
  value: number;
  previous_value?: number;
  trend?: KPITrend;
  timestamp: string;
  filters?: Record<string, any>;
}

export interface KPIGroup {
  id: string;
  title: string;
  kpis: KPIDefinition[];
  layout?: 'grid' | 'row' | 'column';
}

// KPIs específicos por módulo
export const ATENDIMENTOS_KPIS: KPIDefinition[] = [
  {
    id: 'atendimentos_hoje',
    title: 'Atendimentos Hoje',
    unit: 'atendimentos',
    format: 'number',
    category: 'assistencial',
    module: 'atendimentos',
    calculation: 'COUNT(atendimentos WHERE data = hoje)',
  },
  {
    id: 'tempo_medio_espera',
    title: 'Tempo Médio de Espera',
    unit: 'min',
    format: 'duration',
    category: 'assistencial',
    module: 'atendimentos',
    calculation: 'AVG(tempo_espera_minutos)',
  },
  {
    id: 'taxa_ocupacao',
    title: 'Taxa de Ocupação',
    unit: '%',
    format: 'percentage',
    category: 'assistencial',
    module: 'atendimentos',
    calculation: '(atendimentos_em_andamento / capacidade_total) * 100',
  },
  {
    id: 'atendimentos_aguardando',
    title: 'Em Espera',
    unit: 'pacientes',
    format: 'number',
    category: 'assistencial',
    module: 'atendimentos',
    calculation: 'COUNT(atendimentos WHERE status = "aguardando")',
  },
];

export const AMBULATORIO_KPIS: KPIDefinition[] = [
  {
    id: 'agendamentos_hoje',
    title: 'Agendamentos Hoje',
    unit: 'agendamentos',
    format: 'number',
    category: 'assistencial',
    module: 'ambulatorio',
  },
  {
    id: 'taxa_no_show',
    title: 'Taxa de No-Show',
    unit: '%',
    format: 'percentage',
    category: 'assistencial',
    module: 'ambulatorio',
    calculation: '(no_shows / total_agendamentos) * 100',
  },
  {
    id: 'taxa_ocupacao_ambulatorio',
    title: 'Taxa de Ocupação',
    unit: '%',
    format: 'percentage',
    category: 'assistencial',
    module: 'ambulatorio',
  },
];

export const INTERNACAO_KPIS: KPIDefinition[] = [
  {
    id: 'leitos_ocupados',
    title: 'Leitos Ocupados',
    unit: 'leitos',
    format: 'number',
    category: 'assistencial',
    module: 'internacao',
  },
  {
    id: 'taxa_ocupacao_leitos',
    title: 'Taxa de Ocupação',
    unit: '%',
    format: 'percentage',
    category: 'assistencial',
    module: 'internacao',
  },
  {
    id: 'tempo_medio_permanencia',
    title: 'Tempo Médio de Permanência',
    unit: 'dias',
    format: 'duration',
    category: 'assistencial',
    module: 'internacao',
  },
];

export const FINANCEIRO_KPIS: KPIDefinition[] = [
  {
    id: 'receita_mes',
    title: 'Receita do Mês',
    unit: 'R$',
    format: 'currency',
    category: 'gerencial',
    module: 'financeiro',
  },
  {
    id: 'despesa_mes',
    title: 'Despesa do Mês',
    unit: 'R$',
    format: 'currency',
    category: 'gerencial',
    module: 'financeiro',
  },
  {
    id: 'saldo_mes',
    title: 'Saldo do Mês',
    unit: 'R$',
    format: 'currency',
    category: 'gerencial',
    module: 'financeiro',
    calculation: 'receita_mes - despesa_mes',
  },
];

// Laboratório
export const LABORATORIO_KPIS: KPIDefinition[] = [
  {
    id: 'quantidade_exames_mensais',
    title: 'Quantidade de Exames Mensais',
    unit: 'exames',
    format: 'number',
    category: 'assistencial',
    module: 'laboratorio',
  },
  {
    id: 'exames_por_convenio_total',
    title: 'Exames por Convênio (Total)',
    unit: 'exames',
    format: 'number',
    category: 'assistencial',
    module: 'laboratorio',
  },
  {
    id: 'exames_por_convenio_percentual',
    title: 'Exames por Convênio (%)',
    unit: '%',
    format: 'percentage',
    category: 'assistencial',
    module: 'laboratorio',
  },
  {
    id: 'faturamento_mensal',
    title: 'Faturamento Mensal',
    unit: 'R$',
    format: 'currency',
    category: 'assistencial',
    module: 'laboratorio',
  },
  {
    id: 'faturamento_por_exame',
    title: 'Faturamento por Exame',
    unit: 'R$',
    format: 'currency',
    category: 'assistencial',
    module: 'laboratorio',
  },
  {
    id: 'custo_estimado_por_exame',
    title: 'Custo Estimado por Exame',
    unit: 'R$',
    format: 'currency',
    category: 'assistencial',
    module: 'laboratorio',
  },
  {
    id: 'saida_estoque',
    title: 'Saída de Estoque',
    unit: 'unidades',
    format: 'number',
    category: 'assistencial',
    module: 'laboratorio',
  },
  {
    id: 'pacientes_externos_total',
    title: 'Pacientes Externos (Total)',
    unit: 'pacientes',
    format: 'number',
    category: 'assistencial',
    module: 'laboratorio',
  },
  {
    id: 'repeticao_exames',
    title: 'Repetição de Exames por Paciente',
    unit: 'vezes',
    format: 'number',
    category: 'assistencial',
    module: 'laboratorio',
  },
  {
    id: 'sazonalidade_exames',
    title: 'Sazonalidade de Exames',
    unit: '%',
    format: 'percentage',
    category: 'assistencial',
    module: 'laboratorio',
  },
];

// Imagem (mesmos indicadores do Laboratório)
export const IMAGEM_KPIS: KPIDefinition[] = [
  {
    id: 'quantidade_exames_mensais',
    title: 'Quantidade de Exames Mensais',
    unit: 'exames',
    format: 'number',
    category: 'assistencial',
    module: 'imagem',
  },
  {
    id: 'exames_por_convenio_total',
    title: 'Exames por Convênio (Total)',
    unit: 'exames',
    format: 'number',
    category: 'assistencial',
    module: 'imagem',
  },
  {
    id: 'exames_por_convenio_percentual',
    title: 'Exames por Convênio (%)',
    unit: '%',
    format: 'percentage',
    category: 'assistencial',
    module: 'imagem',
  },
  {
    id: 'faturamento_mensal',
    title: 'Faturamento Mensal',
    unit: 'R$',
    format: 'currency',
    category: 'assistencial',
    module: 'imagem',
  },
  {
    id: 'faturamento_por_exame',
    title: 'Faturamento por Exame',
    unit: 'R$',
    format: 'currency',
    category: 'assistencial',
    module: 'imagem',
  },
  {
    id: 'custo_estimado_por_exame',
    title: 'Custo Estimado por Exame',
    unit: 'R$',
    format: 'currency',
    category: 'assistencial',
    module: 'imagem',
  },
  {
    id: 'saida_estoque',
    title: 'Saída de Estoque',
    unit: 'unidades',
    format: 'number',
    category: 'assistencial',
    module: 'imagem',
  },
  {
    id: 'pacientes_externos_total',
    title: 'Pacientes Externos (Total)',
    unit: 'pacientes',
    format: 'number',
    category: 'assistencial',
    module: 'imagem',
  },
  {
    id: 'repeticao_exames',
    title: 'Repetição de Exames por Paciente',
    unit: 'vezes',
    format: 'number',
    category: 'assistencial',
    module: 'imagem',
  },
  {
    id: 'sazonalidade_exames',
    title: 'Sazonalidade de Exames',
    unit: '%',
    format: 'percentage',
    category: 'assistencial',
    module: 'imagem',
  },
];

// Agência Transfusional
export const TRANSFUSIONAL_KPIS: KPIDefinition[] = [
  {
    id: 'quantidade_procedimentos_mensais',
    title: 'Quantidade de Procedimentos Mensais',
    unit: 'procedimentos',
    format: 'number',
    category: 'assistencial',
    module: 'transfusional',
  },
  {
    id: 'procedimentos_por_convenio_total',
    title: 'Procedimentos por Convênio (Total)',
    unit: 'procedimentos',
    format: 'number',
    category: 'assistencial',
    module: 'transfusional',
  },
  {
    id: 'procedimentos_por_convenio_percentual',
    title: 'Procedimentos por Convênio (%)',
    unit: '%',
    format: 'percentage',
    category: 'assistencial',
    module: 'transfusional',
  },
  {
    id: 'faturamento_mensal',
    title: 'Faturamento Mensal',
    unit: 'R$',
    format: 'currency',
    category: 'assistencial',
    module: 'transfusional',
  },
  {
    id: 'faturamento_por_procedimento',
    title: 'Faturamento por Procedimento',
    unit: 'R$',
    format: 'currency',
    category: 'assistencial',
    module: 'transfusional',
  },
  {
    id: 'custo_estimado_por_procedimento',
    title: 'Custo Estimado por Procedimento',
    unit: 'R$',
    format: 'currency',
    category: 'assistencial',
    module: 'transfusional',
  },
  {
    id: 'saida_estoque',
    title: 'Saída de Estoque',
    unit: 'unidades',
    format: 'number',
    category: 'assistencial',
    module: 'transfusional',
  },
  {
    id: 'pacientes_total',
    title: 'Quantitativo de Pacientes (Total)',
    unit: 'pacientes',
    format: 'number',
    category: 'assistencial',
    module: 'transfusional',
  },
  {
    id: 'repeticao_procedimentos',
    title: 'Repetição de Procedimento por Paciente',
    unit: 'vezes',
    format: 'number',
    category: 'assistencial',
    module: 'transfusional',
  },
  {
    id: 'sazonalidade_procedimentos',
    title: 'Sazonalidade de Procedimentos',
    unit: '%',
    format: 'percentage',
    category: 'assistencial',
    module: 'transfusional',
  },
];

// Nutrição
export const NUTRICAO_KPIS: KPIDefinition[] = [
  {
    id: 'saida_estoque',
    title: 'Saída de Estoque',
    unit: 'unidades',
    format: 'number',
    category: 'gerencial',
    module: 'nutricao',
  },
  {
    id: 'custo_por_refeicao',
    title: 'Custo por Refeição',
    unit: 'R$',
    format: 'currency',
    category: 'gerencial',
    module: 'nutricao',
  },
  {
    id: 'receita_convenios_particular',
    title: 'Receita Convênios/Particular',
    unit: 'R$',
    format: 'currency',
    category: 'gerencial',
    module: 'nutricao',
  },
  {
    id: 'perda_marmitas',
    title: 'Perda de Marmitas',
    unit: 'marmitas',
    format: 'number',
    category: 'gerencial',
    module: 'nutricao',
  },
];

// Lavanderia
export const LAVANDERIA_KPIS: KPIDefinition[] = [
  {
    id: 'saida_insumos',
    title: 'Saída de Insumos',
    unit: 'unidades',
    format: 'number',
    category: 'gerencial',
    module: 'lavanderia',
  },
  {
    id: 'custo_operacional',
    title: 'Custo Operacional',
    unit: 'R$',
    format: 'currency',
    category: 'gerencial',
    module: 'lavanderia',
  },
  {
    id: 'sinalizacao_aumento',
    title: 'Sinalização de Aumento de Utilização',
    unit: '%',
    format: 'percentage',
    category: 'gerencial',
    module: 'lavanderia',
  },
];

// Higienização
export const HIGIENIZACAO_KPIS: KPIDefinition[] = [
  {
    id: 'saida_insumos',
    title: 'Saída de Insumos',
    unit: 'unidades',
    format: 'number',
    category: 'gerencial',
    module: 'higienizacao',
  },
  {
    id: 'custo_operacional',
    title: 'Custo Operacional',
    unit: 'R$',
    format: 'currency',
    category: 'gerencial',
    module: 'higienizacao',
  },
  {
    id: 'sinalizacao_aumento',
    title: 'Sinalização de Aumento de Utilização',
    unit: '%',
    format: 'percentage',
    category: 'gerencial',
    module: 'higienizacao',
  },
];

// Recepção PS (adicionar aos existentes)
export const RECEPCAO_PS_KPIS: KPIDefinition[] = [
  {
    id: 'aumento_atendimentos',
    title: 'Aumento de Atendimentos',
    unit: '%',
    format: 'percentage',
    category: 'assistencial',
    module: 'atendimentos',
  },
  {
    id: 'proporcao_atendimentos_convenio',
    title: 'Proporção de Atendimentos por Convênio',
    unit: '%',
    format: 'percentage',
    category: 'assistencial',
    module: 'atendimentos',
  },
  {
    id: 'fichas_abertas_finalizadas',
    title: 'Fichas Abertas e Finalizadas',
    unit: 'fichas',
    format: 'number',
    category: 'assistencial',
    module: 'atendimentos',
  },
  {
    id: 'horarios_picos',
    title: 'Principais Horários de Picos',
    unit: 'horas',
    format: 'number',
    category: 'assistencial',
    module: 'atendimentos',
  },
  {
    id: 'sazonalidades',
    title: 'Identificação de Sazonalidades',
    unit: '%',
    format: 'percentage',
    category: 'assistencial',
    module: 'atendimentos',
  },
];

// Hotelaria
export const HOTELARIA_KPIS: KPIDefinition[] = [
  {
    id: 'aumento_solicitacao_rouparia',
    title: 'Aumento de Solicitação de Rouparia',
    unit: '%',
    format: 'percentage',
    category: 'gerencial',
    module: 'hotelaria',
  },
  {
    id: 'chamados_manutencao',
    title: 'Chamados para Manutenção de Quartos',
    unit: 'chamados',
    format: 'number',
    category: 'gerencial',
    module: 'hotelaria',
  },
  {
    id: 'saida_estoque_tecidos',
    title: 'Saída de Estoque de Tecidos',
    unit: 'unidades',
    format: 'number',
    category: 'gerencial',
    module: 'hotelaria',
  },
  {
    id: 'perdas_rouparia',
    title: 'Perdas Percentual de Rouparia',
    unit: '%',
    format: 'percentage',
    category: 'gerencial',
    module: 'hotelaria',
  },
];

// Ambulatório (atualizar - adicionar novos)
export const AMBULATORIO_NOVOS_KPIS: KPIDefinition[] = [
  {
    id: 'custo_operacional',
    title: 'Custo Operacional',
    unit: 'R$',
    format: 'currency',
    category: 'assistencial',
    module: 'ambulatorio',
  },
  {
    id: 'atendimentos_por_clinica',
    title: 'Atendimentos por Clínica Médica',
    unit: 'atendimentos',
    format: 'number',
    category: 'assistencial',
    module: 'ambulatorio',
  },
  {
    id: 'percentual_atendimentos_convenio',
    title: 'Percentual de Atendimentos por Convênio',
    unit: '%',
    format: 'percentage',
    category: 'assistencial',
    module: 'ambulatorio',
  },
  {
    id: 'atendimentos_sus',
    title: 'Atendimentos SUS Mensal',
    unit: 'atendimentos',
    format: 'number',
    category: 'assistencial',
    module: 'ambulatorio',
  },
  {
    id: 'fichas_abertas_finalizadas',
    title: 'Fichas Abertas e Finalizadas',
    unit: 'fichas',
    format: 'number',
    category: 'assistencial',
    module: 'ambulatorio',
  },
  {
    id: 'procedimentos_exames_gerados',
    title: 'Procedimentos e Exames Gerados Hospitalar',
    unit: 'procedimentos',
    format: 'number',
    category: 'assistencial',
    module: 'ambulatorio',
  },
];

// SPP
export const SPP_KPIS: KPIDefinition[] = [
  {
    id: 'prontuarios_arquivados',
    title: 'Prontuários Arquivados Mensalmente',
    unit: 'prontuários',
    format: 'number',
    category: 'gerencial',
    module: 'spp',
  },
  {
    id: 'custo_operacional',
    title: 'Custo Operacional',
    unit: 'R$',
    format: 'currency',
    category: 'gerencial',
    module: 'spp',
  },
  {
    id: 'solicitacoes_prontuarios',
    title: 'Solicitações de Prontuários',
    unit: 'solicitações',
    format: 'number',
    category: 'gerencial',
    module: 'spp',
  },
  {
    id: 'tempo_resposta',
    title: 'Tempo de Resposta para Entrega',
    unit: 'horas',
    format: 'duration',
    category: 'gerencial',
    module: 'spp',
  },
];

// TI
export const TI_KPIS: KPIDefinition[] = [
  {
    id: 'custo_operacional',
    title: 'Custo Operacional',
    unit: 'R$',
    format: 'currency',
    category: 'gerencial',
    module: 'ti',
  },
  {
    id: 'sazonalidade_solicitacoes',
    title: 'Sazonalidade de Solicitações',
    unit: '%',
    format: 'percentage',
    category: 'gerencial',
    module: 'ti',
  },
  {
    id: 'chamados_por_centro_custo',
    title: 'Aberturas de Chamados por Centro de Custo',
    unit: 'chamados',
    format: 'number',
    category: 'gerencial',
    module: 'ti',
  },
  {
    id: 'quantidade_impressoes',
    title: 'Quantidade de Impressões por Centro de Custo',
    unit: 'impressões',
    format: 'number',
    category: 'gerencial',
    module: 'ti',
  },
  {
    id: 'computadores_alugados',
    title: 'Localização de Computadores Alugados',
    unit: 'computadores',
    format: 'number',
    category: 'gerencial',
    module: 'ti',
  },
  {
    id: 'equipamentos_criticos',
    title: 'Equipamentos em Estado Crítico',
    unit: 'equipamentos',
    format: 'number',
    category: 'gerencial',
    module: 'ti',
  },
];

// Farmácia
export const FARMACIA_KPIS: KPIDefinition[] = [
  {
    id: 'custo_operacional',
    title: 'Custo Operacional',
    unit: 'R$',
    format: 'currency',
    category: 'assistencial',
    module: 'farmacia',
  },
  {
    id: 'saida_estoque',
    title: 'Saída de Estoque',
    unit: 'unidades',
    format: 'number',
    category: 'assistencial',
    module: 'farmacia',
  },
  {
    id: 'ranking_medicamentos',
    title: 'Ranking de Medicamentos Utilizados',
    unit: 'medicamentos',
    format: 'number',
    category: 'assistencial',
    module: 'farmacia',
  },
  {
    id: 'marcas_utilizadas',
    title: 'Marcas Mais Utilizadas',
    unit: 'marcas',
    format: 'number',
    category: 'assistencial',
    module: 'farmacia',
  },
  {
    id: 'controle_antimicrobianos',
    title: 'Controle de Antimicrobianos',
    unit: 'medicamentos',
    format: 'number',
    category: 'assistencial',
    module: 'farmacia',
  },
  {
    id: 'materiais_centro_cirurgico',
    title: 'Materiais para Centro Cirúrgico',
    unit: 'materiais',
    format: 'number',
    category: 'assistencial',
    module: 'farmacia',
  },
  {
    id: 'indice_retorno',
    title: 'Índice de Retorno por Centro de Custo',
    unit: '%',
    format: 'percentage',
    category: 'assistencial',
    module: 'farmacia',
  },
  {
    id: 'sazonalidades',
    title: 'Identificação de Sazonalidades',
    unit: '%',
    format: 'percentage',
    category: 'assistencial',
    module: 'farmacia',
  },
  {
    id: 'custo_faturamento',
    title: 'Custo x Faturamento por Convênio',
    unit: 'R$',
    format: 'currency',
    category: 'assistencial',
    module: 'farmacia',
  },
];

// SESMT
export const SESMT_KPIS: KPIDefinition[] = [
  {
    id: 'custo_operacional',
    title: 'Custo Operacional',
    unit: 'R$',
    format: 'currency',
    category: 'gerencial',
    module: 'sesmt',
  },
  {
    id: 'indice_acidentes',
    title: 'Índice de Acidentes Mensais',
    unit: 'acidentes',
    format: 'number',
    category: 'gerencial',
    module: 'sesmt',
  },
  {
    id: 'relatorios_treinamento',
    title: 'Relatórios Mensais de Treinamento',
    unit: 'treinamentos',
    format: 'number',
    category: 'gerencial',
    module: 'sesmt',
  },
  {
    id: 'saida_estoque',
    title: 'Saída de Estoque Mensal',
    unit: 'unidades',
    format: 'number',
    category: 'gerencial',
    module: 'sesmt',
  },
];

// Agendas (expandido)
export const AGENDAS_EXPANDIDOS_KPIS: KPIDefinition[] = [
  {
    id: 'taxa_confirmacao',
    title: 'Taxa de Confirmação',
    unit: '%',
    format: 'percentage',
    category: 'assistencial',
    module: 'agendas',
  },
  {
    id: 'taxa_cancelamentos',
    title: 'Taxa de Cancelamentos',
    unit: '%',
    format: 'percentage',
    category: 'assistencial',
    module: 'agendas',
  },
  {
    id: 'horarios_maior_demanda',
    title: 'Horários de Maior Demanda',
    unit: 'horas',
    format: 'number',
    category: 'assistencial',
    module: 'agendas',
  },
  {
    id: 'distribuicao_especialidade',
    title: 'Distribuição por Especialidade',
    unit: 'agendamentos',
    format: 'number',
    category: 'assistencial',
    module: 'agendas',
  },
  {
    id: 'tempo_medio_agendamento',
    title: 'Tempo Médio Agendamento até Atendimento',
    unit: 'dias',
    format: 'duration',
    category: 'assistencial',
    module: 'agendas',
  },
];

// CCIH
export const CCIH_KPIS: KPIDefinition[] = [
  {
    id: 'taxa_infeccao_hospitalar',
    title: 'Taxa de Infecção Hospitalar Geral',
    unit: '%',
    format: 'percentage',
    category: 'assistencial',
    module: 'ccih',
  },
  {
    id: 'taxa_infeccao_sitio_cirurgico',
    title: 'Taxa de Infecção por Sítio Cirúrgico',
    unit: '%',
    format: 'percentage',
    category: 'assistencial',
    module: 'ccih',
  },
  {
    id: 'taxa_iras',
    title: 'Taxa de IRAS',
    unit: '%',
    format: 'percentage',
    category: 'assistencial',
    module: 'ccih',
  },
  {
    id: 'pacientes_isolamento',
    title: 'Pacientes em Isolamento',
    unit: 'pacientes',
    format: 'number',
    category: 'assistencial',
    module: 'ccih',
  },
  {
    id: 'uso_antimicrobianos',
    title: 'Uso de Antimicrobianos',
    unit: 'prescricoes',
    format: 'number',
    category: 'assistencial',
    module: 'ccih',
  },
  {
    id: 'topografia_infeccoes',
    title: 'Topografia de Infecções',
    unit: 'casos',
    format: 'number',
    category: 'assistencial',
    module: 'ccih',
  },
  {
    id: 'taxa_mortalidade_infeccao',
    title: 'Taxa de Mortalidade Relacionada',
    unit: '%',
    format: 'percentage',
    category: 'assistencial',
    module: 'ccih',
  },
  {
    id: 'tempo_medio_isolamento',
    title: 'Tempo Médio de Isolamento',
    unit: 'dias',
    format: 'duration',
    category: 'assistencial',
    module: 'ccih',
  },
];

// Fisioterapia
export const FISIOTERAPIA_KPIS: KPIDefinition[] = [
  {
    id: 'sessoes_mensais',
    title: 'Quantidade de Sessões Mensais',
    unit: 'sessões',
    format: 'number',
    category: 'assistencial',
    module: 'fisioterapia',
  },
  {
    id: 'taxa_ocupacao_fisioterapeutas',
    title: 'Taxa de Ocupação de Fisioterapeutas',
    unit: '%',
    format: 'percentage',
    category: 'assistencial',
    module: 'fisioterapia',
  },
  {
    id: 'evolucao_pacientes',
    title: 'Evolução de Pacientes',
    unit: 'pacientes',
    format: 'number',
    category: 'assistencial',
    module: 'fisioterapia',
  },
  {
    id: 'tempo_medio_tratamento',
    title: 'Tempo Médio de Tratamento',
    unit: 'dias',
    format: 'duration',
    category: 'assistencial',
    module: 'fisioterapia',
  },
  {
    id: 'sessoes_por_tipo',
    title: 'Sessões por Tipo de Tratamento',
    unit: 'sessões',
    format: 'number',
    category: 'assistencial',
    module: 'fisioterapia',
  },
  {
    id: 'taxa_comparecimento',
    title: 'Taxa de Comparecimento',
    unit: '%',
    format: 'percentage',
    category: 'assistencial',
    module: 'fisioterapia',
  },
  {
    id: 'pacientes_tratamento_ativo',
    title: 'Pacientes em Tratamento Ativo',
    unit: 'pacientes',
    format: 'number',
    category: 'assistencial',
    module: 'fisioterapia',
  },
  {
    id: 'altas_fisioterapia',
    title: 'Altas de Fisioterapia',
    unit: 'altas',
    format: 'number',
    category: 'assistencial',
    module: 'fisioterapia',
  },
];

// UTI
export const UTI_KPIS: KPIDefinition[] = [
  {
    id: 'taxa_ocupacao_uti',
    title: 'Taxa de Ocupação de Leitos UTI',
    unit: '%',
    format: 'percentage',
    category: 'assistencial',
    module: 'uti',
  },
  {
    id: 'tempo_medio_permanencia_uti',
    title: 'Tempo Médio de Permanência',
    unit: 'dias',
    format: 'duration',
    category: 'assistencial',
    module: 'uti',
  },
  {
    id: 'taxa_mortalidade_uti',
    title: 'Taxa de Mortalidade',
    unit: '%',
    format: 'percentage',
    category: 'assistencial',
    module: 'uti',
  },
  {
    id: 'apache_score_medio',
    title: 'Escore APACHE Médio',
    unit: 'pontos',
    format: 'number',
    category: 'assistencial',
    module: 'uti',
  },
  {
    id: 'taxa_readmissao_uti',
    title: 'Taxa de Readmissão',
    unit: '%',
    format: 'percentage',
    category: 'assistencial',
    module: 'uti',
  },
  {
    id: 'ventilacao_mecanica',
    title: 'Ventilação Mecânica',
    unit: 'pacientes',
    format: 'number',
    category: 'assistencial',
    module: 'uti',
  },
  {
    id: 'tempo_medio_ventilacao',
    title: 'Tempo Médio de Ventilação',
    unit: 'dias',
    format: 'duration',
    category: 'assistencial',
    module: 'uti',
  },
  {
    id: 'altas_uti',
    title: 'Altas da UTI',
    unit: 'altas',
    format: 'number',
    category: 'assistencial',
    module: 'uti',
  },
  {
    id: 'obitos_uti',
    title: 'Óbitos na UTI',
    unit: 'óbitos',
    format: 'number',
    category: 'assistencial',
    module: 'uti',
  },
  {
    id: 'taxa_infeccao_uti',
    title: 'Taxa de Infecção na UTI',
    unit: '%',
    format: 'percentage',
    category: 'assistencial',
    module: 'uti',
  },
];
