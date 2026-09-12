/**
 * Tipos comuns e compartilhados em todo o projeto iMunda
 */

export type ID = string | number;

export interface BaseEntity {
  id: ID;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface SelectOption<T = string | number> {
  label: string;
  value: T;
  disabled?: boolean;
  description?: string;
  icon?: string;
}

export type StatusType = 'idle' | 'loading' | 'success' | 'error';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface KeyValuePair<T = unknown> {
  [key: string]: T;
}

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;
