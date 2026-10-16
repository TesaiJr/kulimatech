// src/features/comunicacao/types.ts
import { AlertaTipo, UserRole } from '@prisma/client';

export interface InterlocutorDTO {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  telefone?: string | null;
  zonaAtuacao?: string | null;
}

export interface MensagemDTO {
  id: string;
  remetenteId: string;
  destinatarioId: string;
  conteudo: string;
  lida: boolean;
  createdAt: string;
  remetente?: InterlocutorDTO;
  destinatario?: InterlocutorDTO;
  status?: 'sending' | 'sent' | 'error';
  tempId?: string;
}

export interface ConversaResumoDTO {
  interlocutor: InterlocutorDTO;
  ultimaMensagem: {
    id: string;
    conteudo: string;
    createdAt: string;
    enviadaPorMim: boolean;
  } | null;
  totalNaoLidas: number;
}

export interface AlertaDTO {
  id: string;
  userId: string;
  tipo: AlertaTipo;
  titulo: string;
  mensagem: string;
  link?: string | null;
  lido: boolean;
  createdAt: string;
}

export interface AlertasResponseDTO {
  alertas: AlertaDTO[];
  totalNaoLidos: number;
}

export interface EnviarMensagemInput {
  destinatarioId: string;
  conteudo: string;
}
