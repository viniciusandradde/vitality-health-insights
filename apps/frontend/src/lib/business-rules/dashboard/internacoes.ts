// Regras de negócio para indicadores de Internações do Dashboard

import type {
  Internacao,
  OcupacaoPorConvenio,
  Proveniencia,
  InternacaoPS,
  ClassificacaoRisco,
  EntradaSaida,
  PacienteDiaLeitoDia,
  IntervaloSubstituicao,
  RotatividadeLeito,
  DashboardFilter,
} from '@/types/dashboard';

/**
 * Calcula taxa de ocupação geral (dia ou mês)
 */
export function calculateTaxaOcupacaoGeral(
  internacoes: Internacao[],
  leitos: { centro_custo: string; total: number }[],
  periodo: 'dia' | 'mes'
): number {
  const hoje = new Date();
  let internacoesFiltradas = internacoes;

  if (periodo === 'dia') {
    const hojeStr = hoje.toISOString().split('T')[0];
    internacoesFiltradas = internacoes.filter((i) => {
      const dataEntrada = new Date(i.data_entrada).toISOString().split('T')[0];
      const dataSaida = i.data_saida ? new Date(i.data_saida).toISOString().split('T')[0] : null;
      return dataEntrada <= hojeStr && (!dataSaida || dataSaida >= hojeStr);
    });
  } else {
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    internacoesFiltradas = internacoes.filter((i) => {
      const dataEntrada = new Date(i.data_entrada);
      return dataEntrada.getMonth() === mesAtual && dataEntrada.getFullYear() === anoAtual;
    });
  }

  const totalLeitos = leitos.reduce((sum, l) => sum + l.total, 0);
  const leitosOcupados = internacoesFiltradas.length;

  if (totalLeitos === 0) return 0;
  return Number(((leitosOcupados / totalLeitos) * 100).toFixed(2));
}

/**
 * Calcula taxa de ocupação por centro de custo
 */
export function calculateTaxaOcupacaoPorCentroCusto(
  internacoes: Internacao[],
  leitos: { centro_custo: string; total: number }[],
  periodo: 'dia' | 'mes'
): Record<string, number> {
  const hoje = new Date();
  let internacoesFiltradas = internacoes;

  if (periodo === 'dia') {
    const hojeStr = hoje.toISOString().split('T')[0];
    internacoesFiltradas = internacoes.filter((i) => {
      const dataEntrada = new Date(i.data_entrada).toISOString().split('T')[0];
      const dataSaida = i.data_saida ? new Date(i.data_saida).toISOString().split('T')[0] : null;
      return dataEntrada <= hojeStr && (!dataSaida || dataSaida >= hojeStr);
    });
  } else {
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    internacoesFiltradas = internacoes.filter((i) => {
      const dataEntrada = new Date(i.data_entrada);
      return dataEntrada.getMonth() === mesAtual && dataEntrada.getFullYear() === anoAtual;
    });
  }

  const porCentroCusto: Record<string, { ocupados: number; total: number }> = {};

  leitos.forEach((l) => {
    porCentroCusto[l.centro_custo] = { ocupados: 0, total: l.total };
  });

  internacoesFiltradas.forEach((i) => {
    if (porCentroCusto[i.centro_custo]) {
      porCentroCusto[i.centro_custo].ocupados++;
    }
  });

  const resultado: Record<string, number> = {};
  Object.entries(porCentroCusto).forEach(([centro, dados]) => {
    resultado[centro] = dados.total > 0
      ? Number(((dados.ocupados / dados.total) * 100).toFixed(2))
      : 0;
  });

  return resultado;
}

/**
 * Calcula média de permanência (dia ou mês)
 */
export function calculateMediaPermanencia(
  internacoes: Internacao[],
  periodo: 'dia' | 'mes'
): number {
  const hoje = new Date();
  let internacoesFiltradas = internacoes;

  if (periodo === 'dia') {
    const hojeStr = hoje.toISOString().split('T')[0];
    internacoesFiltradas = internacoes.filter((i) => i.data_saida && i.dias_permanencia);
  } else {
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    internacoesFiltradas = internacoes.filter((i) => {
      const dataSaida = i.data_saida ? new Date(i.data_saida) : null;
      return dataSaida && dataSaida.getMonth() === mesAtual && dataSaida.getFullYear() === anoAtual && i.dias_permanencia;
    });
  }

  if (internacoesFiltradas.length === 0) return 0;

  const soma = internacoesFiltradas.reduce((sum, i) => sum + (i.dias_permanencia || 0), 0);
  return Number((soma / internacoesFiltradas.length).toFixed(1));
}

/**
 * Calcula média de permanência por centro de custo (mês)
 */
export function calculateMediaPermanenciaPorCentroCusto(
  internacoes: Internacao[]
): Record<string, number> {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const internacoesMes = internacoes.filter((i) => {
    const dataSaida = i.data_saida ? new Date(i.data_saida) : null;
    return dataSaida && dataSaida.getMonth() === mesAtual && dataSaida.getFullYear() === anoAtual && i.dias_permanencia;
  });

  const porCentroCusto: Record<string, { soma: number; count: number }> = {};

  internacoesMes.forEach((i) => {
    if (!porCentroCusto[i.centro_custo]) {
      porCentroCusto[i.centro_custo] = { soma: 0, count: 0 };
    }
    porCentroCusto[i.centro_custo].soma += i.dias_permanencia || 0;
    porCentroCusto[i.centro_custo].count++;
  });

  const resultado: Record<string, number> = {};
  Object.entries(porCentroCusto).forEach(([centro, dados]) => {
    resultado[centro] = dados.count > 0
      ? Number((dados.soma / dados.count).toFixed(1))
      : 0;
  });

  return resultado;
}

/**
 * Calcula intervalo de substituição (tempo entre saída e nova entrada)
 */
export function calculateIntervaloSubstituicao(
  internacoes: Internacao[],
  periodo: 'dia' | 'mes'
): number {
  // Ordenar por data de saída
  const internacoesComSaida = internacoes
    .filter((i) => i.data_saida)
    .sort((a, b) => new Date(a.data_saida!).getTime() - new Date(b.data_saida!).getTime());

  if (internacoesComSaida.length < 2) return 0;

  const intervalos: number[] = [];
  for (let i = 1; i < internacoesComSaida.length; i++) {
    const anterior = new Date(internacoesComSaida[i - 1].data_saida!);
    const atual = new Date(internacoesComSaida[i].data_entrada);
    const diffDias = Math.floor((atual.getTime() - anterior.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDias >= 0) {
      intervalos.push(diffDias);
    }
  }

  if (intervalos.length === 0) return 0;
  const soma = intervalos.reduce((sum, intervalo) => sum + intervalo, 0);
  return Number((soma / intervalos.length).toFixed(1));
}

/**
 * Calcula intervalo de substituição por centro de custo
 */
export function calculateIntervaloSubstituicaoPorCentroCusto(
  internacoes: Internacao[]
): Record<string, number> {
  const porCentroCusto: Record<string, Internacao[]> = {};

  internacoes.forEach((i) => {
    if (!porCentroCusto[i.centro_custo]) {
      porCentroCusto[i.centro_custo] = [];
    }
    porCentroCusto[i.centro_custo].push(i);
  });

  const resultado: Record<string, number> = {};
  Object.entries(porCentroCusto).forEach(([centro, internacoesCentro]) => {
    resultado[centro] = calculateIntervaloSubstituicao(internacoesCentro, 'mes');
  });

  return resultado;
}

/**
 * Calcula rotatividade dos leitos (número de vezes que um leito foi ocupado/liberado)
 */
export function calculateRotatividadeLeitos(
  internacoes: Internacao[],
  periodo: 'dia' | 'mes'
): number {
  const hoje = new Date();
  let internacoesFiltradas = internacoes;

  if (periodo === 'dia') {
    const hojeStr = hoje.toISOString().split('T')[0];
    internacoesFiltradas = internacoes.filter((i) => {
      const dataEntrada = new Date(i.data_entrada).toISOString().split('T')[0];
      return dataEntrada === hojeStr || (i.data_saida && new Date(i.data_saida).toISOString().split('T')[0] === hojeStr);
    });
  } else {
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    internacoesFiltradas = internacoes.filter((i) => {
      const dataEntrada = new Date(i.data_entrada);
      return dataEntrada.getMonth() === mesAtual && dataEntrada.getFullYear() === anoAtual;
    });
  }

  // Contar entradas e saídas
  const entradas = internacoesFiltradas.length;
  const saidas = internacoesFiltradas.filter((i) => i.data_saida).length;

  return entradas + saidas;
}

/**
 * Calcula rotatividade por centro de custo
 */
export function calculateRotatividadePorCentroCusto(
  internacoes: Internacao[],
  periodo: 'dia' | 'mes'
): Record<string, number> {
  const porCentroCusto: Record<string, Internacao[]> = {};

  internacoes.forEach((i) => {
    if (!porCentroCusto[i.centro_custo]) {
      porCentroCusto[i.centro_custo] = [];
    }
    porCentroCusto[i.centro_custo].push(i);
  });

  const resultado: Record<string, number> = {};
  Object.entries(porCentroCusto).forEach(([centro, internacoesCentro]) => {
    resultado[centro] = calculateRotatividadeLeitos(internacoesCentro, periodo);
  });

  return resultado;
}

/**
 * Calcula entradas e saídas por dia/mês
 */
export function calculateEntradasSaidas(
  internacoes: Internacao[],
  periodo: 'dia' | 'mes'
): EntradaSaida[] {
  const hoje = new Date();
  let dias: string[] = [];

  if (periodo === 'dia') {
    // Últimos 7 dias
    for (let i = 6; i >= 0; i--) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - i);
      dias.push(data.toISOString().split('T')[0]);
    }
  } else {
    // Últimos 30 dias
    for (let i = 29; i >= 0; i--) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - i);
      dias.push(data.toISOString().split('T')[0]);
    }
  }

  return dias.map((dia) => {
    const entradas = internacoes.filter((i) => {
      const dataEntrada = new Date(i.data_entrada).toISOString().split('T')[0];
      return dataEntrada === dia;
    }).length;

    const saidas = internacoes.filter((i) => {
      const dataSaida = i.data_saida ? new Date(i.data_saida).toISOString().split('T')[0] : null;
      return dataSaida === dia;
    }).length;

    return { data: dia, entradas, saidas };
  });
}

/**
 * Calcula óbitos por dia/mês
 */
export function calculateObitos(
  internacoes: Internacao[],
  periodo: 'dia' | 'mes'
): number {
  const hoje = new Date();
  let internacoesFiltradas = internacoes.filter((i) => i.obito);

  if (periodo === 'dia') {
    const hojeStr = hoje.toISOString().split('T')[0];
    internacoesFiltradas = internacoesFiltradas.filter((i) => {
      const dataSaida = i.data_saida ? new Date(i.data_saida).toISOString().split('T')[0] : null;
      return dataSaida === hojeStr;
    });
  } else {
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    internacoesFiltradas = internacoesFiltradas.filter((i) => {
      const dataSaida = i.data_saida ? new Date(i.data_saida) : null;
      return dataSaida && dataSaida.getMonth() === mesAtual && dataSaida.getFullYear() === anoAtual;
    });
  }

  return internacoesFiltradas.length;
}

/**
 * Calcula internações vinculadas ao PS por médico
 */
export function calculateInternacoesPSPorMedico(
  internacoes: Internacao[],
  periodo: 'dia' | 'mes'
): InternacaoPS[] {
  const hoje = new Date();
  let internacoesFiltradas = internacoes.filter((i) => i.vinculado_ps);

  if (periodo === 'dia') {
    const hojeStr = hoje.toISOString().split('T')[0];
    internacoesFiltradas = internacoesFiltradas.filter((i) => {
      const dataEntrada = new Date(i.data_entrada).toISOString().split('T')[0];
      return dataEntrada === hojeStr;
    });
  } else {
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    internacoesFiltradas = internacoesFiltradas.filter((i) => {
      const dataEntrada = new Date(i.data_entrada);
      return dataEntrada.getMonth() === mesAtual && dataEntrada.getFullYear() === anoAtual;
    });
  }

  const porMedico: Record<string, { medico: string; especialidade: string; quantidade: number }> = {};

  internacoesFiltradas.forEach((i) => {
    const key = `${i.medico}_${i.especialidade}`;
    if (!porMedico[key]) {
      porMedico[key] = { medico: i.medico, especialidade: i.especialidade, quantidade: 0 };
    }
    porMedico[key].quantidade++;
  });

  return Object.values(porMedico).map((item) => ({
    medico: item.medico,
    especialidade: item.especialidade,
    quantidade: item.quantidade,
    periodo,
  }));
}

/**
 * Calcula internações vinculadas ao PS por especialidade
 */
export function calculateInternacoesPSPorEspecialidade(
  internacoes: Internacao[],
  periodo: 'dia' | 'mes'
): InternacaoPS[] {
  const hoje = new Date();
  let internacoesFiltradas = internacoes.filter((i) => i.vinculado_ps);

  if (periodo === 'dia') {
    const hojeStr = hoje.toISOString().split('T')[0];
    internacoesFiltradas = internacoesFiltradas.filter((i) => {
      const dataEntrada = new Date(i.data_entrada).toISOString().split('T')[0];
      return dataEntrada === hojeStr;
    });
  } else {
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    internacoesFiltradas = internacoesFiltradas.filter((i) => {
      const dataEntrada = new Date(i.data_entrada);
      return dataEntrada.getMonth() === mesAtual && dataEntrada.getFullYear() === anoAtual;
    });
  }

  const porEspecialidade: Record<string, number> = {};

  internacoesFiltradas.forEach((i) => {
    porEspecialidade[i.especialidade] = (porEspecialidade[i.especialidade] || 0) + 1;
  });

  return Object.entries(porEspecialidade).map(([especialidade, quantidade]) => ({
    medico: '',
    especialidade,
    quantidade,
    periodo,
  }));
}

/**
 * Calcula classificação de risco
 */
export function calculateClassificacaoRisco(
  internacoes: Internacao[],
  periodo: 'dia' | 'mes'
): ClassificacaoRisco[] {
  const hoje = new Date();
  let internacoesFiltradas = internacoes.filter((i) => i.classificacao_risco);

  if (periodo === 'dia') {
    const hojeStr = hoje.toISOString().split('T')[0];
    internacoesFiltradas = internacoesFiltradas.filter((i) => {
      const dataEntrada = new Date(i.data_entrada).toISOString().split('T')[0];
      return dataEntrada === hojeStr;
    });
  } else {
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    internacoesFiltradas = internacoesFiltradas.filter((i) => {
      const dataEntrada = new Date(i.data_entrada);
      return dataEntrada.getMonth() === mesAtual && dataEntrada.getFullYear() === anoAtual;
    });
  }

  const porClassificacao: Record<string, number> = {};

  internacoesFiltradas.forEach((i) => {
    const classificacao = i.classificacao_risco || 'sem_classificacao';
    porClassificacao[classificacao] = (porClassificacao[classificacao] || 0) + 1;
  });

  return Object.entries(porClassificacao).map(([classificacao, quantidade]) => ({
    classificacao,
    quantidade,
    periodo,
  }));
}

/**
 * Calcula top 10 maiores proveniências
 */
export function calculateTopProveniencias(
  internacoes: Internacao[],
  periodo: 'dia' | 'mes',
  limit: number = 10
): Proveniencia[] {
  const hoje = new Date();
  let internacoesFiltradas = internacoes;

  if (periodo === 'dia') {
    const hojeStr = hoje.toISOString().split('T')[0];
    internacoesFiltradas = internacoes.filter((i) => {
      const dataEntrada = new Date(i.data_entrada).toISOString().split('T')[0];
      return dataEntrada === hojeStr;
    });
  } else {
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    internacoesFiltradas = internacoes.filter((i) => {
      const dataEntrada = new Date(i.data_entrada);
      return dataEntrada.getMonth() === mesAtual && dataEntrada.getFullYear() === anoAtual;
    });
  }

  const porProveniencia: Record<string, number> = {};

  internacoesFiltradas.forEach((i) => {
    porProveniencia[i.proveniencia] = (porProveniencia[i.proveniencia] || 0) + 1;
  });

  return Object.entries(porProveniencia)
    .map(([proveniencia, quantidade]) => ({ proveniencia, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, limit);
}

/**
 * Calcula proveniência por centro de custo
 */
export function calculateProvenienciaPorCentroCusto(
  internacoes: Internacao[]
): Record<string, Proveniencia[]> {
  const porCentroCusto: Record<string, Record<string, number>> = {};

  internacoes.forEach((i) => {
    if (!porCentroCusto[i.centro_custo]) {
      porCentroCusto[i.centro_custo] = {};
    }
    porCentroCusto[i.centro_custo][i.proveniencia] = (porCentroCusto[i.centro_custo][i.proveniencia] || 0) + 1;
  });

  const resultado: Record<string, Proveniencia[]> = {};
  Object.entries(porCentroCusto).forEach(([centro, proveniencias]) => {
    resultado[centro] = Object.entries(proveniencias)
      .map(([proveniencia, quantidade]) => ({ proveniencia, quantidade, centro_custo: centro }))
      .sort((a, b) => b.quantidade - a.quantidade);
  });

  return resultado;
}

/**
 * Calcula paciente-dia x leito-dia
 */
export function calculatePacienteDiaLeitoDia(
  internacoes: Internacao[],
  periodo: 'dia' | 'mes'
): PacienteDiaLeitoDia[] {
  const hoje = new Date();
  let dias: string[] = [];

  if (periodo === 'dia') {
    // Últimos 7 dias
    for (let i = 6; i >= 0; i--) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - i);
      dias.push(data.toISOString().split('T')[0]);
    }
  } else {
    // Últimos 30 dias
    for (let i = 29; i >= 0; i--) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - i);
      dias.push(data.toISOString().split('T')[0]);
    }
  }

  return dias.map((dia) => {
    // Pacientes internados neste dia
    const pacienteDia = internacoes.filter((i) => {
      const dataEntrada = new Date(i.data_entrada).toISOString().split('T')[0];
      const dataSaida = i.data_saida ? new Date(i.data_saida).toISOString().split('T')[0] : null;
      return dataEntrada <= dia && (!dataSaida || dataSaida >= dia);
    }).length;

    // Leitos ocupados neste dia (assumindo 1 paciente por leito)
    const leitoDia = pacienteDia;

    return { data: dia, paciente_dia: pacienteDia, leito_dia: leitoDia };
  });
}
