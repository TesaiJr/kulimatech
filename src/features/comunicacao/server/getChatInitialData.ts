// src/features/comunicacao/server/getChatInitialData.ts
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyJwtToken } from '@/lib/auth/jwt';
import { ConversaResumoDTO, MensagemDTO, InterlocutorDTO } from '../types';

export interface ChatInitialData {
  user: {
    id: string;
    nome: string;
    email: string;
    role: string;
  } | null;
  conversas: ConversaResumoDTO[];
  mensagens: MensagemDTO[];
  activeInterlocutor: InterlocutorDTO | null;
}

/**
 * Carrega os dados iniciais do chat diretamente no servidor (Server Component).
 * Evita o estado de loading / spinners na primeira renderização.
 */
export async function getChatInitialData(targetInterlocutorId?: string): Promise<ChatInitialData> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { user: null, conversas: [], mensagens: [], activeInterlocutor: null };
    }

    let payload;
    try {
      payload = verifyJwtToken(token);
    } catch {
      return { user: null, conversas: [], mensagens: [], activeInterlocutor: null };
    }

    const userId = payload.userId;
    const role = payload.role;

    let conversas: ConversaResumoDTO[] = [];

    if (role === 'AGRICULTOR') {
      const vinculos = await prisma.tecnicoAgricultor.findMany({
        where: { agricultorId: userId },
        include: {
          tecnico: {
            select: { id: true, nome: true, email: true, role: true, telefone: true, zonaAtuacao: true },
          },
        },
      });

      conversas = await Promise.all(
        vinculos.map(async (v) => {
          const ultimaMensagem = await prisma.mensagem.findFirst({
            where: {
              OR: [
                { remetenteId: userId, destinatarioId: v.tecnico.id },
                { remetenteId: v.tecnico.id, destinatarioId: userId },
              ],
            },
            orderBy: { createdAt: 'desc' },
          });

          const totalNaoLidas = await prisma.mensagem.count({
            where: {
              remetenteId: v.tecnico.id,
              destinatarioId: userId,
              lida: false,
            },
          });

          return {
            interlocutor: v.tecnico,
            ultimaMensagem: ultimaMensagem
              ? {
                  id: ultimaMensagem.id,
                  conteudo: ultimaMensagem.conteudo,
                  createdAt: ultimaMensagem.createdAt.toISOString(),
                  enviadaPorMim: ultimaMensagem.remetenteId === userId,
                }
              : null,
            totalNaoLidas,
          };
        })
      );
    } else if (role === 'TECNICO') {
      const vinculos = await prisma.tecnicoAgricultor.findMany({
        where: { tecnicoId: userId },
        include: {
          agricultor: {
            select: { id: true, nome: true, email: true, role: true, telefone: true, zonaAtuacao: true },
          },
        },
      });

      conversas = await Promise.all(
        vinculos.map(async (v) => {
          const ultimaMensagem = await prisma.mensagem.findFirst({
            where: {
              OR: [
                { remetenteId: userId, destinatarioId: v.agricultor.id },
                { remetenteId: v.agricultor.id, destinatarioId: userId },
              ],
            },
            orderBy: { createdAt: 'desc' },
          });

          const totalNaoLidas = await prisma.mensagem.count({
            where: {
              remetenteId: v.agricultor.id,
              destinatarioId: userId,
              lida: false,
            },
          });

          return {
            interlocutor: v.agricultor,
            ultimaMensagem: ultimaMensagem
              ? {
                  id: ultimaMensagem.id,
                  conteudo: ultimaMensagem.conteudo,
                  createdAt: ultimaMensagem.createdAt.toISOString(),
                  enviadaPorMim: ultimaMensagem.remetenteId === userId,
                }
              : null,
            totalNaoLidas,
          };
        })
      );
    }

    // Determinar interlocutor ativo
    let activeInterlocutor: InterlocutorDTO | null = null;
    if (targetInterlocutorId) {
      const found = conversas.find((c) => c.interlocutor.id === targetInterlocutorId);
      if (found) activeInterlocutor = found.interlocutor;
    }
    if (!activeInterlocutor && conversas.length > 0) {
      activeInterlocutor = conversas[0].interlocutor;
    }

    // Buscar mensagens do interlocutor ativo
    let mensagens: MensagemDTO[] = [];
    if (activeInterlocutor) {
      const rawMensagens = await prisma.mensagem.findMany({
        where: {
          OR: [
            { remetenteId: userId, destinatarioId: activeInterlocutor.id },
            { remetenteId: activeInterlocutor.id, destinatarioId: userId },
          ],
        },
        orderBy: { createdAt: 'asc' },
        include: {
          remetente: {
            select: { id: true, nome: true, email: true, role: true, telefone: true, zonaAtuacao: true },
          },
          destinatario: {
            select: { id: true, nome: true, email: true, role: true, telefone: true, zonaAtuacao: true },
          },
        },
      });

      // Marcar como lidas silenciosamente no servidor
      await prisma.mensagem.updateMany({
        where: {
          remetenteId: activeInterlocutor.id,
          destinatarioId: userId,
          lida: false,
        },
        data: { lida: true },
      });

      mensagens = rawMensagens.map((m) => ({
        id: m.id,
        remetenteId: m.remetenteId,
        destinatarioId: m.destinatarioId,
        conteudo: m.conteudo,
        lida: m.lida,
        createdAt: m.createdAt.toISOString(),
        remetente: m.remetente,
        destinatario: m.destinatario,
        status: 'sent',
      }));
    }

    return {
      user: {
        id: payload.userId,
        nome: payload.nome,
        email: payload.email,
        role: payload.role,
      },
      conversas,
      mensagens,
      activeInterlocutor,
    };
  } catch (error) {
    console.error('[getChatInitialData Error]:', error);
    return { user: null, conversas: [], mensagens: [], activeInterlocutor: null };
  }
}
