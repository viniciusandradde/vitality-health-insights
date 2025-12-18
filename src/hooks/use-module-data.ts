/**
 * Hook genérico para dados de módulos
 */

import { useQuery } from '@tanstack/react-query';

interface UseModuleDataOptions<T> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  enabled?: boolean;
  refetchInterval?: number;
}

export function useModuleData<T>({
  queryKey,
  queryFn,
  enabled = true,
  refetchInterval,
}: UseModuleDataOptions<T>) {
  return useQuery({
    queryKey,
    queryFn,
    enabled,
    refetchInterval,
    staleTime: 30000, // 30 segundos
  });
}

