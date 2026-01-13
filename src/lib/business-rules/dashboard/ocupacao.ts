// Regras de negócio para indicadores de Ocupação de Leitos do Dashboard

import type {
  Leito,
  OcupacaoLeito,
  OcupacaoPorConvenio,
  StatusOcupacao,
  DashboardFilter,
} from '@/types/dashboard';

/**
 * Calcula ocupação de leitos por centro de custo
 */
export function calculateOcupacaoPorCentroCusto(
  leitos: Leito[],
  leitosCadastrados: { centro_custo: string; total: number }[]
): OcupacaoLeito[] {
  const porCentroCusto: Record<string, {
    cadastrados: number;
    ocupados: number;
    vagos: number;
    manutencao: number;
    reservados: number;
  }> = {};

  // Inicializar com leitos cadastrados
  leitosCadastrados.forEach((l) => {
    porCentroCusto[l.centro_custo] = {
      cadastrados: l.total,
      ocupados: 0,
      vagos: 0,
      manutencao: 0,
      reservados: 0,
    };
  });

  // Contar status dos leitos
  leitos.forEach((leito) => {
    if (!porCentroCusto[leito.centro_custo]) {
      porCentroCusto[leito.centro_custo] = {
        cadastrados: 0,
        ocupados: 0,
        vagos: 0,
        manutencao: 0,
        reservados: 0,
      };
    }

    switch (leito.status) {
      case 'ocupado':
        porCentroCusto[leito.centro_custo].ocupados++;
        break;
      case 'disponivel':
        porCentroCusto[leito.centro_custo].vagos++;
        break;
      case 'manutencao':
        porCentroCusto[leito.centro_custo].manutencao++;
        break;
      case 'reservado':
        porCentroCusto[leito.centro_custo].reservados++;
        break;
    }
  });

  // Calcular leitos censo (ocupados + reservados)
  return Object.entries(porCentroCusto).map(([centro_custo, dados]) => {
    const leitosCenso = dados.ocupados + dados.reservados;
    const taxaOcupacao = dados.cadastrados > 0
      ? Number(((leitosCenso / dados.cadastrados) * 100).toFixed(0))
      : 0;

    return {
      centro_custo,
      leitos_cadastrados: dados.cadastrados,
      leitos_ocupados: dados.ocupados,
      leitos_vagos: dados.vagos,
      leitos_censo: leitosCenso,
      taxa_ocupacao: taxaOcupacao,
    };
  });
}

/**
 * Calcula status de ocupação dos leitos
 */
export function calculateStatusOcupacao(
  leitos: Leito[]
): StatusOcupacao[] {
  const porCentroCusto: Record<string, StatusOcupacao> = {};

  leitos.forEach((leito) => {
    if (!porCentroCusto[leito.centro_custo]) {
      porCentroCusto[leito.centro_custo] = {
        centro_custo: leito.centro_custo,
        ocupados: 0,
        disponiveis: 0,
        manutencao: 0,
        reservados: 0,
      };
    }

    switch (leito.status) {
      case 'ocupado':
        porCentroCusto[leito.centro_custo].ocupados++;
        break;
      case 'disponivel':
        porCentroCusto[leito.centro_custo].disponiveis++;
        break;
      case 'manutencao':
        porCentroCusto[leito.centro_custo].manutencao++;
        break;
      case 'reservado':
        porCentroCusto[leito.centro_custo].reservados++;
        break;
    }
  });

  return Object.values(porCentroCusto);
}

/**
 * Calcula ocupação por convênio dentro de um centro de custo
 */
export function calculateOcupacaoPorConvenio(
  internacoes: Array<{ centro_custo: string; convenio?: string }>,
  leitos: Leito[]
): Record<string, OcupacaoPorConvenio[]> {
  const porCentroCusto: Record<string, Record<string, number>> = {};

  // Agrupar internacoes por centro de custo e convênio
  internacoes.forEach((internacao) => {
    if (!internacao.convenio) return;

    if (!porCentroCusto[internacao.centro_custo]) {
      porCentroCusto[internacao.centro_custo] = {};
    }

    porCentroCusto[internacao.centro_custo][internacao.convenio] =
      (porCentroCusto[internacao.centro_custo][internacao.convenio] || 0) + 1;
  });

  // Contar leitos ocupados por centro de custo
  const leitosPorCentro: Record<string, number> = {};
  leitos.forEach((leito) => {
    if (leito.status === 'ocupado') {
      leitosPorCentro[leito.centro_custo] = (leitosPorCentro[leito.centro_custo] || 0) + 1;
    }
  });

  // Montar resultado
  const resultado: Record<string, OcupacaoPorConvenio[]> = {};

  Object.entries(porCentroCusto).forEach(([centro_custo, convenios]) => {
    resultado[centro_custo] = Object.entries(convenios).map(([convenio, total_internacoes]) => ({
      centro_custo,
      convenio,
      total_internacoes,
      leitos_ocupados: leitosPorCentro[centro_custo] || 0,
    }));
  });

  return resultado;
}

/**
 * Calcula taxa de ocupação geral baseada em leitos
 */
export function calculateTaxaOcupacaoGeralLeitos(
  leitos: Leito[],
  leitosCadastrados: { centro_custo: string; total: number }[]
): number {
  const totalCadastrados = leitosCadastrados.reduce((sum, l) => sum + l.total, 0);
  const totalOcupados = leitos.filter((l) => l.status === 'ocupado' || l.status === 'reservado').length;

  if (totalCadastrados === 0) return 0;
  return Number(((totalOcupados / totalCadastrados) * 100).toFixed(0));
}

/**
 * Calcula evolução da ocupação ao longo do tempo
 */
export function calculateEvolucaoOcupacao(
  leitos: Leito[],
  periodo: 'dia' | 'mes',
  dias: number = 7
): Array<{ data: string; ocupacao: number; total: number }> {
  const hoje = new Date();
  const resultado: Array<{ data: string; ocupacao: number; total: number }> = [];

  for (let i = dias - 1; i >= 0; i--) {
    const data = new Date(hoje);
    data.setDate(data.getDate() - i);
    const dataStr = data.toISOString().split('T')[0];

    // Para simplificar, vamos usar os dados atuais
    // Em produção, isso viria de um histórico de ocupação
    const ocupados = leitos.filter((l) => l.status === 'ocupado' || l.status === 'reservado').length;
    const total = leitos.length;

    resultado.push({
      data: dataStr,
      ocupacao: ocupados,
      total,
    });
  }

  return resultado;
}
