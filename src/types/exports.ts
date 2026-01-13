// Tipos para exportação de dados

export type ExportFormat = 'csv' | 'xlsx' | 'pdf' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  includeCharts?: boolean;
  includeKPIs?: boolean;
  filters?: Record<string, any>;
  columns?: string[]; // Colunas específicas para exportar
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ExportResult {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  error?: string;
  size?: number; // em bytes
}

export interface ExportPreset {
  id: string;
  name: string;
  description?: string;
  format: ExportFormat;
  options: Omit<ExportOptions, 'format'>;
}

// Presets de exportação comuns
export const EXPORT_PRESETS: ExportPreset[] = [
  {
    id: 'full_report',
    name: 'Relatório Completo',
    description: 'Exporta todos os dados com gráficos e KPIs',
    format: 'pdf',
    options: {
      includeCharts: true,
      includeKPIs: true,
    },
  },
  {
    id: 'data_only',
    name: 'Apenas Dados',
    description: 'Exporta apenas a tabela de dados',
    format: 'xlsx',
    options: {
      includeCharts: false,
      includeKPIs: false,
    },
  },
  {
    id: 'summary',
    name: 'Resumo Executivo',
    description: 'Exporta apenas KPIs e gráficos principais',
    format: 'pdf',
    options: {
      includeCharts: true,
      includeKPIs: true,
      columns: [], // Colunas principais apenas
    },
  },
];
