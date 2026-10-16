// src/features/comunicacao/server/getAlertasInitialData.ts
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyJwtToken } from '@/lib/auth/jwt';
import { AlertaDTO } from '../types';

export interface AlertasInitialData {
  user: {
    id: string;
    nome: string;
    email: string;
    role: string;
  } | null;
  alertas: AlertaDTO[];
  totalNaoLidos: number;
}

/**
 * Carrega a lista inicial de alertas no servidor (Server Component).
 * Elimina totalmente a sensação de loading e telas de espera.
 */
export async function getAlertasInitialData(): Promise<AlertasInitialData> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { user: null, alertas: [], totalNaoLidos: 0 };
    }

    let payload;
    try {
      payload = verifyJwtToken(token);
    } catch {
      return { user: null, alertas: [], totalNaoLidos: 0 };
    }

    const userId = payload.userId;
    const role = payload.role;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};
    if (role !== 'ADMIN') {
      whereClause.userId = userId;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userUnreadFilter: any = { lido: false };
    if (role !== 'ADMIN') {
      userUnreadFilter.userId = userId;
    }

    const [rawAlertas, totalNaoLidos] = await Promise.all([
      prisma.alerta.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.alerta.count({
        where: userUnreadFilter,
      }),
    ]);

    const alertas: AlertaDTO[] = rawAlertas.map((a) => ({
      id: a.id,
      userId: a.userId,
      tipo: a.tipo,
      titulo: a.titulo,
      mensagem: a.mensagem,
      link: a.link,
      lido: a.lido,
      createdAt: a.createdAt.toISOString(),
    }));

    return {
      user: {
        id: payload.userId,
        nome: payload.nome,
        email: payload.email,
        role: payload.role,
      },
      alertas,
      totalNaoLidos,
    };
  } catch (error) {
    console.error('[getAlertasInitialData Error]:', error);
    return { user: null, alertas: [], totalNaoLidos: 0 };
  }
}
