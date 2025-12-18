/**
 * Configuração dos agentes de IA disponíveis
 */

import {
  BarChart3,
  TrendingUp,
  Lightbulb,
  DollarSign,
  Stethoscope,
  Package,
  Target,
  Database,
  Users,
} from 'lucide-react';
import { Agent } from '@/types/chat';

export const agents: Agent[] = [
  {
    id: 'supervisor',
    name: 'Supervisor',
    description: 'Agente orquestrador que roteia para agentes especializados',
    icon: Users,
    color: 'hsl(200, 98%, 39%)',
    capabilities: ['Roteamento', 'Coordenação', 'Síntese'],
  },
  {
    id: 'bi_descriptive',
    name: 'BI Descritivo',
    description: 'Análise descritiva: o que aconteceu?',
    icon: BarChart3,
    color: 'hsl(200, 98%, 39%)',
    capabilities: ['Dashboards', 'Relatórios', 'SQL Queries'],
  },
  {
    id: 'predictive',
    name: 'Preditivo',
    description: 'Análise preditiva: o que vai acontecer?',
    icon: TrendingUp,
    color: 'hsl(142, 76%, 36%)',
    capabilities: ['Forecasting', 'ML Models', 'Time Series'],
  },
  {
    id: 'prescriptive',
    name: 'Prescritivo',
    description: 'Análise prescritiva: o que fazer?',
    icon: Lightbulb,
    color: 'hsl(38, 92%, 50%)',
    capabilities: ['Recomendações', 'Otimização', 'Ações'],
  },
  {
    id: 'financial',
    name: 'Financeiro',
    description: 'Análises financeiras e econômicas',
    icon: DollarSign,
    color: 'hsl(142, 76%, 36%)',
    capabilities: ['Fluxo de Caixa', 'Margens', 'Custos'],
  },
  {
    id: 'clinical',
    name: 'Assistencial',
    description: 'Análises clínicas e assistenciais',
    icon: Stethoscope,
    color: 'hsl(0, 72%, 50%)',
    capabilities: ['Atendimentos', 'Internações', 'Qualidade'],
  },
  {
    id: 'operational',
    name: 'Operacional',
    description: 'Análises operacionais e logísticas',
    icon: Package,
    color: 'hsl(262, 83%, 58%)',
    capabilities: ['Estoque', 'Logística', 'Processos'],
  },
  {
    id: 'kpi',
    name: 'KPI',
    description: 'Análise de indicadores e métricas',
    icon: Target,
    color: 'hsl(38, 92%, 50%)',
    capabilities: ['KPIs', 'Métricas', 'Indicadores'],
  },
  {
    id: 'sql',
    name: 'SQL',
    description: 'Agente especializado em consultas SQL',
    icon: Database,
    color: 'hsl(200, 98%, 39%)',
    capabilities: ['SQL Queries', 'Data Analysis', 'Reports'],
  },
];

export function getAgentById(id: string): Agent | undefined {
  return agents.find((agent) => agent.id === id);
}

export function getAgentIcon(id: string) {
  const agent = getAgentById(id);
  return agent?.icon || Users;
}

export function getAgentColor(id: string) {
  const agent = getAgentById(id);
  return agent?.color || 'hsl(200, 98%, 39%)';
}

