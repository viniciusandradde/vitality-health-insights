/**
 * Tipos para módulos gerenciais
 */

export interface FilterParams {
  period?: 'today' | 'week' | 'month' | 'quarter' | 'year';
  startDate?: string;
  endDate?: string;
  category?: string;
}

// Financeiro
export type FinancialType = 'revenue' | 'expense';

export interface FinancialData {
  id: string;
  type: FinancialType;
  category: string;
  amount: number;
  date: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

// Faturamento
export type FaturaStatus = 'pending' | 'processed' | 'rejected' | 'glosa';

export interface Fatura {
  id: string;
  patientId: string;
  patientName: string;
  amount: number;
  status: FaturaStatus;
  issueDate: string;
  dueDate: string;
  insurance: string;
  glosaReason?: string;
  metadata?: Record<string, unknown>;
}

// Estoque
export interface EstoqueItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  lastUpdate: string;
  supplier?: string;
  cost?: number;
}

// Relatórios
export interface Relatorio {
  id: string;
  title: string;
  type: string;
  period: string;
  generatedAt: string;
  data: unknown;
  format: 'pdf' | 'excel' | 'csv' | 'json';
}

