/**
 * Funções de formatação, máscaras em tempo real e tratamento de dados para Moçambique
 */

import { removeNonDigits } from './regex';

/**
 * Aplica máscara de NUIT (Número Único de Identificação Tributária): 000 000 000
 */
export function maskNUIT(value: string | number): string {
  const clean = removeNonDigits(value).slice(0, 9);
  return clean
    .replace(/^(\d{3})(\d)/, '$1 $2')
    .replace(/^(\d{3})\s(\d{3})(\d)/, '$1 $2 $3');
}

/**
 * Aplica máscara de Bilhete de Identidade (BI) de Moçambique: 000000000000-A
 */
export function maskBIMozambique(value: string): string {
  if (!value) return '';

  const clean = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 13);
  const digits = clean.slice(0, 12).replace(/\D/g, '');
  const letter = clean.slice(12).replace(/[^a-zA-Z]/g, '').toUpperCase();

  if (clean.length > 12) {
    return `${digits}-${letter}`;
  }

  return digits;
}

/**
 * Aplica máscara para telefones de Moçambique: (+258) 84 123 4567 ou 84 123 4567
 */
export function maskPhoneMZ(value: string | number, includeCountryCode = false): string {
  const clean = removeNonDigits(value);

  // Se já tiver 258 no início
  const local = clean.startsWith('258') ? clean.slice(3, 12) : clean.slice(0, 9);

  if (local.length <= 2) {
    return includeCountryCode && local ? `+258 ${local}` : local;
  }

  let formatted = '';
  if (local.length <= 5) {
    formatted = local.replace(/^(\d{2})(\d)/, '$1 $2');
  } else {
    formatted = local.replace(/^(\d{2})(\d{3})(\d)/, '$1 $2 $3');
  }

  return includeCountryCode ? `+258 ${formatted}` : formatted;
}

/**
 * Aplica máscara para Código Postal de Moçambique: 0000
 */
export function maskPostalCodeMZ(value: string | number): string {
  return removeNonDigits(value).slice(0, 4);
}

/**
 * Remove qualquer formatação, mantendo apenas dígitos numéricos
 */
export function unmask(value: string | number): string {
  return removeNonDigits(value);
}

/**
 * Formata um valor numérico para Meticais Moçambicanos (ex: 1.250,50 MT)
 */
export function formatCurrencyMZN(value: number | string, symbolPosition: 'after' | 'before' = 'after'): string {
  if (value === null || value === undefined || value === '') return '0,00 MT';

  const num = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
  if (isNaN(num)) return '0,00 MT';

  const formattedNumber = new Intl.NumberFormat('pt-MZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

  return symbolPosition === 'before' ? `MT ${formattedNumber}` : `${formattedNumber} MT`;
}

/**
 * Converte uma string monetária em Meticais para float numérico puro
 */
export function parseCurrencyMZN(value: string): number {
  if (!value) return 0;
  const clean = value.replace(/[^\d,-]/g, '').replace(',', '.');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formata porcentagem (ex: 0.155 -> "15,50%")
 */
export function formatPercent(value: number, decimals = 2): string {
  if (typeof value !== 'number' || isNaN(value)) return '0%';
  return new Intl.NumberFormat('pt-MZ', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formata tamanho de bytes em formato legível (ex: 1024 -> "1 KB")
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  if (!bytes || isNaN(bytes)) return '-';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Formata data no formato DD/MM/AAAA
 */
export function formatDateMZ(dateInput: string | Date | number): string {
  if (!dateInput) return '';

  const date = typeof dateInput === 'string' || typeof dateInput === 'number'
    ? new Date(dateInput)
    : dateInput;

  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('pt-MZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Formata data e hora (DD/MM/AAAA às HH:mm)
 */
export function formatDateTimeMZ(dateInput: string | Date | number): string {
  if (!dateInput) return '';

  const date = typeof dateInput === 'string' || typeof dateInput === 'number'
    ? new Date(dateInput)
    : dateInput;

  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('pt-MZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date).replace(', ', ' às ');
}

/**
 * Formata tempo relativo em português (ex: "há 5 minutos", "há 2 dias")
 */
export function formatRelativeTime(dateInput: string | Date | number): string {
  if (!dateInput) return '';

  const date = typeof dateInput === 'string' || typeof dateInput === 'number'
    ? new Date(dateInput)
    : dateInput;

  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'agora mesmo';

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `há ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `há ${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'}`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `há ${diffInMonths} ${diffInMonths === 1 ? 'mês' : 'meses'}`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `há ${diffInYears} ${diffInYears === 1 ? 'ano' : 'anos'}`;
}

/**
 * Extrai as iniciais do nome para avatares (ex: "Marcelo Silva" -> "MS")
 */
export function formatInitials(name: string, maxInitials = 2): string {
  if (!name) return '';

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, maxInitials).toUpperCase();

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Torna a primeira letra de uma frase maiúscula
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Torna a primeira letra de cada palavra maiúscula (exceto preposições)
 */
export function capitalizeWords(text: string): string {
  if (!text) return '';
  const prepositions = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'para', 'com'];
  return text
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (index > 0 && prepositions.includes(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Trunca uma string adicionando reticências caso ultrapasse o limite
 */
export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text || '';
  return `${text.slice(0, maxLength).trim()}...`;
}

/**
 * Transforma texto em slug URL-friendly
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
