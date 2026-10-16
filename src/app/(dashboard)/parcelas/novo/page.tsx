// src/app/(dashboard)/parcelas/novo/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ParcelaForm } from '@/features/parcelas/components/ParcelaForm';

export default function NovaParcelaPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth?mode=login');
    }
  }, [isLoading, isAuthenticated, router]);

  const layoutUser = user
    ? {
        name: user.nome,
        email: user.email,
        role: user.role === 'TECNICO' ? 'TECNICO_SDAE' : user.role,
      }
    : undefined;

  return (
    <DashboardLayout activeNavId="parcelas" user={layoutUser}>
      {/* Cabeçalho */}
      <PageHeader
        title="Registar Nova Parcela Agrícola"
        description="Registe as informações topográficas, tipo de solo e localização GPS do terreno em Nhamatanda."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Parcelas', href: '/parcelas' },
          { label: 'Nova Parcela', href: '/parcelas/novo' },
        ]}
      />

      {/* Card do Formulário */}
      <div className="max-w-3xl mx-auto">
        <Card variant="surface" className="border border-muted/40 shadow-md">
          <ParcelaForm
            agricultorId={user?.id || 'usr-farm-01'}
            onCancel={() => router.push('/parcelas')}
            onSuccess={() => router.push('/parcelas')}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}