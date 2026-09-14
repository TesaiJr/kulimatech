// src/features/auth/types.ts
// Contrato de tipos do Dominio e DTOs (Data Transfer Objects) compartilhados entre Frontend e Backend

export type UserRole = 'ADMIN' | 'TECNICO' | 'AGRICULTOR';

export type UserStatus = 'ATIVO' | 'INATIVO' | 'BLOQUEADO';

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  telefone: string | null;
  zonaAtuacao: string | null;
  createdAt: Date | string;
}

export interface AuthResponseData {
  user: AuthUser;
  token: string;
}
