/**
 * Constantes do sistema
 */

// Cores do tema
export const COLORS = {
  primary: 'hsl(200, 98%, 39%)',
  success: 'hsl(142, 76%, 36%)',
  warning: 'hsl(38, 92%, 50%)',
  destructive: 'hsl(0, 72%, 50%)',
  info: 'hsl(200, 98%, 39%)',
} as const;

// Tamanhos padrão
export const SIZES = {
  sidebar: {
    width: 280,
    collapsedWidth: 0,
  },
  header: {
    height: 64,
  },
} as const;

// Períodos disponíveis
export const PERIODS = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Últimos 7 dias' },
  { value: 'month', label: 'Últimos 30 dias' },
  { value: 'quarter', label: 'Último trimestre' },
  { value: 'year', label: 'Último ano' },
] as const;

// Setores do hospital
export const SECTORS = [
  { value: 'all', label: 'Todos os setores' },
  { value: 'emergencia', label: 'Emergência' },
  { value: 'uti', label: 'UTI' },
  { value: 'enfermaria', label: 'Enfermaria' },
  { value: 'ambulatorio', label: 'Ambulatório' },
  { value: 'centro_cirurgico', label: 'Centro Cirúrgico' },
] as const;

// Status de atendimento
export const ATENDIMENTO_STATUS = {
  waiting: { label: 'Aguardando', color: 'warning' },
  in_progress: { label: 'Em Atendimento', color: 'info' },
  completed: { label: 'Concluído', color: 'success' },
  cancelled: { label: 'Cancelado', color: 'destructive' },
} as const;

// Status de internação
export const INTERNACAO_STATUS = {
  active: { label: 'Ativa', color: 'info' },
  discharged: { label: 'Alta', color: 'success' },
  transferred: { label: 'Transferida', color: 'warning' },
} as const;

// Status de leito
export const LEITO_STATUS = {
  available: { label: 'Disponível', color: 'success' },
  occupied: { label: 'Ocupado', color: 'info' },
  maintenance: { label: 'Manutenção', color: 'warning' },
} as const;

// Status de agendamento
export const AGENDAMENTO_STATUS = {
  scheduled: { label: 'Agendado', color: 'default' },
  confirmed: { label: 'Confirmado', color: 'success' },
  cancelled: { label: 'Cancelado', color: 'destructive' },
  completed: { label: 'Completo', color: 'success' },
  no_show: { label: 'Falta', color: 'warning' },
} as const;

// Status de exame
export const EXAME_STATUS = {
  pending: { label: 'Pendente', color: 'warning' },
  in_progress: { label: 'Em Andamento', color: 'info' },
  completed: { label: 'Concluído', color: 'success' },
  cancelled: { label: 'Cancelado', color: 'destructive' },
} as const;

// Status de medicamento
export const MEDICAMENTO_STATUS = {
  normal: { label: 'Normal', color: 'success' },
  critical: { label: 'Crítico', color: 'warning' },
  out_of_stock: { label: 'Esgotado', color: 'destructive' },
} as const;

// Severidade UTI
export const UTI_SEVERITY = {
  low: { label: 'Baixa', color: 'success' },
  medium: { label: 'Média', color: 'warning' },
  high: { label: 'Alta', color: 'warning' },
  critical: { label: 'Crítica', color: 'destructive' },
} as const;

// Status UTI
export const UTI_STATUS = {
  stable: { label: 'Estável', color: 'success' },
  unstable: { label: 'Instável', color: 'warning' },
  critical: { label: 'Crítico', color: 'destructive' },
} as const;

// Status CCIH
export const CCIH_STATUS = {
  active: { label: 'Ativa', color: 'warning' },
  resolved: { label: 'Resolvida', color: 'success' },
  monitoring: { label: 'Monitoramento', color: 'info' },
} as const;

// Limites de paginação
export const PAGINATION = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
} as const;

// Timeouts
export const TIMEOUTS = {
  apiRequest: 30000, // 30 segundos
  websocketReconnect: 5000, // 5 segundos
  typingIndicator: 3000, // 3 segundos
} as const;

