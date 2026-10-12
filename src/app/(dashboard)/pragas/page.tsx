// src/app/(dashboard)/pragas/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Alert, Badge } from '@/components/ui';
import { USER_ROLES_INFO, UserRole } from '@/types/auth';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { culturaService } from '@/features/culturas/services/culturaService';
import { parcelaService } from '@/features/parcelas/services/parcelaService';
import {
  usePragas,
  useOcorrencias,
  PragaCard,
  PragaFilters,
  PragaDetailModal,
  OcorrenciaFormModal,
  PragaDTO,
} from '@/features/pragas';
import {
  Bug,
  Plus,
  RefreshCw,
  AlertTriangle,
  ClipboardList,
  ShieldAlert,
} from 'lucide-react';

function PragasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCulturaId = searchParams.get('culturaId') || undefined;

  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [culturas, setCulturas] = useState<{ id: string; nome: string }[]>([]);
  const [parcelas, setParcelas] = useState<{ id: string; nome: string }[]>([]);

  // Modais
  const [selectedPragaDetail, setSelectedPragaDetail] = useState<PragaDTO | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [reportPragaPreselected, setReportPragaPreselected] = useState<PragaDTO | null>(null);

  const {
    pragas,
    loading,
    error,
    refresh,
    selectedCulturaId,
    setSelectedCulturaId,
    selectedSeveridade,
    setSelectedSeveridade,
    searchQuery,
    setSearchQuery,
  } = usePragas(initialCulturaId);

  const { createOcorrencia, actionLoading: reportLoading } = useOcorrencias();

  // Redirecionamento se não autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth?mode=login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Carregar lista de culturas e parcelas para os seletores
  useEffect(() => {
    if (isAuthenticated) {
      culturaService
        .getCulturas()
        .then((items) => {
          setCulturas(items.map((c) => ({ id: c.id, nome: c.nome })));
        })
        .catch(() => {});

      parcelaService
        .getParcelas()
        .then((items) => {
          setParcelas(items.map((p) => ({ id: p.id, nome: p.nome })));
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const role: UserRole =
    user?.role === 'TECNICO'
      ? 'TECNICO_SDAE'
      : user?.role === 'ADMIN'
      ? 'ADMIN'
      : 'AGRICULTOR';

  const roleInfo = USER_ROLES_INFO[role];
  const layoutUser = user
    ? {
        name: user.nome,
        email: user.email,
        role: roleInfo.label,
      }
    : undefined;

  const handleResetFilters = () => {
    setSelectedCulturaId('TODOS');
    setSelectedSeveridade('TODOS');
    setSearchQuery('');
  };

  const handleOpenReportFromPraga = (praga: PragaDTO) => {
    setReportPragaPreselected(praga);
    setIsReportModalOpen(true);
  };

  return (
    <DashboardLayout user={layoutUser} activeNavId="pests">
      <div className="space-y-6">
        {/* Cabeçalho da Página */}
        <PageHeader
          title="Catálogo de Pragas e Doenças Agrícolas"
          description="Guia técnico de identificação, sintomas e medidas de maneio fitossanitário integrado para o distrito de Nhamatanda."
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={loading}
                className="gap-1.5 text-xs font-semibold"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>

              <Link href="/pragas/ocorrencias">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs font-semibold border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  Ver Ocorrências
                </Button>
              </Link>

              <Button
                size="sm"
                onClick={() => {
                  setReportPragaPreselected(null);
                  setIsReportModalOpen(true);
                }}
                className="gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="w-4 h-4" />
                Reportar Ocorrência
              </Button>
            </div>
          }
        />

        {/* Mensagem de Erro */}
        {error && (
          <Alert variant="error" title="Erro no Catálogo">
            {error}
          </Alert>
        )}

        {/* Filtros e Busca */}
        <PragaFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCulturaId={selectedCulturaId}
          onCulturaChange={setSelectedCulturaId}
          selectedSeveridade={selectedSeveridade}
          onSeveridadeChange={setSelectedSeveridade}
          culturas={culturas}
          onReset={handleResetFilters}
        />

        {/* Grelha de Pragas */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-60 rounded-2xl bg-white border border-gray-100 p-5 shadow-sm animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="h-16 bg-gray-100 rounded-xl mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : pragas.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bug className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Nenhuma praga encontrada
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Não foram encontradas pragas com os filtros selecionados. Tente selecionar outra cultura ou limpar os termos de pesquisa.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pragas.map((praga) => (
              <PragaCard
                key={praga.id}
                praga={praga}
                onOpenDetails={(p) => setSelectedPragaDetail(p)}
                isAdmin={role === 'ADMIN'}
              />
            ))}
          </div>
        )}

        {/* Modal de Detalhes da Praga */}
        <PragaDetailModal
          isOpen={!!selectedPragaDetail}
          onClose={() => setSelectedPragaDetail(null)}
          praga={selectedPragaDetail}
          onReportarOcorrencia={handleOpenReportFromPraga}
        />

        {/* Modal de Reporte de Ocorrência */}
        <OcorrenciaFormModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          onSubmit={createOcorrencia}
          parcelas={parcelas}
          pragas={pragas}
          defaultPragaId={reportPragaPreselected?.id}
          loading={reportLoading}
        />
      </div>
    </DashboardLayout>
  );
}

export default function PragasPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PragasContent />
    </Suspense>
  );
}