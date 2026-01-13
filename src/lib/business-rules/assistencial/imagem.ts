// Regras de negócio específicas para módulo de Imagem
// Reutiliza as mesmas funções do Laboratório

export * from './laboratorio';
import type { ImagemExame } from '@/types/modules';
import { calculateLaboratorioKPIs } from './laboratorio';

/**
 * Calcula KPIs do módulo de Imagem
 * Reutiliza a mesma lógica do Laboratório
 */
export function calculateImagemKPIs(exames: ImagemExame[]) {
  // Converte ImagemExame para LaboratorioExame para reutilizar funções
  const examesConvertidos = exames.map((e) => ({
    id: e.id,
    paciente_id: e.paciente_id,
    paciente_nome: e.paciente_nome,
    data: e.data,
    tipo_exame: e.tipo_exame,
    convenio: e.convenio,
    valor: e.valor,
    custo_estimado: e.custo_estimado,
    centro_custo: e.centro_custo,
    externo: e.externo,
    repeticao: e.repeticao,
  }));

  return calculateLaboratorioKPIs(examesConvertidos);
}
