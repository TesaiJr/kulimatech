// src/features/leituras/types.ts

export type StatusHumidade = 'CRITICA' | 'BAIXA' | 'OPTIMA' | 'EXCESSIVA';

export interface LeituraSoloDTO {
  id: string;
  parcelaId: string;
  parcela?: {
    id: string;
    nome: string;
    areaHectares?: number;
    tipoSolo?: string;
    agricultor?: {
      id: string;
      nome: string;
      email?: string;
      telefone?: string | null;
    };
  };
  humidade: number;
  temperatura?: number | null;
  statusHumidade?: StatusHumidade | string | null;
  observacoes?: string | null;
  dataLeitura: string | Date;

  // Validacao tecnica agronómica
  validadoPorTecnico: boolean;
  tecnicoValidadorId?: string | null;
  tecnicoValidador?: {
    id: string;
    nome: string;
    email: string;
  } | null;
  dataValidacao?: string | Date | null;
  observacoesTecnicas?: string | null;

  createdAt: string | Date;
}

export interface CreateLeituraDTO {
  parcelaId: string;
  humidade: number;
  temperatura?: number | null;
  observacoes?: string | null;
}

export interface ValidarLeituraDTO {
  validado: boolean;
  observacoesTecnicas?: string | null;
}

export interface LeituraEstatisticasDTO {
  totalLeituras: number;
  mediaHumidade7Dias: number;
  mediaHumidade30Dias: number;
  pendentesValidacao: number;
  leiturasCriticas: number;
  distribuicaoStatus?: {
    CRITICA: number;
    BAIXA: number;
    OPTIMA: number;
    EXCESSIVA: number;
  };
}

export interface GetLeiturasFilters {
  parcelaId?: string;
  validado?: 'true' | 'false' | 'all';
  statusHumidade?: string;
  agricultorId?: string;
  dataInicio?: string;
  dataFim?: string;
  search?: string;
  limit?: number;
}
