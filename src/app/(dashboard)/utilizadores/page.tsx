// src/app/(dashboard)/utilizadores/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { USER_ROLES_INFO, UserRole } from '@/types/auth';
import {
  useUsers,
  useAtribuicoes,
  UserStatsCards,
  UserTable,
  CreateUserModal,
  EditUserModal,
  CarteiraTecnicaPanel,
  AtribuicaoModal,
  FarmerCardGrid,
  UserAdminDTO,
} from '@/features/users';
import {
  Users,
  UserCheck,
  FolderKanban,
  UserPlus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function UtilizadoresPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirecionamento por perfil e autenticação
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth?mode=login');
      } else if (user?.role === 'AGRICULTOR') {
        router.push('/dashboard');
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const isAdmin = user?.role === 'ADMIN';
  const isTecnico = user?.role === 'TECNICO';

  // Abas do Administrador
  const [activeTab, setActiveTab] = useState<'users' | 'tecnicos' | 'carteiras'>('users');

  // Estados de Modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserAdminDTO | null>(null);
  const [isAtribuirModalOpen, setIsAtribuirModalOpen] = useState<boolean>(false);
  const [modalDefaultTecnicoId, setModalDefaultTecnicoId] = useState<string | null>(null);

  // Mensagens de Sucesso / Feedback
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Hooks de Dados
  const {
    users,
    loading: usersLoading,
    actionLoading: userActionLoading,
    error: usersError,
    stats,
    searchQuery,
    selectedRole,
    selectedStatus,
    setSearchQuery,
    setSelectedRole,
    setSelectedStatus,
    loadUsers,
    createUser,
    updateUser,
    toggleStatus,
  } = useUsers(activeTab === 'tecnicos' ? 'TECNICO' : 'ALL');

  const {
    tecnicos,
    agricultoresPendentes,
    loading: atribuicoesLoading,
    actionLoading: atribuicoesActionLoading,
    error: atribuicoesError,
    loadAtribuicoes,
    atribuirCarteira,
    removerAtribuicao,
  } = useAtribuicoes();

  // Sincronizar filtro quando mudar de aba
  const handleTabChange = (tab: 'users' | 'tecnicos' | 'carteiras') => {
    setActiveTab(tab);
    if (tab === 'tecnicos') {
      setSelectedRole('TECNICO');
    } else if (tab === 'users') {
      setSelectedRole('ALL');
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Submissões com Feedback
  const handleCreateSubmit = async (data: any) => {
    const success = await createUser(data);
    if (success) {
      showSuccess(`Utilizador "${data.nome}" registado com sucesso!`);
      if (isAdmin) loadAtribuicoes();
    }
    return success;
  };

  const handleEditSubmit = async (id: string, data: any) => {
    const success = await updateUser(id, data);
    if (success) {
      showSuccess('Dados do utilizador atualizados com sucesso!');
      setEditingUser(null);
      if (isAdmin) loadAtribuicoes();
    }
    return success;
  };

  const handleToggleStatus = async (id: string, currentStatus: any) => {
    const success = await toggleStatus(id, currentStatus);
    if (success) {
      const actionName = currentStatus === 'ATIVO' ? 'bloqueada' : 'reativada';
      showSuccess(`Conta ${actionName} com sucesso.`);
    }
  };

  const handleAtribuirSubmit = async (tecnicoId: string, agricultorIds: string[]) => {
    const success = await atribuirCarteira(tecnicoId, agricultorIds);
    if (success) {
      showSuccess(`${agricultorIds.length} agricultor(es) vinculados à carteira com sucesso!`);
      loadUsers();
    }
    return success;
  };

  const handleRemoverSubmit = async (tecnicoId: string, agricultorId: string) => {
    const success = await removerAtribuicao(tecnicoId, agricultorId);
    if (success) {
      showSuccess('Vínculo desfeito com sucesso.');
      loadUsers();
    }
  };

  if (authLoading || (!isAuthenticated && !user)) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const role: UserRole = isTecnico ? 'TECNICO_SDAE' : 'ADMIN';
  const roleInfo = USER_ROLES_INFO[role];
  const layoutUser = user
    ? {
        name: user.nome,
        email: user.email,
        role: roleInfo.label,
      }
    : undefined;

  return (
    <DashboardLayout user={layoutUser}>
      <div className="space-y-6">
        {/* Notificação Toast */}
        {successToast && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between gap-3 shadow-md animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span className="text-sm font-semibold">{successToast}</span>
            </div>
            <button
              onClick={() => setSuccessToast(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Notificação de Erros */}
        {(usersError || atribuicoesError) && (
          <Alert variant="error">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{usersError || atribuicoesError}</span>
            </div>
          </Alert>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VISÃO 1: ADMINISTRADOR (Gestão Total de Usuários)       */}
        {/* ------------------------------------------------------------- */}
        {isAdmin && (
          <>
            <PageHeader
              title="Utilizadores & Atribuições"
              description="Gestão central de contas, extensionistas de campo e alocação de carteiras agrícolas do SDAE."
              actions={
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="gap-2 shadow-sm bg-primary hover:bg-primary/90"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Novo Utilizador</span>
                </Button>
              }
            />

            {/* Cartões Estatísticos de Topo */}
            <UserStatsCards stats={stats} />

            {/* Navegação por Abas */}
            <div className="flex items-center gap-2 border-b border-border pb-px">
              <button
                onClick={() => handleTabChange('users')}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'users'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Users className="h-4 w-4" />
                Todos os Utilizadores ({stats.totalUsers})
              </button>

              <button
                onClick={() => handleTabChange('tecnicos')}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'tecnicos'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <UserCheck className="h-4 w-4" />
                Técnicos SDAE ({stats.totalTecnicos})
              </button>

              <button
                onClick={() => handleTabChange('carteiras')}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors relative ${
                  activeTab === 'carteiras'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <FolderKanban className="h-4 w-4" />
                Atribuição de Carteiras
                {agricultoresPendentes.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
                    {agricultoresPendentes.length}
                  </span>
                )}
              </button>
            </div>

            {/* Conteúdo da Aba Ativa */}
            {activeTab === 'carteiras' ? (
              <CarteiraTecnicaPanel
                tecnicos={tecnicos}
                agricultoresPendentes={agricultoresPendentes}
                loading={atribuicoesLoading}
                actionLoading={atribuicoesActionLoading}
                onRefresh={loadAtribuicoes}
                onOpenAtribuirModal={(tecnicoId) => {
                  setModalDefaultTecnicoId(tecnicoId || null);
                  setIsAtribuirModalOpen(true);
                }}
                onRemoverAtribuicao={handleRemoverSubmit}
              />
            ) : (
              <UserTable
                users={users}
                loading={usersLoading}
                actionLoading={userActionLoading}
                searchQuery={searchQuery}
                selectedRole={selectedRole}
                selectedStatus={selectedStatus}
                onSearchChange={setSearchQuery}
                onRoleChange={setSelectedRole}
                onStatusChange={setSelectedStatus}
                onRefresh={loadUsers}
                onEditUser={(u) => setEditingUser(u)}
                onToggleStatus={handleToggleStatus}
              />
            )}
          </>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VISÃO 2: TÉCNICO SDAE (Agricultores sob sua supervisão)        */}
        {/* ------------------------------------------------------------- */}
        {isTecnico && (
          <>
            <PageHeader
              title="Agricultores Acompanhados"
              description="Produtores rurais vinculados à sua carteira técnica de extensão agrária no distrito de Nhamatanda."
            />

            <FarmerCardGrid farmers={users} loading={usersLoading} />
          </>
        )}
      </div>

      {/* Modais Administrativos */}
      {isAdmin && (
        <>
          <CreateUserModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={handleCreateSubmit}
            loading={userActionLoading}
          />

          <EditUserModal
            isOpen={!!editingUser}
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onSubmit={handleEditSubmit}
            loading={userActionLoading}
          />

          <AtribuicaoModal
            isOpen={isAtribuirModalOpen}
            tecnicos={tecnicos}
            agricultoresPendentes={agricultoresPendentes}
            defaultTecnicoId={modalDefaultTecnicoId}
            onClose={() => setIsAtribuirModalOpen(false)}
            onSubmit={handleAtribuirSubmit}
            loading={atribuicoesActionLoading}
          />
        </>
      )}
    </DashboardLayout>
  );
}