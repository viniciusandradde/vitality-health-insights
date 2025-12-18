/**
 * Hook genérico para buscar KPIs de módulos assistenciais
 */

import { useQuery } from '@tanstack/react-query';
import { assistencialApi } from '@/api/endpoints/assistencial';
import { FilterParams } from '@/types/assistencial';

type ModuleType = 
  | 'atendimentos'
  | 'agendas'
  | 'exames'
  | 'farmacia'
  | 'uti'
  | 'ccih'
  | 'internacao';

/**
 * Hook para buscar KPIs de um módulo assistencial específico
 */
export function useAssistencialKPIs(
  module: ModuleType,
  filters?: FilterParams
) {
  return useQuery({
    queryKey: [`${module}-kpi`, filters],
    queryFn: async () => {
      switch (module) {
        case 'atendimentos':
          return assistencialApi.getAtendimentosKPI(filters);
        case 'agendas':
          return assistencialApi.getAgendasKPI(filters);
        case 'exames':
          return assistencialApi.getExamesKPI(filters);
        case 'farmacia':
          return assistencialApi.getFarmaciaKPI(filters);
        case 'uti':
          return assistencialApi.getUTIKPI(filters);
        case 'ccih':
          return assistencialApi.getCCIHKPI(filters);
        case 'internacao':
          return assistencialApi.getInternacaoKPI(filters);
        default:
          throw new Error(`Módulo ${module} não suportado`);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });
}

/**
 * Hook específico para KPIs de Atendimentos
 */
export function useAtendimentosKPIs(filters?: FilterParams) {
  return useAssistencialKPIs('atendimentos', filters);
}

/**
 * Hook específico para KPIs de Agendas
 */
export function useAgendasKPIs(filters?: FilterParams) {
  return useAssistencialKPIs('agendas', filters);
}

/**
 * Hook específico para KPIs de Exames
 */
export function useExamesKPIs(filters?: FilterParams) {
  return useAssistencialKPIs('exames', filters);
}

/**
 * Hook específico para KPIs de Farmácia
 */
export function useFarmaciaKPIs(filters?: FilterParams) {
  return useAssistencialKPIs('farmacia', filters);
}

/**
 * Hook específico para KPIs de UTI
 */
export function useUTIKPIs(filters?: FilterParams) {
  return useAssistencialKPIs('uti', filters);
}

/**
 * Hook específico para KPIs de CCIH
 */
export function useCCIHKPIs(filters?: FilterParams) {
  return useAssistencialKPIs('ccih', filters);
}

/**
 * Hook específico para KPIs de Internação
 */
export function useInternacaoKPIs(filters?: FilterParams) {
  return useAssistencialKPIs('internacao', filters);
}

