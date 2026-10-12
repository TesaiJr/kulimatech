// src/app/(dashboard)/mensagens/alertas/page.tsx
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AlertasContainer } from '@/features/comunicacao/components/AlertasContainer';
import { getAlertasInitialData } from '@/features/comunicacao/server/getAlertasInitialData';
import { USER_ROLES_INFO, UserRole } from '@/types/auth';

/**
 * Painel oficial de Alertas & Notificações SDAE Nhamatanda.
 * Server Component: Os alertas são pré-carregados no servidor diretamente do banco de dados,
 * eliminando totalmente o ecrã de espera, spinners travados ou mensagens de loading.
 */
export default async function AlertasPage() {
  const initialData = await getAlertasInitialData();

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
    <DashboardLayout activeNavId="alerts" user={layoutUser}>
      <AlertasContainer
        initialAlertas={initialData.alertas}
        initialTotalNaoLidos={initialData.totalNaoLidos}
        currentUser={initialData.user}
      />
    </DashboardLayout>
  );
}