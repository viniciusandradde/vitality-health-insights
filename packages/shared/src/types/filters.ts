// Tipos para filtros e busca

export type FilterType = 'select' | 'date' | 'daterange' | 'text' | 'number' | 'multiselect' | 'boolean';

export interface FilterOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface ModuleFilter {
  id: string;
  label: string;
  type: FilterType;
  options?: FilterOption[];
  defaultValue?: string | number | string[] | boolean;
  placeholder?: string;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface DateRangeFilter {
  start: string; // ISO date
  end: string; // ISO date
}

export interface FilterValues {
  [key: string]: string | number | string[] | boolean | DateRangeFilter | null | undefined;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: FilterValues;
  isDefault?: boolean;
}

// Filtros padrão por módulo
export const COMMON_FILTERS: ModuleFilter[] = [
  {
    id: 'periodo',
    label: 'Período',
    type: 'select',
    options: [
      { label: 'Hoje', value: 'today' },
      { label: 'Últimos 7 dias', value: 'last_7_days' },
      { label: 'Últimos 30 dias', value: 'last_30_days' },
      { label: 'Este mês', value: 'this_month' },
      { label: 'Mês passado', value: 'last_month' },
      { label: 'Este ano', value: 'this_year' },
      { label: 'Personalizado', value: 'custom' },
    ],
    defaultValue: 'today',
  },
  {
    id: 'data_inicio',
    label: 'Data Início',
    type: 'date',
  },
  {
    id: 'data_fim',
    label: 'Data Fim',
    type: 'date',
  },
];

export const ATENDIMENTOS_FILTERS: ModuleFilter[] = [
  ...COMMON_FILTERS,
  {
    id: 'especialidade',
    label: 'Especialidade',
    type: 'multiselect',
    options: [
      { label: 'Clínica Geral', value: 'clinica_geral' },
      { label: 'Pediatria', value: 'pediatria' },
      { label: 'Ortopedia', value: 'ortopedia' },
      { label: 'Cardiologia', value: 'cardiologia' },
      { label: 'Ginecologia', value: 'ginecologia' },
    ],
  },
  {
    id: 'status',
    label: 'Status',
    type: 'multiselect',
    options: [
      { label: 'Aguardando', value: 'aguardando' },
      { label: 'Em Atendimento', value: 'em_atendimento' },
      { label: 'Finalizado', value: 'finalizado' },
      { label: 'Cancelado', value: 'cancelado' },
    ],
  },
  {
    id: 'convenio',
    label: 'Convênio',
    type: 'multiselect',
    options: [
      { label: 'SUS', value: 'sus' },
      { label: 'Unimed', value: 'unimed' },
      { label: 'Bradesco', value: 'bradesco' },
      { label: 'Particular', value: 'particular' },
    ],
  },
];

export const AMBULATORIO_FILTERS: ModuleFilter[] = [
  ...COMMON_FILTERS,
  {
    id: 'especialidade',
    label: 'Especialidade',
    type: 'multiselect',
  },
  {
    id: 'status',
    label: 'Status',
    type: 'multiselect',
    options: [
      { label: 'Agendado', value: 'agendado' },
      { label: 'Confirmado', value: 'confirmado' },
      { label: 'Em Atendimento', value: 'em_atendimento' },
      { label: 'Finalizado', value: 'finalizado' },
      { label: 'No-Show', value: 'no_show' },
      { label: 'Cancelado', value: 'cancelado' },
    ],
  },
];
