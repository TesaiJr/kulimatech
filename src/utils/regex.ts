/**
 * Expressões Regulares (Regex) adaptadas para Moçambique e padrões internacionais
 */

/**
 * NUIT (Número Único de Identificação Tributária de Moçambique): 9 dígitos numéricos
 * Formatos aceitos: 123456789, 123 456 789, 123-456-789
 */
export const REGEX_NUIT = /^(?:(\d{3}\s?\d{3}\s?\d{3})|(\d{9}))$/;

/**
 * BI (Bilhete de Identidade da República de Moçambique):
 * Composto por 12 dígitos seguidos de 1 letra maiúscula no final (total 13 caracteres).
 * Exemplos: 110100234567A, 110100234567-A, 110100234567 A
 */
export const REGEX_BI_MZ = /^\d{12}[-\s]?[A-Za-z]$/;

/**
 * Passaporte da República de Moçambique:
 * 2 letras maiúsculas seguidas por 7 dígitos numéricos (ex: AB1234567)
 */
export const REGEX_PASSPORT_MZ = /^[A-Z]{2}\d{7}$/i;

/**
 * Celular / Telemóvel de Moçambique (Operadoras: Vodacom 84/85, Tmcel 82/83, Movitel 86/87)
 * Exemplos: +258 84 123 4567, 84 123 4567, 841234567, +258841234567
 */
export const REGEX_PHONE_MOBILE_MZ = /^(?:(?:\+?258\s?)?)(8[2-7]\d{7})$/;

/**
 * Telefone Geral de Moçambique (Celular 9 dígitos ou Fixo TDM 8 dígitos)
 * Exemplos fixos: 21 123 456, +258 21 123 456
 */
export const REGEX_PHONE_MZ = /^(?:(?:\+?258\s?)?)(?:(8[2-7]\d{7})|(2\d{7}))$/;

/**
 * Código Postal em Moçambique: 4 dígitos numéricos (ex: 1100 Maputo)
 */
export const REGEX_POSTAL_CODE_MZ = /^\d{4}$/;

/**
 * Email de acordo com formato RFC 5322
 */
export const REGEX_EMAIL = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * URLs válidas (http, https)
 */
export const REGEX_URL = /^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?$/i;

/**
 * Apenas dígitos numéricos
 */
export const REGEX_ONLY_DIGITS = /^\d+$/;

/**
 * Apenas caracteres alfabéticos (inclui acentos em português) e espaços
 */
export const REGEX_LETTERS_AND_SPACES = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;

/**
 * Alfanumérico puro
 */
export const REGEX_ALPHANUMERIC = /^[a-zA-Z0-9]+$/;

/**
 * Formato Slug
 */
export const REGEX_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Data formato padrão DD/MM/AAAA
 */
export const REGEX_DATE_PT = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

/**
 * Data formato ISO AAAA-MM-DD
 */
export const REGEX_DATE_ISO = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;

/**
 * Horário formato 24h
 */
export const REGEX_TIME_24H = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;

/**
 * UUID v4
 */
export const REGEX_UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Formato de Moeda em Meticais (ex: 1.250,50 ou 1000,00 ou 500)
 */
export const REGEX_CURRENCY_MZN = /^(\d{1,3}(\.\d{3})*|\d+)(,\d{2})?$/;

/**
 * Regras de Senha Forte
 */
export const REGEX_PASSWORD_UPPERCASE = /[A-Z]/;
export const REGEX_PASSWORD_LOWERCASE = /[a-z]/;
export const REGEX_PASSWORD_NUMBER = /[0-9]/;
export const REGEX_PASSWORD_SPECIAL = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

/**
 * Testa se uma string confere com uma expressão regular
 */
export function testRegex(regex: RegExp, value: string): boolean {
  if (value === null || value === undefined) return false;
  return regex.test(String(value).trim());
}

/**
 * Remove todos os caracteres não numéricos de uma string
 */
export function removeNonDigits(value: string | number): string {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\D/g, '');
}

/**
 * Remove caracteres que não sejam alfanuméricos ou espaços
 */
export function sanitizeAlphanumeric(value: string): string {
  if (!value) return '';
  return value.replace(/[^a-zA-Z0-9\s]/g, '');
}
