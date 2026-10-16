// src/features/users/types.ts
import { UserRole, UserStatus } from '@/features/auth/types';

export interface UserSummaryItem {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  telefone?: string | null;
  zonaAtuacao?: string | null;
  createdAt: string;
}

export interface UserAdminDTO extends UserSummaryItem {
  _count?: {
    parcelas?: number;
    agricultoresAcompanhados?: number;
    tecnicosResponsaveis?: number;
    leiturasValidadas?: number;
    recomendacoesEmitidas?: number;
  };
  tecnicosResponsaveis?: {
    tecnico: {
      id: string;
      nome: string;
      email: string;
      telefone?: string | null;
    };
  }[];
  agricultoresAcompanhados?: {
    agricultor: {
      id: string;
      nome: string;
      email: string;
      telefone?: string | null;
      zonaAtuacao?: string | null;
    };
  }[];
}

export interface CarteiraTecnicaItem {
  tecnico: UserAdminDTO;
  agricultores: UserAdminDTO[];
  totalAgricultores: number;
}

export interface AtribuicoesResponseData {
  tecnicos: CarteiraTecnicaItem[];
  agricultoresPendentes: UserAdminDTO[];
  totalPendentes: number;
}

export interface UserStatsDTO {
  totalUsers: number;
  totalAdmins: number;
  totalTecnicos: number;
  totalAgricultores: number;
  totalAtivos: number;
  totalInativos: number;
  totalBloqueados: number;
  totalPendentesAtribuicao: number;
}

export interface CreateUserInput {
  nome: string;
  email: string;
  password: string;
  role: UserRole;
  status?: UserStatus;
  telefone?: string;
  zonaAtuacao?: string;
}

export interface UpdateUserInput {
  nome?: string;
  role?: UserRole;
  status?: UserStatus;
  telefone?: string | null;
  zonaAtuacao?: string | null;
  password?: string;
}

export interface AtribuicaoPayload {
  tecnicoId: string;
  agricultorIds: string[];
}
