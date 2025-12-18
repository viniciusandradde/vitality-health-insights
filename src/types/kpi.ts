/**
 * Tipos para KPIs e métricas
 */

export type KPIVariant = 'default' | 'success' | 'warning' | 'destructive';

export interface KPI {
  id: string;
  title: string;
  value: number | string;
  unit?: string;
  trend?: KPITrend;
  variant?: KPIVariant;
  description?: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface KPITrend {
  value: number;
  label: string;
  isPositive?: boolean;
}

export interface KPIFilter {
  period?: 'today' | 'week' | 'month' | 'quarter' | 'year';
  sector?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
}

