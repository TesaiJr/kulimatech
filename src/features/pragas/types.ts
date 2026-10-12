// src/features/pragas/types.ts
import { SeveridadePraga, StatusOcorrencia } from '@prisma/client';

export { SeveridadePraga, StatusOcorrencia };

export interface PragaDTO {
  id: string;
  nome: string;
  nomeCientifico?: string | null;
  descricao: string;
  sintomas: string;
  metodosCombate: string;
  severidadePadrao: SeveridadePraga;
  culturaId?: string | null;
  cultura?: {
    id: string;
    nome: string;
  } | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreatePragaDTO {
  nome: string;
  nomeCientifico?: string | null;
  descricao: string;
  sintomas: string;
  metodosCombate: string;
  severidadePadrao?: SeveridadePraga;
  culturaId?: string | null;
}

export interface UpdatePragaDTO extends Partial<CreatePragaDTO> {}

export interface GetPragasFilters {
  culturaId?: string;
  severidade?: string;
  search?: string;
}

export interface OcorrenciaPragaDTO {
  id: string;
  parcelaId: string;
  parcela?: {
    id: string;
    nome: string;
    areaHectares?: number;
    tipoSolo?: string;
    localizacao?: string | null;
  };
  pragaId?: string | null;
  praga?: {
    id: string;
    nome: string;
    nomeCientifico?: string | null;
    descricao?: string;
    sintomas?: string;
    metodosCombate?: string;
    severidadePadrao?: SeveridadePraga;
  } | null;
  agricultorId: string;
  agricultor?: {
    id: string;
    nome: string;
    email?: string;
    telefone?: string | null;
    zonaAtuacao?: string | null;
  };
  descricao: string;
  severidade: SeveridadePraga;
  status: StatusOcorrencia;
  fotoUrl?: string | null;
  dataReporte: string | Date;
  parecerTecnico?: string | null;
  acaoRecomendada?: string | null;
  tecnicoResolutorId?: string | null;
  tecnicoResolutor?: {
    id: string;
    nome: string;
    email?: string;
  } | null;
  dataResolucao?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateOcorrenciaDTO {
  parcelaId: string;
  pragaId?: string | null;
  descricao: string;
  severidade?: SeveridadePraga;
  fotoUrl?: string | null;
}

export interface ResolverOcorrenciaDTO {
  status: StatusOcorrencia;
  parecerTecnico: string;
  acaoRecomendada?: string | null;
}

export interface OcorrenciaEstatisticasDTO {
  total: number;
  abertas: number;
  emAnalise: number;
  resolvidas: number;
  criticas: number;
}

export interface GetOcorrenciasFilters {
  status?: string;
  severidade?: string;
  parcelaId?: string;
  pragaId?: string;
  search?: string;
}
