// src/features/parcelas/types.ts
// Contrato de tipos do Dominio e DTOs de Parcelas compartilhados entre Frontend e Backend

export type TipoSolo = 'ARENOSO' | 'ARGILOSO' | 'FRANCO' | 'MISTO' | 'OUTRO';

export interface Parcela {
  id: string;
  nome: string;
  areaHectares: number;
  tipoSolo: TipoSolo;
  localizacao: string | null;
  latitude: number | null;
  longitude: number | null;
  agricultorId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ParcelaAgricultorInfo {
  id: string;
  nome: string;
  telefone: string | null;
  zonaAtuacao: string | null;
}

export interface ParcelaListItem extends Parcela {
  agricultor?: ParcelaAgricultorInfo;
  _count?: {
    leituras: number;
    recomendacoes: number;
    ocorrencias: number;
  };
}

export interface LeituraResumo {
  id: string;
  humidade: number;
  temperatura: number | null;
  statusHumidade: string | null;
  dataLeitura: Date | string;
}

export interface RecomendacaoResumo {
  id: string;
  parecer: string;
  status: 'PENDENTE' | 'APLICADA' | 'ARQUIVADA' | string;
  dataEmissao: Date | string;
  tecnico: {
    id: string;
    nome: string;
  };
  cultura?: {
    id: string;
    nome: string;
  } | null;
}

export interface ParcelaDetalhe extends Parcela {
  agricultor: ParcelaAgricultorInfo;
  leiturasRecentes: LeituraResumo[];
  recomendacoesRecentes: RecomendacaoResumo[];
}

export interface CreateParcelaInput {
  nome: string;
  areaHectares: number;
  tipoSolo: TipoSolo;
  localizacao?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface UpdateParcelaInput {
  nome?: string;
  areaHectares?: number;
  tipoSolo?: TipoSolo;
  localizacao?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}
