// Regras de negócio específicas para módulo de CCIH

import type { CCIHInfeccao, CCIHIsolamento } from '@/types/modules';

/**
 * Calcula KPIs do módulo de CCIH
 */
export function calculateCCIHKPIs(
  infeccoes: CCIHInfeccao[],
  isolamentos: CCIHIsolamento[]
) {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  
  // Dados do mês atual
  const infeccoesMes = infeccoes.filter((i) => {
    const dataInfeccao = new Date(i.data);
    return dataInfeccao.getMonth() === mesAtual && dataInfeccao.getFullYear() === anoAtual;
  });

  // Total de pacientes no mês (estimado - em produção viria de outra fonte)
  const totalPacientesMes = 1000; // Placeholder

  // Taxa de Infecção Hospitalar Geral
  const taxaInfeccaoGeral = totalPacientesMes > 0
    ? (infeccoesMes.length / totalPacientesMes) * 1000 // Por 1000 pacientes-dia
    : 0;

  // Taxa de Infecção por Sítio Cirúrgico
  const infeccoesSitioCirurgico = infeccoesMes.filter((i) => i.sitio_cirurgico);
  const totalCirurgias = 200; // Placeholder
  const taxaSitioCirurgico = totalCirurgias > 0
    ? (infeccoesSitioCirurgico.length / totalCirurgias) * 100
    : 0;

  // Taxa de IRAS
  const infeccoesIRAS = infeccoesMes.filter((i) => i.iras);
  const taxaIRAS = totalPacientesMes > 0
    ? (infeccoesIRAS.length / totalPacientesMes) * 1000
    : 0;

  // Pacientes em isolamento (ativos)
  const isolamentosAtivos = isolamentos.filter((i) => !i.data_fim);

  // Uso de antimicrobianos
  const usoAntimicrobianos = infeccoesMes.filter((i) => i.antimicrobiano).length;

  // Topografia de infecções
  const topografiaInfeccoes = calculateTopografiaInfeccoes(infeccoesMes);

  // Taxa de mortalidade relacionada
  const obitos = infeccoesMes.filter((i) => i.desfecho === 'obito').length;
  const taxaMortalidade = infeccoesMes.length > 0
    ? (obitos / infeccoesMes.length) * 100
    : 0;

  // Tempo médio de isolamento
  const tempoMedioIsolamento = calculateTempoMedioIsolamento(isolamentos);

  return {
    taxaInfeccaoHospitalar: Number(taxaInfeccaoGeral.toFixed(2)),
    taxaSitioCirurgico: Number(taxaSitioCirurgico.toFixed(2)),
    taxaIRAS: Number(taxaIRAS.toFixed(2)),
    pacientesIsolamento: isolamentosAtivos.length,
    usoAntimicrobianos,
    topografiaInfeccoes,
    taxaMortalidade: Number(taxaMortalidade.toFixed(2)),
    tempoMedioIsolamento: Number(tempoMedioIsolamento.toFixed(1)),
  };
}

/**
 * Calcula topografia de infecções
 */
function calculateTopografiaInfeccoes(infeccoes: CCIHInfeccao[]) {
  const porTopografia: Record<string, number> = {};

  infeccoes.forEach((i) => {
    porTopografia[i.topografia] = (porTopografia[i.topografia] || 0) + 1;
  });

  return Object.entries(porTopografia)
    .map(([topografia, quantidade]) => ({
      topografia,
      quantidade,
    }))
    .sort((a, b) => b.quantidade - a.quantidade);
}

/**
 * Calcula tempo médio de isolamento
 */
function calculateTempoMedioIsolamento(isolamentos: CCIHIsolamento[]): number {
  const isolamentosFinalizados = isolamentos.filter(
    (i) => i.data_fim && i.dias_isolamento !== undefined && i.dias_isolamento > 0
  );

  if (isolamentosFinalizados.length === 0) return 0;

  const soma = isolamentosFinalizados.reduce(
    (sum, i) => sum + (i.dias_isolamento || 0),
    0
  );

  return soma / isolamentosFinalizados.length;
}
