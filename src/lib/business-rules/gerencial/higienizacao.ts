// Regras de negócio específicas para módulo de Higienização
// Reutiliza a mesma lógica da Lavanderia

import type { HigienizacaoInsumo } from '@/types/modules';
import { calculateLavanderiaKPIs } from './lavanderia';

/**
 * Calcula KPIs do módulo de Higienização
 * Reutiliza a mesma lógica da Lavanderia
 */
export function calculateHigienizacaoKPIs(insumos: HigienizacaoInsumo[]) {
  // Converte HigienizacaoInsumo para LavanderiaInsumo para reutilizar funções
  const insumosConvertidos = insumos.map((i) => ({
    id: i.id,
    data: i.data,
    insumo: i.insumo,
    quantidade: i.quantidade,
    custo: i.custo,
    centro_custo: i.centro_custo,
  }));

  return calculateLavanderiaKPIs(insumosConvertidos);
}
