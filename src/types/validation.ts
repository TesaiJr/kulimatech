/**
 * Tipos para o sistema de validações de campos e formulários
 */

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export type ValidatorFn<T = any> = (value: T, allValues?: Record<string, any>) => string | null | undefined;

export interface FieldValidationRule<T = any> {
  validate: ValidatorFn<T>;
  message?: string;
}

export type FormErrors<T = Record<string, any>> = Partial<Record<keyof T, string>>;

export type FormTouched<T = Record<string, any>> = Partial<Record<keyof T, boolean>>;

export interface PasswordStrength {
  score: number; // 0 a 4
  label: 'muito-fraca' | 'fraca' | 'media' | 'forte' | 'muito-forte';
  isValid: boolean;
  errors: string[];
}
