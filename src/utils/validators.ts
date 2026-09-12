/**
 * Validações de campos, documentos e dados adaptadas para a República de Moçambique
 */

import {
  REGEX_EMAIL,
  REGEX_PHONE_MZ,
  REGEX_PHONE_MOBILE_MZ,
  REGEX_BI_MZ,
  REGEX_PASSPORT_MZ,
  REGEX_POSTAL_CODE_MZ,
  REGEX_URL,
  REGEX_DATE_PT,
  REGEX_DATE_ISO,
  REGEX_PASSWORD_UPPERCASE,
  REGEX_PASSWORD_LOWERCASE,
  REGEX_PASSWORD_NUMBER,
  REGEX_PASSWORD_SPECIAL,
  removeNonDigits,
  testRegex,
} from './regex';
import { PasswordStrength, FormErrors } from '@/types/validation';

/**
 * Valida o NUIT (Número Único de Identificação Tributária de Moçambique)
 * O NUIT é composto por 9 dígitos numéricos com dígito de controlo Módulo 11
 */
export function isValidNUIT(nuit: string | number): boolean {
  const clean = removeNonDigits(nuit);

  if (clean.length !== 9) return false;

  // Rejeita sequências com todos os dígitos repetidos (ex: 000000000, 111111111)
  if (/^(\d)\1{8}$/.test(clean)) return false;

  // Cálculo do dígito verificador (Módulo 11 oficial)
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += parseInt(clean.charAt(i), 10) * (9 - i);
  }

  const remainder = sum % 11;
  const checkDigit = remainder < 2 ? 0 : 11 - remainder;

  return checkDigit === parseInt(clean.charAt(8), 10);
}

/**
 * Valida o Bilhete de Identidade (BI) de Moçambique
 * Formato oficial: 12 dígitos numéricos seguidos por 1 letra (total 13 caracteres)
 * Ex: 110100234567A ou 110100234567-A
 */
export function isValidBIMozambique(bi: string): boolean {
  if (!bi) return false;
  const trimmed = bi.trim().replace(/[-\s]/g, '');

  if (trimmed.length !== 13) return false;

  const numbersPart = trimmed.slice(0, 12);
  const letterPart = trimmed.slice(12);

  // Primeiros 12 devem ser dígitos e o último uma letra do alfabeto
  return /^\d{12}$/.test(numbersPart) && /^[A-Za-z]$/.test(letterPart);
}

/**
 * Valida número de telefone de Moçambique (Celular 9 dígitos ou Fixo 8 dígitos, com ou sem +258)
 */
export function isValidPhoneMZ(phone: string): boolean {
  if (!phone) return false;
  const clean = phone.trim().replace(/[^\d+]/g, '');
  return testRegex(REGEX_PHONE_MZ, clean);
}

/**
 * Valida se é um número de celular/telemóvel moçambicano (82, 83, 84, 85, 86, 87)
 */
export function isValidMobileMZ(phone: string): boolean {
  if (!phone) return false;
  const clean = phone.trim().replace(/[^\d+]/g, '');
  return testRegex(REGEX_PHONE_MOBILE_MZ, clean);
}

/**
 * Identifica a operadora de telecomunicações móvel em Moçambique
 */
export function getMozambiqueOperator(phone: string): 'Vodacom' | 'Tmcel' | 'Movitel' | 'Fixo' | 'Desconhecido' {
  const digits = removeNonDigits(phone);
  // Se vier com o prefixo 258, extrai os últimos 9 dígitos
  const localNumber = digits.length > 9 && digits.startsWith('258') ? digits.slice(3) : digits;

  if (localNumber.length === 9) {
    const prefix = localNumber.slice(0, 2);
    if (prefix === '84' || prefix === '85') return 'Vodacom';
    if (prefix === '82' || prefix === '83') return 'Tmcel';
    if (prefix === '86' || prefix === '87') return 'Movitel';
  } else if (localNumber.length === 8 && localNumber.startsWith('2')) {
    return 'Fixo';
  }

  return 'Desconhecido';
}

/**
 * Valida Passaporte moçambicano (2 letras + 7 dígitos)
 */
export function isValidPassportMZ(passport: string): boolean {
  if (!passport) return false;
  return testRegex(REGEX_PASSPORT_MZ, passport.trim());
}

/**
 * Valida Código Postal em Moçambique (4 dígitos)
 */
export function isValidPostalCodeMZ(code: string): boolean {
  const clean = removeNonDigits(code);
  return clean.length === 4 && testRegex(REGEX_POSTAL_CODE_MZ, clean);
}

/**
 * Valida e-mail de acordo com padrão RFC 5322
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return testRegex(REGEX_EMAIL, email);
}

/**
 * Valida URL
 */
export function isValidURL(url: string): boolean {
  if (!url) return false;
  return testRegex(REGEX_URL, url);
}

/**
 * Avalia força de uma senha e aponta itens faltantes
 */
export function validatePasswordStrength(password: string): PasswordStrength {
  const errors: string[] = [];
  let score = 0;

  if (!password || password.length < 8) {
    errors.push('Mínimo de 8 caracteres');
  } else {
    score++;
  }

  if (!REGEX_PASSWORD_UPPERCASE.test(password)) {
    errors.push('Pelo menos uma letra maiúscula');
  } else {
    score++;
  }

  if (!REGEX_PASSWORD_LOWERCASE.test(password)) {
    errors.push('Pelo menos uma letra minúscula');
  } else {
    score++;
  }

  if (!REGEX_PASSWORD_NUMBER.test(password)) {
    errors.push('Pelo menos um número');
  } else {
    score++;
  }

  if (!REGEX_PASSWORD_SPECIAL.test(password)) {
    errors.push('Pelo menos um caractere especial (!@#$%^&*)');
  } else {
    score++;
  }

  const normalizedScore = Math.min(4, Math.max(0, score - 1));

  const labels: Record<number, PasswordStrength['label']> = {
    0: 'muito-fraca',
    1: 'fraca',
    2: 'media',
    3: 'forte',
    4: 'muito-forte',
  };

  return {
    score: normalizedScore,
    label: labels[normalizedScore] || 'muito-fraca',
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Valida se uma string é uma data válida no formato DD/MM/AAAA ou ISO (AAAA-MM-DD)
 */
export function isValidDate(dateStr: string): boolean {
  if (!dateStr) return false;

  let day: number, month: number, year: number;

  if (REGEX_DATE_PT.test(dateStr)) {
    const parts = dateStr.split('/');
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10) - 1;
    year = parseInt(parts[2], 10);
  } else if (REGEX_DATE_ISO.test(dateStr)) {
    const parts = dateStr.split('-');
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10) - 1;
    day = parseInt(parts[2], 10);
  } else {
    return false;
  }

  const date = new Date(year, month, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day &&
    year >= 1900 &&
    year <= 2100
  );
}

/**
 * Valida se uma pessoa atingiu a maioridade (18 anos em Moçambique)
 */
export function isAdult(birthDate: string | Date, minAge: number = 18): boolean {
  let date: Date;

  if (typeof birthDate === 'string') {
    if (REGEX_DATE_PT.test(birthDate)) {
      const [d, m, y] = birthDate.split('/').map(Number);
      date = new Date(y, m - 1, d);
    } else {
      date = new Date(birthDate);
    }
  } else {
    date = birthDate;
  }

  if (isNaN(date.getTime())) return false;

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age--;
  }

  return age >= minAge;
}

/**
 * Valida campo obrigatório
 */
export function validateRequired(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * Valida comprimento mínimo de caracteres
 */
export function validateMinLength(value: string, min: number): boolean {
  if (!value) return false;
  return value.trim().length >= min;
}

/**
 * Valida comprimento máximo de caracteres
 */
export function validateMaxLength(value: string, max: number): boolean {
  if (!value) return true;
  return value.trim().length <= max;
}

/**
 * Valida intervalo numérico
 */
export function validateNumberRange(value: number, min: number, max: number): boolean {
  if (typeof value !== 'number' || isNaN(value)) return false;
  return value >= min && value <= max;
}

/**
 * Motor declarativo de regras de validação para formulários
 */
export type ValidationRule<T = any> = (value: any, formValues: T) => string | null | undefined;

export function createValidator<T extends Record<string, any>>(
  schema: Partial<Record<keyof T, ValidationRule<T>[]>>
) {
  return (values: T): FormErrors<T> => {
    const errors: FormErrors<T> = {};

    for (const key in schema) {
      const rulesList = schema[key];
      if (!rulesList) continue;

      const val = values[key];
      for (const rule of rulesList) {
        const error = rule(val, values);
        if (error) {
          errors[key] = error;
          break;
        }
      }
    }

    return errors;
  };
}

/**
 * Regras prontas para uso em Moçambique
 */
export const rules = {
  required: (msg = 'Campo obrigatório') => (val: any) => (!validateRequired(val) ? msg : null),
  email: (msg = 'E-mail inválido') => (val: string) => (val && !isValidEmail(val) ? msg : null),
  nuit: (msg = 'NUIT inválido (9 dígitos)') => (val: string) => (val && !isValidNUIT(val) ? msg : null),
  bi: (msg = 'BI inválido (12 dígitos seguidos de 1 letra)') => (val: string) => (val && !isValidBIMozambique(val) ? msg : null),
  phoneMZ: (msg = 'Número de telefone de Moçambique inválido (+258 8X XXXXXXX)') => (val: string) =>
    val && !isValidPhoneMZ(val) ? msg : null,
  postalCodeMZ: (msg = 'Código Postal inválido (4 dígitos)') => (val: string) =>
    val && !isValidPostalCodeMZ(val) ? msg : null,
  passportMZ: (msg = 'Passaporte inválido') => (val: string) =>
    val && !isValidPassportMZ(val) ? msg : null,
  minLength: (min: number, msg?: string) => (val: string) =>
    val && !validateMinLength(val, min) ? msg || `Mínimo de ${min} caracteres` : null,
  maxLength: (max: number, msg?: string) => (val: string) =>
    val && !validateMaxLength(val, max) ? msg || `Máximo de ${max} caracteres` : null,
  matches: (regex: RegExp, msg = 'Formato inválido') => (val: string) =>
    val && !regex.test(val) ? msg : null,
  sameAs: <T extends Record<string, any>>(field: keyof T, msg = 'Os campos não coincidem') =>
    (val: any, formValues: T) =>
      val !== formValues[field] ? msg : null,
};
