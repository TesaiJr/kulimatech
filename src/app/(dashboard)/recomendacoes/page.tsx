// src/app/(dashboard)/recomendacoes/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  useRecomendacoes,
  RecomendacaoCard,
  RecomendacaoFilters,
  RecomendacaoStatsCards,
  RecomendacaoFormModal,
} from '@/features/culturas';
import { USER_ROLES_INFO, UserRole } from '@/types/auth';
import {
  ClipboardList,
  Plus,
  RefreshCw,
  FileQuestion,
  FileText,
} from 'lucide-react';

export default function RecomendacoesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const {
    recomendacoes,
    estatisticas,
    loading,
    error,
    statusFiltro,
    setStatusFiltro,
    searchQuery,
    setSearchQuery,
    refresh,
    marcarAplicada,
    arquivarRecomendacao,
    emitirRecomendacao,
  } = useRecomendacoes();

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth?mode=login');
    }
  }, [authLoading, isAuthenticated, router]);

  const role: UserRole =
    user?.role === 'TECNICO'
      ? 'TECNICO_SDAE'
      : user?.role === 'ADMIN'
      ? 'ADMIN'
      : 'AGRICULTOR';

  const roleInfo = USER_ROLES_INFO[role];
  const isTechnicianOrAdmin = user?.role === 'TECNICO' || user?.role === 'ADMIN';

  const layoutUser = user
    ? {
        name: user.nome,
        email: user.email,
        role: roleInfo.label,
      }
    : undefined;

  const activeNavId =
    user?.role === 'AGRICULTOR'
      ? 'received-recommendations'
      : 'recommendations';

  return (
    <DashboardLayout activeNavId={activeNavId} user={layoutUser}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Cabeçalho da Página */}
        <PageHeader
          title="Central de Recomendações Agronómicas"
          description={
            user?.role === 'AGRICULTOR'
              ? 'Consulte as orientações prescritas pelos extensionistas do SDAE para as suas terras e registe a sua aplicação.'
              : 'Prescreva e acompanhe as recomendações técnicas emitidas para os agricultores familiares de Nhamatanda.'
          }
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
                onClick={refresh}
                disabled={loading}
              >
                Atualizar
              </Button>
              {isTechnicianOrAdmin && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setIsModalOpen(true)}
                >
                  Emitir Recomendação
                </Button>
              )}
            </div>
          }
        />

        {/* Estatísticas Rápidas */}
        <RecomendacaoStatsCards stats={estatisticas} loading={loading} />

        {/* Barra de Filtros por Estado e Pesquisa */}
        <RecomendacaoFilters
          status={statusFiltro}
          onStatusChange={setStatusFiltro}
          search={searchQuery}
          onSearchChange={setSearchQuery}
          stats={estatisticas}
        />

        {/* Mensagem de Erro */}
        {error && (
          <Alert variant="error" title="Atenção">
            {error}
          </Alert>
        )}

        {/* Estado de Carregamento */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-56 bg-surface rounded-2xl border border-secondary/20" />
            ))}
          </div>
        )}

        {/* Listagem Vazia */}
        {!loading && recomendacoes.length === 0 && (
          <Card variant="surface" className="text-center py-12">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-secondary/15 flex items-center justify-center text-primary">
                <FileQuestion className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-primary">Nenhuma recomendação encontrada</h3>
              <p className="text-xs text-primary/70 max-w-sm">
                {statusFiltro !== 'TODOS'
                  ? `Não existem recomendações com o estado "${statusFiltro}". Experimente selecionar "Todas".`
                  : 'Ainda não foram emitidas recomendações técnicas correspondentes aos filtros selecionados.'}
              </p>
              {isTechnicianOrAdmin && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setIsModalOpen(true)}
                  className="mt-2"
                >
                  Emitir Primeira Recomendação
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Grid de Recomendações */}
        {!loading && recomendacoes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recomendacoes.map((rec) => (
              <RecomendacaoCard
                key={rec.id}
                recomendacao={rec}
                currentUserId={user?.id}
                userRole={user?.role}
                onMarcarAplicada={marcarAplicada}
                onArquivar={arquivarRecomendacao}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de Emissão Técnica */}
      <RecomendacaoFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitCustom={async (data) => {
          await emitirRecomendacao(data);
        }}
      />
    </DashboardLayout>
  );
}
