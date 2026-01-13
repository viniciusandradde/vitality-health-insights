// Regras de negócio específicas para módulo de Fisioterapia

import type { FisioterapiaSessao, FisioterapiaPaciente } from '@/types/modules';

/**
 * Calcula KPIs do módulo de Fisioterapia
 */
export function calculateFisioterapiaKPIs(
  sessoes: FisioterapiaSessao[],
  pacientes: FisioterapiaPaciente[]
) {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  
  // Dados do mês atual
  const sessoesMes = sessoes.filter((s) => {
    const dataSessao = new Date(s.data);
    return dataSessao.getMonth() === mesAtual && dataSessao.getFullYear() === anoAtual;
  });

  // Quantidade de sessões mensais
  const sessoesMensais = sessoesMes.length;

  // Taxa de ocupação de fisioterapeutas (estimada)
  const fisioterapeutas = new Set(sessoesMes.map((s) => s.fisioterapeuta));
  const capacidadeFisioterapeutas = 10; // Placeholder
  const taxaOcupacao = capacidadeFisioterapeutas > 0
    ? (fisioterapeutas.size / capacidadeFisioterapeutas) * 100
    : 0;

  // Evolução de pacientes
  const evolucao = calculateEvolucaoPacientes(sessoesMes);

  // Tempo médio de tratamento
  const tempoMedioTratamento = calculateTempoMedioTratamento(pacientes);

  // Sessões por tipo de tratamento
  const sessoesPorTipo = calculateSessoesPorTipo(sessoesMes);

  // Taxa de comparecimento
  const comparecimentos = sessoesMes.filter((s) => s.comparecimento).length;
  const taxaComparecimento = sessoesMes.length > 0
    ? (comparecimentos / sessoesMes.length) * 100
    : 0;

  // Pacientes em tratamento ativo
  const pacientesAtivos = pacientes.filter((p) => p.status === 'em_tratamento').length;

  // Altas de fisioterapia
  const altas = pacientes.filter((p) => p.status === 'alta').length;

  return {
    sessoesMensais,
    taxaOcupacaoFisioterapeutas: Number(taxaOcupacao.toFixed(2)),
    evolucaoPacientes: evolucao,
    tempoMedioTratamento: Number(tempoMedioTratamento.toFixed(1)),
    sessoesPorTipo,
    taxaComparecimento: Number(taxaComparecimento.toFixed(2)),
    pacientesTratamentoAtivo: pacientesAtivos,
    altasFisioterapia: altas,
  };
}

/**
 * Calcula evolução de pacientes
 */
function calculateEvolucaoPacientes(sessoes: FisioterapiaSessao[]) {
  const porEvolucao: Record<string, number> = {};

  sessoes.forEach((s) => {
    porEvolucao[s.evolucao] = (porEvolucao[s.evolucao] || 0) + 1;
  });

  return {
    melhora: porEvolucao['melhora'] || 0,
    estavel: porEvolucao['estavel'] || 0,
    piora: porEvolucao['piora'] || 0,
    total: sessoes.length,
  };
}

/**
 * Calcula tempo médio de tratamento
 */
function calculateTempoMedioTratamento(pacientes: FisioterapiaPaciente[]): number {
  const pacientesFinalizados = pacientes.filter(
    (p) => p.data_alta && p.dias_tratamento !== undefined && p.dias_tratamento > 0
  );

  if (pacientesFinalizados.length === 0) return 0;

  const soma = pacientesFinalizados.reduce(
    (sum, p) => sum + (p.dias_tratamento || 0),
    0
  );

  return soma / pacientesFinalizados.length;
}

/**
 * Calcula sessões por tipo de tratamento
 */
function calculateSessoesPorTipo(sessoes: FisioterapiaSessao[]) {
  const porTipo: Record<string, number> = {};

  sessoes.forEach((s) => {
    porTipo[s.tipo_tratamento] = (porTipo[s.tipo_tratamento] || 0) + 1;
  });

  return Object.entries(porTipo)
    .map(([tipo, quantidade]) => ({
      tipo,
      quantidade,
    }))
    .sort((a, b) => b.quantidade - a.quantidade);
}
