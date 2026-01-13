// Regras de negócio para métricas operacionais de leitos

import type {
  Leito,
  Internacao,
  LeitoOperacional,
  TipoLeito,
  LeitoPorSetor,
  OcupacaoConvenio,
  OcupacaoEspecialidade,
  TreeMapData,
  KPICritico,
} from '@/types/dashboard';

/**
 * Calcula métricas operacionais de leitos (Convênio, SUS, Ocupado, Livre)
 */
export function calculateLeitosOperacionais(
  leitos: Leito[],
  internacoes: Internacao[]
): LeitoOperacional {
  const leitosOcupados = leitos.filter((l) => l.status === 'ocupado' || l.status === 'reservado');
  const leitosLivres = leitos.filter((l) => l.status === 'disponivel');

  // Contar por convênio (usando internacoes)
  const internacoesConvenio = internacoes.filter(
    (i) => i.convenio && i.convenio !== 'SUS' && i.status === 'internado'
  );
  const internacoesSUS = internacoes.filter(
    (i) => i.convenio === 'SUS' && i.status === 'internado'
  );

  return {
    convenio: internacoesConvenio.length,
    sus: internacoesSUS.length,
    ocupado: leitosOcupados.length,
    livre: leitosLivres.length,
  };
}

/**
 * Calcula distribuição de leitos por tipo
 */
export function calculateTipoLeito(leitos: Leito[]): TipoLeito[] {
  const total = leitos.length;
  if (total === 0) return [];

  const porTipo: Record<string, number> = {};

  leitos.forEach((l) => {
    let tipo: 'ENF' | 'UTI' | 'APT' | 'outro' = 'outro';
    if (l.tipo === 'enfermaria') tipo = 'ENF';
    else if (l.tipo === 'uti' || l.tipo === 'neonatal') tipo = 'UTI';
    else if (l.tipo === 'outro') tipo = 'APT';

    porTipo[tipo] = (porTipo[tipo] || 0) + 1;
  });

  return Object.entries(porTipo)
    .map(([tipo, quantidade]) => ({
      tipo: tipo as 'ENF' | 'UTI' | 'APT' | 'outro',
      quantidade,
      percentual: Number(((quantidade / total) * 100).toFixed(2)),
    }))
    .sort((a, b) => b.quantidade - a.quantidade);
}

/**
 * Calcula leitos por setor
 */
export function calculateLeitosPorSetor(
  leitos: Leito[],
  internacoes: Internacao[]
): LeitoPorSetor[] {
  const porSetor: Record<string, { livre: number; ocupado: number; total: number }> = {};

  // Inicializar com leitos
  leitos.forEach((l) => {
    if (!porSetor[l.centro_custo]) {
      porSetor[l.centro_custo] = { livre: 0, ocupado: 0, total: 0 };
    }
    porSetor[l.centro_custo].total++;
    if (l.status === 'ocupado' || l.status === 'reservado') {
      porSetor[l.centro_custo].ocupado++;
    } else if (l.status === 'disponivel') {
      porSetor[l.centro_custo].livre++;
    }
  });

  return Object.entries(porSetor)
    .map(([setor, dados]) => ({
      setor,
      livre: dados.livre,
      ocupado: dados.ocupado,
      total: dados.total,
    }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Calcula ocupação por convênio (Top 10)
 */
export function calculateOcupacaoPorConvenioTop10(
  internacoes: Internacao[]
): OcupacaoConvenio[] {
  const porConvenio: Record<string, number> = {};

  internacoes
    .filter((i) => i.status === 'internado' && i.convenio)
    .forEach((i) => {
      const convenio = i.convenio || 'Sem Convênio';
      porConvenio[convenio] = (porConvenio[convenio] || 0) + 1;
    });

  const total = Object.values(porConvenio).reduce((sum, qtd) => sum + qtd, 0);

  return Object.entries(porConvenio)
    .map(([convenio, quantidade]) => ({
      convenio,
      quantidade,
      percentual: total > 0 ? Number(((quantidade / total) * 100).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10);
}

/**
 * Calcula ocupação por especialidade (Top 10)
 */
export function calculateOcupacaoPorEspecialidadeTop10(
  internacoes: Internacao[]
): OcupacaoEspecialidade[] {
  const porEspecialidade: Record<string, number> = {};

  internacoes
    .filter((i) => i.status === 'internado' && i.especialidade)
    .forEach((i) => {
      const especialidade = i.especialidade || 'Sem Especialidade';
      porEspecialidade[especialidade] = (porEspecialidade[especialidade] || 0) + 1;
    });

  const total = Object.values(porEspecialidade).reduce((sum, qtd) => sum + qtd, 0);

  return Object.entries(porEspecialidade)
    .map(([especialidade, quantidade]) => ({
      especialidade,
      quantidade,
      percentual: total > 0 ? Number(((quantidade / total) * 100).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10);
}

/**
 * Calcula leito-dia por centro de custo para TreeMap
 */
export function calculateLeitoDiaPorCentroCusto(
  internacoes: Internacao[],
  periodo: 'dia' | 'mes'
): TreeMapData[] {
  const hoje = new Date();
  let dias: number = periodo === 'dia' ? 1 : 30;

  const porCentroCusto: Record<string, number> = {};

  internacoes.forEach((i) => {
    if (!i.centro_custo) return;

    const dataEntrada = new Date(i.data_entrada);
    const dataSaida = i.data_saida ? new Date(i.data_saida) : new Date(hoje);

    // Calcular dias de permanência no período
    let diasNoPeriodo = 0;
    if (periodo === 'dia') {
      const hojeStr = hoje.toISOString().split('T')[0];
      const entradaStr = dataEntrada.toISOString().split('T')[0];
      const saidaStr = dataSaida.toISOString().split('T')[0];
      if (entradaStr <= hojeStr && (!i.data_saida || saidaStr >= hojeStr)) {
        diasNoPeriodo = 1;
      }
    } else {
      const mesAtual = hoje.getMonth();
      const anoAtual = hoje.getFullYear();
      if (
        dataEntrada.getMonth() === mesAtual &&
        dataEntrada.getFullYear() === anoAtual
      ) {
        const diasPermanencia = i.dias_permanencia || 1;
        diasNoPeriodo = diasPermanencia;
      }
    }

    porCentroCusto[i.centro_custo] = (porCentroCusto[i.centro_custo] || 0) + diasNoPeriodo;
  });

  return Object.entries(porCentroCusto)
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Calcula KPIs críticos com status de alerta
 */
export function calculateKPIsCriticos(
  leitos: Leito[],
  leitosCadastrados: { centro_custo: string; total: number }[]
): KPICritico[] {
  const totalLeitos = leitosCadastrados.reduce((sum, l) => sum + l.total, 0);
  const leitosOcupados = leitos.filter((l) => l.status === 'ocupado' || l.status === 'reservado').length;
  const leitosDisponiveis = leitos.filter((l) => l.status === 'disponivel').length;
  const taxaOcupacaoGeral = totalLeitos > 0 ? (leitosOcupados / totalLeitos) * 100 : 0;
  const percentualDisponiveis = totalLeitos > 0 ? (leitosDisponiveis / totalLeitos) * 100 : 0;

  // Taxa de ocupação UTI
  const leitosUTI = leitos.filter((l) => l.tipo === 'uti' || l.tipo === 'neonatal');
  const leitosUTICadastrados = leitosUTI.length;
  const leitosUTIOcupados = leitosUTI.filter((l) => l.status === 'ocupado' || l.status === 'reservado').length;
  const taxaOcupacaoUTI = leitosUTICadastrados > 0
    ? (leitosUTIOcupados / leitosUTICadastrados) * 100
    : 0;

  const kpis: KPICritico[] = [];

  // Taxa de Ocupação Ideal (75-85%)
  kpis.push({
    id: 'taxa_ocupacao_ideal',
    titulo: 'Taxa de Ocupação Ideal',
    valor: Number(taxaOcupacaoGeral.toFixed(2)),
    ideal: { min: 75, max: 85 },
    status:
      taxaOcupacaoGeral >= 75 && taxaOcupacaoGeral <= 85
        ? 'ideal'
        : taxaOcupacaoGeral > 85
        ? 'critico'
        : 'atencao',
    mensagem:
      taxaOcupacaoGeral >= 75 && taxaOcupacaoGeral <= 85
        ? 'Taxa de ocupação dentro do ideal (75-85%)'
        : taxaOcupacaoGeral > 85
        ? 'Taxa de ocupação acima do ideal (>85%)'
        : 'Taxa de ocupação abaixo do ideal (<75%)',
  });

  // Leitos Disponíveis Mínimo (15%)
  kpis.push({
    id: 'leitos_disponiveis_minimo',
    titulo: 'Leitos Disponíveis Mínimo',
    valor: Number(percentualDisponiveis.toFixed(2)),
    ideal: { min: 15 },
    status: percentualDisponiveis >= 15 ? 'ideal' : 'critico',
    mensagem:
      percentualDisponiveis >= 15
        ? 'Leitos disponíveis acima do mínimo (≥15%)'
        : 'Leitos disponíveis abaixo do mínimo (<15%)',
  });

  // Taxa de Ocupação UTI (<90%)
  kpis.push({
    id: 'taxa_ocupacao_uti',
    titulo: 'Taxa de Ocupação UTI',
    valor: Number(taxaOcupacaoUTI.toFixed(2)),
    ideal: { max: 90 },
    status: taxaOcupacaoUTI < 90 ? 'ideal' : 'critico',
    mensagem:
      taxaOcupacaoUTI < 90
        ? 'Taxa de ocupação UTI dentro do limite (<90%)'
        : 'Taxa de ocupação UTI acima do limite (≥90%)',
  });

  return kpis;
}
