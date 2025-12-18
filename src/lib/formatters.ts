/**
 * Formatadores para dados (data, moeda, porcentagem, etc)
 */

import { format, formatDistance, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata uma data para exibição
 */
export function formatDate(date: string | Date, pattern = 'dd/MM/yyyy'): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, pattern, { locale: ptBR });
  } catch {
    return '';
  }
}

/**
 * Formata data e hora
 */
export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
}

/**
 * Formata apenas a hora
 */
export function formatTime(date: string | Date): string {
  return formatDate(date, 'HH:mm');
}

/**
 * Formata tempo relativo (ex: "há 2 horas")
 */
export function formatRelativeTime(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: ptBR });
  } catch {
    return '';
  }
}

/**
 * Formata moeda brasileira (R$)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata porcentagem
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formata número com separadores
 */
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formata duração em minutos para formato legível
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

/**
 * Formata bytes para formato legível
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

