// Regras de negócio específicas para módulo de Ambulatório

import type { AmbulatorioAgendamento } from '@/types/modules';
import { calculateTaxaNoShow, calculateTaxaOcupacao } from '../calculations';

/**
 * Calcula KPIs do módulo de Ambulatório
 */
export function calculateAmbulatorioKPIs(agendamentos: AmbulatorioAgendamento[]) {
  const hoje = new Date().toISOString().split('T')[0];
  const agendamentosHoje = agendamentos.filter((a) => a.data === hoje);

  const agendados = agendamentos.filter((a) => a.status === 'agendado').length;
  const confirmados = agendamentos.filter((a) => a.status === 'confirmado').length;
  const emAtendimento = agendamentos.filter((a) => a.status === 'em_atendimento').length;
  const finalizados = agendamentos.filter((a) => a.status === 'finalizado').length;
  const noShows = agendamentos.filter((a) => a.status === 'no_show').length;
  const cancelados = agendamentos.filter((a) => a.status === 'cancelado').length;

  // Capacidade estimada (pode vir de configuração)
  const capacidadeEstimada = 200; // Exemplo

  return {
    agendamentosHoje: agendamentosHoje.length,
    taxaOcupacao: calculateTaxaOcupacao(agendados + confirmados + emAtendimento, capacidadeEstimada),
    taxaNoShow: calculateTaxaNoShow(agendamentos),
    agendados,
    confirmados,
    emAtendimento,
    finalizados,
    noShows,
    cancelados,
    encaixesHoje: agendamentosHoje.filter((a) => a.tipo === 'consulta' && a.status === 'agendado').length,
  };
}

/**
 * Identifica agendamentos com risco de no-show
 */
export function identifyRiscoNoShow(
  agendamentos: AmbulatorioAgendamento[],
  historicoNoShow: Record<string, number> = {}
): AmbulatorioAgendamento[] {
  return agendamentos.filter((agendamento) => {
    if (agendamento.status !== 'agendado' && agendamento.status !== 'confirmado') {
      return false;
    }

    // Se paciente tem histórico de no-show
    const historico = historicoNoShow[agendamento.paciente_id] || 0;
    if (historico > 2) {
      return true; // Alto risco
    }

    // Se agendamento foi feito com menos de 24h de antecedência
    const dataAgendamento = new Date(agendamento.data);
    const hoje = new Date();
    const diffHoras = (dataAgendamento.getTime() - hoje.getTime()) / (1000 * 60 * 60);

    if (diffHoras < 24) {
      return true; // Risco médio
    }

    return false;
  });
}

/**
 * Calcula taxa de encaixes
 */
export function calculateTaxaEncaixes(agendamentos: AmbulatorioAgendamento[]): number {
  const total = agendamentos.length;
  if (total === 0) return 0;

  const encaixes = agendamentos.filter(
    (a) => a.tipo === 'consulta' && a.status === 'agendado'
  ).length;

  return Math.round((encaixes / total) * 100);
}

/**
 * Identifica horários com maior disponibilidade
 */
export function identifyHorariosDisponiveis(
  agendamentos: AmbulatorioAgendamento[],
  data: string
): string[] {
  const agendamentosDia = agendamentos.filter((a) => a.data === data);
  const horariosOcupados = new Set(agendamentosDia.map((a) => a.hora));

  // Horários padrão de funcionamento
  const horariosPadrao = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30',
  ];

  return horariosPadrao.filter((hora) => !horariosOcupados.has(hora));
}

/**
 * Calcula novos KPIs solicitados para Ambulatório
 */
export function calculateAmbulatorioNovosKPIs(agendamentos: AmbulatorioAgendamento[]) {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  
  // Agendamentos do mês atual
  const agendamentosMes = agendamentos.filter((a) => {
    const dataAgendamento = new Date(a.data);
    return dataAgendamento.getMonth() === mesAtual && dataAgendamento.getFullYear() === anoAtual;
  });

  // Custo operacional (estimado)
  const custoOperacional = agendamentosMes.length * 50; // Exemplo: R$ 50 por agendamento

  // Atendimentos por clínica médica (especialidade)
  const atendimentosPorClinica = calculateAtendimentosPorClinica(agendamentosMes);

  // Análise percentual por convênio por clínica
  const percentualConvenioPorClinica = calculatePercentualConvenioPorClinica(agendamentosMes);

  // Atendimentos SUS mensal
  const atendimentosSUS = agendamentosMes.filter((a) => {
    // Assumindo que especialidade contém informação sobre SUS
    // Em produção, isso viria de um campo específico
    return a.especialidade.toLowerCase().includes('sus') || true; // Placeholder
  });

  const atendimentosSUSAtendimento = atendimentosSUS.filter((a) => a.tipo === 'consulta' || a.tipo === 'retorno');
  const atendimentosSUSProcedimento = atendimentosSUS.filter((a) => a.tipo === 'procedimento' || a.tipo === 'exame');

  // Fichas abertas e finalizadas
  const fichasAbertas = agendamentosMes.filter((a) => 
    a.status === 'agendado' || a.status === 'confirmado' || a.status === 'em_atendimento'
  ).length;
  const fichasFinalizadas = agendamentosMes.filter((a) => a.status === 'finalizado').length;

  // Procedimentos e exames gerados hospitalar
  const procedimentosExames = agendamentosMes.filter((a) => 
    a.tipo === 'procedimento' || a.tipo === 'exame'
  );

  return {
    custoOperacional,
    atendimentosPorClinica,
    percentualConvenioPorClinica,
    atendimentosSUSAtendimento: atendimentosSUSAtendimento.length,
    atendimentosSUSProcedimento: atendimentosSUSProcedimento.length,
    fichasAbertas,
    fichasFinalizadas,
    procedimentosExamesGerados: procedimentosExames.length,
    detalhesProcedimentosExames: procedimentosExames.map((a) => ({
      id: a.id,
      paciente: a.paciente_nome,
      tipo: a.tipo,
      especialidade: a.especialidade,
      data: a.data,
    })),
  };
}

/**
 * Calcula atendimentos por clínica médica (especialidade)
 */
function calculateAtendimentosPorClinica(agendamentos: AmbulatorioAgendamento[]) {
  const porClinica: Record<string, number> = {};

  agendamentos.forEach((a) => {
    porClinica[a.especialidade] = (porClinica[a.especialidade] || 0) + 1;
  });

  return Object.entries(porClinica)
    .map(([clinica, quantidade]) => ({
      clinica,
      quantidade,
    }))
    .sort((a, b) => b.quantidade - a.quantidade);
}

/**
 * Calcula percentual de atendimentos por convênio por clínica
 * Nota: Requer campo de convênio no AmbulatorioAgendamento
 * Por enquanto, retorna estrutura vazia
 */
function calculatePercentualConvenioPorClinica(agendamentos: AmbulatorioAgendamento[]) {
  // Placeholder - requer campo convenio no tipo AmbulatorioAgendamento
  // Em produção, isso seria calculado com dados reais
  const porClinica: Record<string, Record<string, number>> = {};

  agendamentos.forEach((a) => {
    if (!porClinica[a.especialidade]) {
      porClinica[a.especialidade] = {};
    }
    // Placeholder - assumindo distribuição uniforme
    porClinica[a.especialidade]['convenio'] = (porClinica[a.especialidade]['convenio'] || 0) + 1;
  });

  return Object.entries(porClinica).map(([clinica, convenios]) => {
    const total = Object.values(convenios).reduce((sum, qtd) => sum + qtd, 0);
    return {
      clinica,
      convenios: Object.entries(convenios).map(([convenio, quantidade]) => ({
        convenio,
        quantidade,
        percentual: total > 0 ? Math.round((quantidade / total) * 100) : 0,
      })),
    };
  });
}
