// Regras de negócio específicas para módulo de Lavanderia

import type { LavanderiaInsumo } from '@/types/modules';

/**
 * Calcula KPIs do módulo de Lavanderia
 */
export function calculateLavanderiaKPIs(insumos: LavanderiaInsumo[]) {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  
  // Insumos do mês atual
  const insumosMes = insumos.filter((i) => {
    const dataInsumo = new Date(i.data);
    return dataInsumo.getMonth() === mesAtual && dataInsumo.getFullYear() === anoAtual;
  });

  // Insumos do mês anterior para comparação
  const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
  const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;
  const insumosMesAnterior = insumos.filter((i) => {
    const dataInsumo = new Date(i.data);
    return dataInsumo.getMonth() === mesAnterior && dataInsumo.getFullYear() === anoAnterior;
  });

  const saidaInsumos = insumosMes.reduce((sum, i) => sum + i.quantidade, 0);
  const custoOperacional = insumosMes.reduce((sum, i) => sum + i.custo, 0);
  
  const saidaMesAnterior = insumosMesAnterior.reduce((sum, i) => sum + i.quantidade, 0);
  const sinalizacaoAumento = saidaMesAnterior > 0
    ? ((saidaInsumos - saidaMesAnterior) / saidaMesAnterior) * 100
    : 0;

  return {
    saidaInsumos,
    custoOperacional,
    sinalizacaoAumento: Number(sinalizacaoAumento.toFixed(2)),
  };
}
