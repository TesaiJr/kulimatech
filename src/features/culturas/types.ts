// src/features/culturas/types.ts
// Contratos de dados compartilhados para o Módulo F4: Culturas e Recomendações Técnicas

export type StatusRecomendacao = 'PENDENTE' | 'APLICADA' | 'ARQUIVADA';

export interface Cultura {
  id: string;
  nome: string;
  nomeCientifico: string | null;
  descricao: string;
  humidadeMin: number;
  humidadeMax: number;
  cicloDias: number | null;
  epocaPlantio: string | null;
  cuidados: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: {
    recomendacoes?: number;
  };
}

export interface CulturaListItem {
  id: string;
  nome: string;
  nomeCientifico: string | null;
  descricao: string;
  humidadeMin: number;
  humidadeMax: number;
  cicloDias: number | null;
  epocaPlantio: string | null;
  cuidados: string | null;
}

export interface CreateCulturaInput {
  nome: string;
  nomeCientifico?: string | null;
  descricao: string;
  humidadeMin: number;
  humidadeMax: number;
  cicloDias?: number | null;
  epocaPlantio?: string | null;
  cuidados?: string | null;
}

export interface UpdateCulturaInput extends Partial<CreateCulturaInput> {}

export interface GetCulturasFilters {
  search?: string;
  humidadeIdeal?: number;
}

export interface Recomendacao {
  id: string;
  parcelaId: string;
  tecnicoId: string;
  culturaId: string | null;
  parecer: string;
  status: StatusRecomendacao;
  dataEmissao: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  tecnico: {
    id: string;
    nome: string;
    email?: string;
    telefone?: string | null;
  };
  cultura?: {
    id: string;
    nome: string;
    humidadeMin: number;
    humidadeMax: number;
  } | null;
  parcela?: {
    id: string;
    nome: string;
    areaHectares: number;
    tipoSolo: string;
    agricultorId?: string;
    agricultor?: {
      id: string;
      nome: string;
      telefone?: string | null;
      zonaAtuacao?: string | null;
    };
  };
}

export interface CreateRecomendacaoInput {
  parcelaId: string;
  culturaId?: string | null;
  parecer: string;
}

export interface UpdateStatusRecomendacaoInput {
  status: StatusRecomendacao;
  parecer?: string;
}

export interface GetRecomendacoesFilters {
  parcelaId?: string;
  status?: StatusRecomendacao;
  culturaId?: string;
}
