// Validações de dados e regras de negócio

import type { Atendimento, AmbulatorioAgendamento, Internacao } from '@/types/modules';

/**
 * Valida se um atendimento tem todos os campos obrigatórios
 */
export function validateAtendimento(atendimento: Partial<Atendimento>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!atendimento.paciente_id) {
    errors.push('ID do paciente é obrigatório');
  }

  if (!atendimento.paciente_nome) {
    errors.push('Nome do paciente é obrigatório');
  }

  if (!atendimento.data) {
    errors.push('Data é obrigatória');
  }

  if (!atendimento.hora) {
    errors.push('Hora é obrigatória');
  }

  if (!atendimento.especialidade) {
    errors.push('Especialidade é obrigatória');
  }

  if (!atendimento.profissional) {
    errors.push('Profissional é obrigatório');
  }

  if (!atendimento.tipo) {
    errors.push('Tipo de atendimento é obrigatório');
  }

  if (!atendimento.status) {
    errors.push('Status é obrigatório');
  }

  // Validações de formato
  if (atendimento.data && !/^\d{4}-\d{2}-\d{2}$/.test(atendimento.data)) {
    errors.push('Data deve estar no formato YYYY-MM-DD');
  }

  if (atendimento.hora && !/^\d{2}:\d{2}$/.test(atendimento.hora)) {
    errors.push('Hora deve estar no formato HH:MM');
  }

  if (atendimento.tempo_espera_minutos !== undefined && atendimento.tempo_espera_minutos < 0) {
    errors.push('Tempo de espera não pode ser negativo');
  }

  if (atendimento.valor !== undefined && atendimento.valor < 0) {
    errors.push('Valor não pode ser negativo');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valida se um agendamento pode ser criado (sem conflitos)
 */
export function validateAgendamento(
  agendamento: Partial<AmbulatorioAgendamento>,
  agendamentosExistentes: AmbulatorioAgendamento[]
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validações básicas
  if (!agendamento.data || !agendamento.hora || !agendamento.profissional) {
    errors.push('Data, hora e profissional são obrigatórios');
    return { valid: false, errors, warnings };
  }

  // Verificar conflitos de horário
  const conflitos = agendamentosExistentes.filter(
    (a) =>
      a.profissional === agendamento.profissional &&
      a.data === agendamento.data &&
      a.hora === agendamento.hora &&
      a.status !== 'cancelado' &&
      a.status !== 'no_show' &&
      a.id !== agendamento.id
  );

  if (conflitos.length > 0) {
    errors.push(
      `Conflito de horário: profissional já tem agendamento neste horário`
    );
  }

  // Verificar se paciente já tem agendamento no mesmo dia
  if (agendamento.paciente_id) {
    const agendamentosPaciente = agendamentosExistentes.filter(
      (a) =>
        a.paciente_id === agendamento.paciente_id &&
        a.data === agendamento.data &&
        a.status !== 'cancelado' &&
        a.id !== agendamento.id
    );

    if (agendamentosPaciente.length > 0) {
      warnings.push('Paciente já possui agendamento neste dia');
    }
  }

  // Validar data não pode ser no passado (para novos agendamentos)
  if (agendamento.data && !agendamento.id) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataAgendamento = new Date(agendamento.data);

    if (dataAgendamento < hoje) {
      errors.push('Não é possível agendar para datas passadas');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Valida se uma internação pode ser realizada
 */
export function validateInternacao(
  internacao: Partial<Internacao>,
  leitosDisponiveis: number
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!internacao.paciente_id) {
    errors.push('ID do paciente é obrigatório');
  }

  if (!internacao.data_internacao) {
    errors.push('Data de internação é obrigatória');
  }

  if (!internacao.leito) {
    errors.push('Leito é obrigatório');
  }

  if (!internacao.setor) {
    errors.push('Setor é obrigatório');
  }

  if (!internacao.diagnostico) {
    errors.push('Diagnóstico é obrigatório');
  }

  if (leitosDisponiveis <= 0) {
    warnings.push('Nenhum leito disponível no momento');
  }

  // Validar data de alta não pode ser antes da internação
  if (internacao.data_internacao && internacao.data_alta) {
    const dataInternacao = new Date(internacao.data_internacao);
    const dataAlta = new Date(internacao.data_alta);

    if (dataAlta < dataInternacao) {
      errors.push('Data de alta não pode ser anterior à data de internação');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Valida formato de CPF
 */
export function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');

  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(10))) return false;

  return true;
}

/**
 * Valida formato de CNPJ
 */
export function validateCNPJ(cnpj: string): boolean {
  const cleanCNPJ = cnpj.replace(/\D/g, '');

  if (cleanCNPJ.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;

  let length = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, length);
  const digits = cleanCNPJ.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  length = length + 1;
  numbers = cleanCNPJ.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
}

/**
 * Valida email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida telefone brasileiro
 */
export function validatePhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
}
