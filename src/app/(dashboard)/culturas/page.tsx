// src/app/(dashboard)/culturas/page.tsx
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
  useCulturas,
  CulturaCard,
  CulturaFormModal,
  CulturaDeleteDialog,
  CulturaListItem,
  CreateCulturaInput,
  UpdateCulturaInput,
} from '@/features/culturas';
import { USER_ROLES_INFO, UserRole } from '@/types/auth';
import {
  Sprout,
  Search,
  RefreshCw,
  Layers,
  Plus,
  Droplets,
  Filter,
} from 'lucide-react';

export default function CulturasPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const {
    culturas,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    humidadeFiltro,
    setHumidadeFiltro,
    refresh,
    criarCultura,
    atualizarCultura,
    eliminarCultura,
  } = useCulturas();

  const [selectedCultura, setSelectedCultura] = useState<CulturaListItem | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  const isAdmin = user?.role === 'ADMIN';
  const roleInfo = USER_ROLES_INFO[role];

  const layoutUser = user
    ? {
        name: user.nome,
        email: user.email,
        role: roleInfo.label,
      }
    : undefined;

  const handleOpenCreate = () => {
    setSelectedCultura(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (cultura: CulturaListItem) => {
    setSelectedCultura(cultura);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (cultura: CulturaListItem) => {
    setSelectedCultura(cultura);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (data: CreateCulturaInput | UpdateCulturaInput) => {
    if (selectedCultura) {
      await atualizarCultura(selectedCultura.id, data);
    } else {
      await criarCultura(data as CreateCulturaInput);
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    await eliminarCultura(id);
  };

  return (
    <DashboardLayout activeNavId="crop-catalog" user={layoutUser}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Cabeçalho da Página */}
        <PageHeader
          title="Catálogo de Culturas Agronómicas"
          description="Espécies prioritárias, limiares de humidade do solo e orientações técnicas para o distrito de Nhamatanda."
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
              {isAdmin && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={handleOpenCreate}
                >
                  Nova Cultura
                </Button>
              )}
            </div>
          }
        />

        {/* Barra de Pesquisa e Filtros */}
        <Card variant="surface" className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar por cultura, nome científico..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-secondary/30 text-primary placeholder:text-primary/40 text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm"
              />
            </div>

            {/* Filtros Rápidos de Humidade */}
            <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto text-xs">
              <span className="text-primary/60 flex items-center gap-1 mr-1">
                <Droplets className="w-3.5 h-3.5 text-cyan-600" />
                Faixa:
              </span>
              <button
                type="button"
                onClick={() => setHumidadeFiltro(undefined)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  humidadeFiltro === undefined
                    ? 'bg-secondary text-primary font-bold'
                    : 'bg-surface hover:bg-secondary/10 text-primary/70 border border-secondary/20'
                }`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => setHumidadeFiltro(35)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  humidadeFiltro === 35
                    ? 'bg-secondary text-primary font-bold'
                    : 'bg-surface hover:bg-secondary/10 text-primary/70 border border-secondary/20'
                }`}
              >
                Seca (~35%)
              </button>
              <button
                type="button"
                onClick={() => setHumidadeFiltro(55)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  humidadeFiltro === 55
                    ? 'bg-secondary text-primary font-bold'
                    : 'bg-surface hover:bg-secondary/10 text-primary/70 border border-secondary/20'
                }`}
              >
                Média (~55%)
              </button>
              <button
                type="button"
                onClick={() => setHumidadeFiltro(75)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  humidadeFiltro === 75
                    ? 'bg-secondary text-primary font-bold'
                    : 'bg-surface hover:bg-secondary/10 text-primary/70 border border-secondary/20'
                }`}
              >
                Alta (~75%)
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-primary/70 self-end md:self-auto font-medium">
              <Layers className="w-4 h-4 text-secondary" />
              <span>Total: <strong>{culturas.length}</strong> espécies</span>
            </div>
          </div>
        </Card>

        {/* Mensagem de Erro */}
        {error && (
          <Alert variant="error" title="Atenção">
            {error}
          </Alert>
        )}

        {/* Estado de Carregamento */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-surface rounded-2xl border border-secondary/20" />
            ))}
          </div>
        )}

        {/* Listagem Vazia */}
        {!loading && culturas.length === 0 && (
          <Card variant="surface" className="text-center py-12">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-primary">
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-primary">Nenhuma cultura encontrada</h3>
              <p className="text-xs text-primary/70 max-w-sm">
                Tente ajustar os termos da sua pesquisa ou clique em "Todas" para recarregar o catálogo completo.
              </p>
              {isAdmin && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={handleOpenCreate}
                  className="mt-2"
                >
                  Cadastrar Primeira Cultura
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Grid de Cards de Culturas */}
        {!loading && culturas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {culturas.map((cultura) => (
              <CulturaCard
                key={cultura.id}
                cultura={cultura}
                isAdmin={isAdmin}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de Criação / Edição */}
      <CulturaFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        cultura={selectedCultura}
        onSubmit={handleFormSubmit}
      />

      {/* Modal de Confirmação de Exclusão */}
      <CulturaDeleteDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        cultura={selectedCultura}
        onConfirm={handleDeleteConfirm}
      />
    </DashboardLayout>
  );
}