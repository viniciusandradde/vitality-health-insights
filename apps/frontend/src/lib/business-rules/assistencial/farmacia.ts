// Regras de negócio específicas para módulo de Farmácia

import type { FarmaciaMedicamento } from '@/types/modules';

/**
 * Calcula KPIs do módulo de Farmácia
 */
export function calculateFarmaciaKPIs(medicamentos: FarmaciaMedicamento[]) {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  
  // Medicamentos do mês atual
  const medicamentosMes = medicamentos.filter((m) => {
    const dataMedicamento = new Date(m.data);
    return dataMedicamento.getMonth() === mesAtual && dataMedicamento.getFullYear() === anoAtual;
  });

  // Medicamentos dos últimos 12 meses para sazonalidade
  const dozeMesesAtras = new Date(anoAtual, mesAtual - 11, 1);
  const medicamentosUltimos12Meses = medicamentos.filter((m) => {
    const dataMedicamento = new Date(m.data);
    return dataMedicamento >= dozeMesesAtras;
  });

  const custoOperacional = medicamentosMes.reduce((sum, m) => sum + (m.quantidade * 10), 0); // Exemplo: custo estimado
  const saidaEstoque = medicamentosMes.reduce((sum, m) => sum + m.quantidade, 0);

  return {
    custoOperacional,
    saidaEstoque,
    rankingMedicamentos: calculateRankingMedicamentos(medicamentosMes),
    rankingMateriais: calculateRankingMateriais(medicamentosMes),
    rankingPorCentroCusto: calculateRankingPorCentroCusto(medicamentosMes),
    marcasUtilizadas: calculateMarcasUtilizadas(medicamentosMes),
    controleAntimicrobianos: calculateControleAntimicrobianos(medicamentosMes),
    materiaisCentroCirurgico: calculateMateriaisCentroCirurgico(medicamentosMes),
    indiceRetorno: calculateIndiceRetorno(medicamentosMes),
    sazonalidades: calculateSazonalidade(medicamentosMes, medicamentosUltimos12Meses),
    custoFaturamentoPorConvenio: calculateCustoFaturamentoPorConvenio(medicamentosMes),
    custoFaturamentoPorCentroCusto: calculateCustoFaturamentoPorCentroCusto(medicamentosMes),
  };
}

/**
 * Calcula ranking de medicamentos utilizados
 */
export function calculateRankingMedicamentos(medicamentos: FarmaciaMedicamento[]) {
  const medicamentosOnly = medicamentos.filter((m) => m.tipo === 'medicamento');
  const porMedicamento: Record<string, number> = {};

  medicamentosOnly.forEach((m) => {
    porMedicamento[m.medicamento] = (porMedicamento[m.medicamento] || 0) + m.quantidade;
  });

  return Object.entries(porMedicamento)
    .map(([medicamento, quantidade]) => ({
      medicamento,
      quantidade,
    }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10); // Top 10
}

/**
 * Calcula ranking de materiais utilizados
 */
export function calculateRankingMateriais(medicamentos: FarmaciaMedicamento[]) {
  const materiaisOnly = medicamentos.filter((m) => m.tipo === 'material');
  const porMaterial: Record<string, number> = {};

  materiaisOnly.forEach((m) => {
    porMaterial[m.medicamento] = (porMaterial[m.medicamento] || 0) + m.quantidade;
  });

  return Object.entries(porMaterial)
    .map(([material, quantidade]) => ({
      material,
      quantidade,
    }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10); // Top 10
}

/**
 * Calcula ranking por centro de custo
 */
export function calculateRankingPorCentroCusto(medicamentos: FarmaciaMedicamento[]) {
  const porCentroCusto: Record<string, { medicamentos: number; materiais: number }> = {};

  medicamentos.forEach((m) => {
    if (!porCentroCusto[m.centro_custo]) {
      porCentroCusto[m.centro_custo] = { medicamentos: 0, materiais: 0 };
    }
    if (m.tipo === 'medicamento') {
      porCentroCusto[m.centro_custo].medicamentos += m.quantidade;
    } else {
      porCentroCusto[m.centro_custo].materiais += m.quantidade;
    }
  });

  return Object.entries(porCentroCusto)
    .map(([centroCusto, dados]) => ({
      centro_custo: centroCusto,
      medicamentos: dados.medicamentos,
      materiais: dados.materiais,
      total: dados.medicamentos + dados.materiais,
    }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Calcula marcas mais utilizadas
 */
export function calculateMarcasUtilizadas(medicamentos: FarmaciaMedicamento[]) {
  const comMarca = medicamentos.filter((m) => m.marca);
  const porMarca: Record<string, number> = {};

  comMarca.forEach((m) => {
    porMarca[m.marca!] = (porMarca[m.marca!] || 0) + m.quantidade;
  });

  return Object.entries(porMarca)
    .map(([marca, quantidade]) => ({
      marca,
      quantidade,
    }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10); // Top 10
}

/**
 * Calcula controle de antimicrobianos
 */
export function calculateControleAntimicrobianos(medicamentos: FarmaciaMedicamento[]) {
  const antimicrobianos = medicamentos.filter((m) => m.antimicrobiano);
  
  return {
    total: antimicrobianos.length,
    quantidadeTotal: antimicrobianos.reduce((sum, m) => sum + m.quantidade, 0),
    porCentroCusto: calculateRankingPorCentroCusto(antimicrobianos),
    detalhes: antimicrobianos.map((m) => ({
      medicamento: m.medicamento,
      quantidade: m.quantidade,
      centro_custo: m.centro_custo,
    })),
  };
}

/**
 * Calcula materiais para centro cirúrgico
 */
export function calculateMateriaisCentroCirurgico(medicamentos: FarmaciaMedicamento[]) {
  const centroCirurgico = medicamentos.filter(
    (m) => m.centro_custo.toLowerCase().includes('cirurgico') && m.tipo === 'material'
  );
  
  return {
    total: centroCirurgico.length,
    quantidadeTotal: centroCirurgico.reduce((sum, m) => sum + m.quantidade, 0),
    detalhes: centroCirurgico.map((m) => ({
      material: m.medicamento,
      quantidade: m.quantidade,
      marca: m.marca,
    })),
  };
}

/**
 * Calcula índice de retorno por centro de custo
 */
export function calculateIndiceRetorno(medicamentos: FarmaciaMedicamento[]) {
  const retornos = medicamentos.filter((m) => m.retorno);
  const porCentroCusto: Record<string, { retornos: number; total: number }> = {};

  medicamentos.forEach((m) => {
    if (!porCentroCusto[m.centro_custo]) {
      porCentroCusto[m.centro_custo] = { retornos: 0, total: 0 };
    }
    porCentroCusto[m.centro_custo].total += m.quantidade;
    if (m.retorno) {
      porCentroCusto[m.centro_custo].retornos += m.quantidade;
    }
  });

  return Object.entries(porCentroCusto).map(([centroCusto, dados]) => ({
    centro_custo: centroCusto,
    indice: dados.total > 0 ? (dados.retornos / dados.total) * 100 : 0,
    retornos: dados.retornos,
    total: dados.total,
  }));
}

/**
 * Calcula sazonalidade
 */
export function calculateSazonalidade(
  medicamentosAtuais: FarmaciaMedicamento[],
  medicamentosUltimos12Meses: FarmaciaMedicamento[]
): number {
  if (medicamentosUltimos12Meses.length === 0) return 0;

  const mediaMensal = medicamentosUltimos12Meses.length / 12;
  const quantidadeAtual = medicamentosAtuais.length;

  if (mediaMensal === 0) return 0;

  const variacao = ((quantidadeAtual - mediaMensal) / mediaMensal) * 100;
  return Number(variacao.toFixed(2));
}

/**
 * Calcula custo x faturamento por convênio
 * Nota: Esta função requer dados de faturamento que não estão no tipo atual
 * Será implementada quando houver integração com dados de faturamento
 */
export function calculateCustoFaturamentoPorConvenio(medicamentos: FarmaciaMedicamento[]) {
  // Placeholder - requer dados de faturamento
  return {
    sus: { custo: 0, faturamento: 0 },
    convenio: { custo: 0, faturamento: 0 },
    particular: { custo: 0, faturamento: 0 },
  };
}

/**
 * Calcula custo x faturamento por centro de custo
 * Nota: Esta função requer dados de faturamento que não estão no tipo atual
 */
export function calculateCustoFaturamentoPorCentroCusto(medicamentos: FarmaciaMedicamento[]) {
  const porCentroCusto: Record<string, number> = {};

  medicamentos.forEach((m) => {
    porCentroCusto[m.centro_custo] = (porCentroCusto[m.centro_custo] || 0) + (m.quantidade * 10);
  });

  return Object.entries(porCentroCusto).map(([centroCusto, custo]) => ({
    centro_custo: centroCusto,
    custo,
    faturamento: 0, // Placeholder
  }));
}
