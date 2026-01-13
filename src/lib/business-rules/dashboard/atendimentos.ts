// Regras de negócio para indicadores de Atendimentos do Dashboard

import type {
  Atendimento,
  TopEspecialidade,
  AtendimentoPorHorario,
  DashboardFilter,
} from '@/types/dashboard';

/**
 * Calcula total de atendimentos por tipo (dia ou mês)
 */
export function calculateAtendimentosPorTipo(
  atendimentos: Atendimento[],
  periodo: 'dia' | 'mes'
): Record<string, number> {
  const hoje = new Date();
  let atendimentosFiltrados = atendimentos;

  if (periodo === 'dia') {
    const hojeStr = hoje.toISOString().split('T')[0];
    atendimentosFiltrados = atendimentos.filter((a) => a.data === hojeStr);
  } else {
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    atendimentosFiltrados = atendimentos.filter((a) => {
      const dataAtendimento = new Date(a.data);
      return dataAtendimento.getMonth() === mesAtual && dataAtendimento.getFullYear() === anoAtual;
    });
  }

  const porTipo: Record<string, number> = {};

  atendimentosFiltrados.forEach((a) => {
    porTipo[a.tipo] = (porTipo[a.tipo] || 0) + 1;
  });

  return porTipo;
}

/**
 * Calcula total de atendimentos ambulatoriais
 */
export function calculateAtendimentosAmbulatoriais(
  atendimentos: Atendimento[],
  periodo: 'dia' | 'mes'
): number {
  const hoje = new Date();
  let atendimentosFiltrados = atendimentos;

  if (periodo === 'dia') {
    const hojeStr = hoje.toISOString().split('T')[0];
    atendimentosFiltrados = atendimentos.filter((a) => a.data === hojeStr);
  } else {
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    atendimentosFiltrados = atendimentos.filter((a) => {
      const dataAtendimento = new Date(a.data);
      return dataAtendimento.getMonth() === mesAtual && dataAtendimento.getFullYear() === anoAtual;
    });
  }

  return atendimentosFiltrados.length;
}

/**
 * Calcula atendimentos por categoria de convênio
 */
export function calculateAtendimentosPorCategoriaConvenio(
  atendimentos: Atendimento[],
  periodo: 'dia' | 'mes'
): Record<string, number> {
  const hoje = new Date();
  let atendimentosFiltrados = atendimentos;

  if (periodo === 'dia') {
    const hojeStr = hoje.toISOString().split('T')[0];
    atendimentosFiltrados = atendimentos.filter((a) => a.data === hojeStr);
  } else {
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    atendimentosFiltrados = atendimentos.filter((a) => {
      const dataAtendimento = new Date(a.data);
      return dataAtendimento.getMonth() === mesAtual && dataAtendimento.getFullYear() === anoAtual;
    });
  }

  const porCategoria: Record<string, number> = {};

  atendimentosFiltrados.forEach((a) => {
    const categoria = a.categoria_convenio || 'outro';
    porCategoria[categoria] = (porCategoria[categoria] || 0) + 1;
  });

  return porCategoria;
}

/**
 * Calcula atendimentos por convênio
 */
export function calculateAtendimentosPorConvenio(
  atendimentos: Atendimento[],
  periodo: 'dia' | 'mes'
): Array<{ convenio: string; total: number }> {
  const hoje = new Date();
  let atendimentosFiltrados = atendimentos;

  if (periodo === 'dia') {
    const hojeStr = hoje.toISOString().split('T')[0];
    atendimentosFiltrados = atendimentos.filter((a) => a.data === hojeStr);
  } else {
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    atendimentosFiltrados = atendimentos.filter((a) => {
      const dataAtendimento = new Date(a.data);
      return dataAtendimento.getMonth() === mesAtual && dataAtendimento.getFullYear() === anoAtual;
    });
  }

  const porConvenio: Record<string, number> = {};

  atendimentosFiltrados.forEach((a) => {
    porConvenio[a.convenio] = (porConvenio[a.convenio] || 0) + 1;
  });

  return Object.entries(porConvenio)
    .map(([convenio, total]) => ({ convenio, total }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Calcula atendimentos por tipo de serviço (mês)
 */
export function calculateAtendimentosPorTipoServico(
  atendimentos: Atendimento[]
): Record<string, number> {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const atendimentosMes = atendimentos.filter((a) => {
    const dataAtendimento = new Date(a.data);
    return dataAtendimento.getMonth() === mesAtual && dataAtendimento.getFullYear() === anoAtual;
  });

  const porTipoServico: Record<string, number> = {};

  atendimentosMes.forEach((a) => {
    porTipoServico[a.tipo_servico] = (porTipoServico[a.tipo_servico] || 0) + 1;
  });

  return porTipoServico;
}

/**
 * Calcula top 10 maiores especialidades em atendimento
 */
export function calculateTopEspecialidades(
  atendimentos: Atendimento[],
  periodo: 'dia' | 'mes',
  limit: number = 10
): TopEspecialidade[] {
  const hoje = new Date();
  let atendimentosFiltrados = atendimentos;

  if (periodo === 'dia') {
    const hojeStr = hoje.toISOString().split('T')[0];
    atendimentosFiltrados = atendimentos.filter((a) => a.data === hojeStr);
  } else {
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    atendimentosFiltrados = atendimentos.filter((a) => {
      const dataAtendimento = new Date(a.data);
      return dataAtendimento.getMonth() === mesAtual && dataAtendimento.getFullYear() === anoAtual;
    });
  }

  const porEspecialidade: Record<string, number> = {};

  atendimentosFiltrados.forEach((a) => {
    porEspecialidade[a.especialidade] = (porEspecialidade[a.especialidade] || 0) + 1;
  });

  return Object.entries(porEspecialidade)
    .map(([especialidade, quantidade]) => ({ especialidade, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, limit);
}

/**
 * Calcula especialidades por centro de custo
 */
export function calculateEspecialidadesPorCentroCusto(
  atendimentos: Atendimento[]
): Record<string, TopEspecialidade[]> {
  const porCentroCusto: Record<string, Record<string, number>> = {};

  atendimentos.forEach((a) => {
    if (!porCentroCusto[a.centro_custo]) {
      porCentroCusto[a.centro_custo] = {};
    }
    porCentroCusto[a.centro_custo][a.especialidade] =
      (porCentroCusto[a.centro_custo][a.especialidade] || 0) + 1;
  });

  const resultado: Record<string, TopEspecialidade[]> = {};

  Object.entries(porCentroCusto).forEach(([centro_custo, especialidades]) => {
    resultado[centro_custo] = Object.entries(especialidades)
      .map(([especialidade, quantidade]) => ({ especialidade, quantidade, centro_custo }))
      .sort((a, b) => b.quantidade - a.quantidade);
  });

  return resultado;
}

/**
 * Calcula atendimentos por faixa etária
 */
export function calculateAtendimentosPorFaixaEtaria(
  atendimentos: Atendimento[],
  periodo: 'dia' | 'mes'
): Record<string, number> {
  const hoje = new Date();
  let atendimentosFiltrados = atendimentos;

  if (periodo === 'dia') {
    const hojeStr = hoje.toISOString().split('T')[0];
    atendimentosFiltrados = atendimentos.filter((a) => a.data === hojeStr);
  } else {
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    atendimentosFiltrados = atendimentos.filter((a) => {
      const dataAtendimento = new Date(a.data);
      return dataAtendimento.getMonth() === mesAtual && dataAtendimento.getFullYear() === anoAtual;
    });
  }

  const porFaixaEtaria: Record<string, number> = {};

  atendimentosFiltrados.forEach((a) => {
    const faixa = a.faixa_etaria || 'sem_faixa';
    porFaixaEtaria[faixa] = (porFaixaEtaria[faixa] || 0) + 1;
  });

  return porFaixaEtaria;
}

/**
 * Calcula atendimentos ambulatoriais por faixa horária (mês)
 */
export function calculateAtendimentosPorHorario(
  atendimentos: Atendimento[]
): AtendimentoPorHorario[] {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const atendimentosMes = atendimentos.filter((a) => {
    const dataAtendimento = new Date(a.data);
    return dataAtendimento.getMonth() === mesAtual && dataAtendimento.getFullYear() === anoAtual;
  });

  const porHorario: Record<string, number> = {};

  atendimentosMes.forEach((a) => {
    if (a.hora) {
      // Extrair apenas a hora (ex: "14:30" -> "14h")
      const hora = a.hora.split(':')[0];
      const horario = `${hora}h`;
      porHorario[horario] = (porHorario[horario] || 0) + 1;
    }
  });

  return Object.entries(porHorario)
    .map(([horario, quantidade]) => ({ horario, quantidade }))
    .sort((a, b) => {
      const horaA = parseInt(a.horario.replace('h', ''));
      const horaB = parseInt(b.horario.replace('h', ''));
      return horaA - horaB;
    });
}
