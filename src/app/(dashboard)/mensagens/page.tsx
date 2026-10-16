// src/app/(dashboard)/mensagens/page.tsx
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ChatContainer } from '@/features/comunicacao/components/ChatContainer';
import { getChatInitialData } from '@/features/comunicacao/server/getChatInitialData';
import { USER_ROLES_INFO, UserRole } from '@/types/auth';

interface MensagensPageProps {
  searchParams: Promise<{ interlocutorId?: string }>;
}

/**
 * Página oficial de Comunicação Direta (Chat) SDAE Nhamatanda.
 * Server Component: Carrega o histórico e conversas iniciais no servidor para eliminar
 * a sensação de loading e renderiza o ChatContainer em tempo real (Push Events via SSE).
 */
export default async function MensagensPage({ searchParams }: MensagensPageProps) {
  const resolvedParams = await searchParams;
  const targetInterlocutorId = resolvedParams?.interlocutorId;

  // Carregamento de dados inicial no servidor (Prisma direto com cookies HTTP-Only)
  const initialData = await getChatInitialData(targetInterlocutorId);

  const role: UserRole =
    initialData.user?.role === 'TECNICO'
      ? 'TECNICO_SDAE'
      : initialData.user?.role === 'ADMIN'
      ? 'ADMIN'
      : 'AGRICULTOR';

  const roleInfo = USER_ROLES_INFO[role];

  const layoutUser = initialData.user
    ? {
        name: initialData.user.nome,
        email: initialData.user.email,
        role: roleInfo.label,
      }
    : undefined;

  return (
    <DashboardLayout activeNavId="messages" user={layoutUser}>
      <ChatContainer
        initialConversas={initialData.conversas}
        initialMensagens={initialData.mensagens}
        initialInterlocutor={initialData.activeInterlocutor}
        currentUser={initialData.user}
      />
    </DashboardLayout>
  );
}