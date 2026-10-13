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
  Info,
  ArrowRight,
  Sparkles,
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

  // Mensagens Estruturadas de Sucesso, Falha e Próximos Passos
  interface OperationFeedback {
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
    nextSteps?: string[];
    actionLabel?: string;
    onAction?: () => void;
  }

  const [feedback, setFeedback] = useState<OperationFeedback | null>(null);

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

  // Submissões com Feedback Enriquecido & Próximos Passos
  const handleCreateSubmit = async (data: any) => {
    const success = await createUser(data);
    if (success) {
      const isTecnico = data.role === 'TECNICO';
      const isAgri = data.role === 'AGRICULTOR';

      setFeedback({
        type: 'success',
        title: `Utilizador "${data.nome}" Registado com Sucesso!`,
        message: `A nova conta (${isTecnico ? 'Técnico SDAE' : isAgri ? 'Agricultor' : 'Administrador'}) está ativa e pronta para acesso.`,
        nextSteps: isTecnico ? [
          'O extensionista já pode iniciar sessão com o e-mail cadastrado.',
          'Próximo passo: atribua os agricultores sob sua supervisão na aba "Carteiras Técnicas".',
          'O técnico poderá emitir pareceres de pragas e recomendações aos produtores.',
        ] : isAgri ? [
          'O agricultor pode iniciar sessão para registar parcelas e acompanhar leituras de humidade.',
          'Próximo passo: vincule-o a um extensionista do SDAE na aba "Carteiras Técnicas".',
        ] : [
          'O administrador tem acesso completo à parametrização do KulimaTech e gestão de utilizadores.',
        ],
        actionLabel: isTecnico ? 'Alocar Carteira Técnica' : undefined,
        onAction: isTecnico ? () => handleTabChange('carteiras') : undefined,
      });
      if (isAdmin) loadAtribuicoes();
    } else {
      setFeedback({
        type: 'error',
        title: 'Não foi possível registar o utilizador',
        message: usersError || 'Ocorreu uma falha durante o registo.',
        nextSteps: [
          'Verifique se o endereço de e-mail já se encontra cadastrado.',
          'Confirme a estabilidade da ligação à rede e tente submeter novamente.',
        ],
      });
    }
    return success;
  };

  const handleEditSubmit = async (id: string, data: any) => {
    const success = await updateUser(id, data);
    if (success) {
      setFeedback({
        type: 'success',
        title: 'Dados do Utilizador Atualizados',
        message: 'As alterações cadastrais foram gravadas com sucesso no sistema.',
        nextSteps: [
          'As informações atualizadas já estão disponíveis em todos os módulos operacionais.',
        ],
      });
      setEditingUser(null);
      if (isAdmin) loadAtribuicoes();
    } else {
      setFeedback({
        type: 'error',
        title: 'Falha ao Atualizar Dados',
        message: usersError || 'Não foi possível salvar as alterações.',
        nextSteps: [
          'Verifique os dados informados no formulário e tente novamente.',
        ],
      });
    }
    return success;
  };

  const handleToggleStatus = async (id: string, currentStatus: any) => {
    const success = await toggleStatus(id, currentStatus);
    if (success) {
      const isBlocked = currentStatus === 'ATIVO';
      setFeedback({
        type: isBlocked ? 'warning' : 'success',
        title: isBlocked ? 'Acesso do Utilizador Suspenso' : 'Acesso do Utilizador Restabelecido',
        message: isBlocked
          ? 'A conta foi bloqueada. Novas tentativas de login serão recusadas.'
          : 'A conta foi reativada com sucesso. O utilizador pode autenticar-se normalmente.',
        nextSteps: isBlocked ? [
          'Sessões ativas no telemóvel ou computador serão interrompidas.',
          'Pode reverter esta restrição a qualquer momento nesta tabela.',
        ] : [
          'O utilizador recuperou o acesso imediato a todas as funcionalidades do seu perfil.',
        ],
      });
    }
  };

  const handleAtribuirSubmit = async (tecnicoId: string, agricultorIds: string[]) => {
    const success = await atribuirCarteira(tecnicoId, agricultorIds);
    if (success) {
      setFeedback({
        type: 'success',
        title: 'Atribuição de Carteira Concluída!',
        message: `${agricultorIds.length} agricultor(es) foram vinculados com sucesso ao técnico extensionista.`,
        nextSteps: [
          'Notificações de sistema foram enviadas aos agricultores e ao técnico.',
          'O extensionista já tem acesso às parcelas e histórico de solo destes produtores.',
          'Pode emitir recomendações agronómicas vinculadas ou iniciar conversações no Chat.',
        ],
        actionLabel: 'Ver Carteiras Técnicas',
        onAction: () => handleTabChange('carteiras'),
      });
      loadUsers();
    } else {
      setFeedback({
        type: 'error',
        title: 'Falha na Vinculação de Agricultores',
        message: atribuicoesError || 'Não foi possível concluir a atribuição no momento.',
        nextSteps: [
          'As suas seleções foram mantidas no modal caso pretenda tentar novamente.',
          'Aguarde alguns instantes e tente submeter novamente.',
        ],
      });
    }
    return success;
  };

  const handleRemoverSubmit = async (tecnicoId: string, agricultorId: string) => {
    const success = await removerAtribuicao(tecnicoId, agricultorId);
    if (success) {
      setFeedback({
        type: 'info',
        title: 'Vínculo Desfeito com Sucesso',
        message: 'O agricultor foi desvinculado da supervisão deste extensionista.',
        nextSteps: [
          'O agricultor retornou à lista de "Agricultores Pendentes de Atribuição".',
          'Pode atribuí-lo a outro técnico do SDAE a qualquer momento na aba Carteiras Técnicas.',
        ],
        actionLabel: 'Atribuir Novo Técnico',
        onAction: () => {
          handleTabChange('carteiras');
          setIsAtribuirModalOpen(true);
        },
      });
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
        {/* Painel Estruturado de Feedback Operacional (Sucesso / Falha / Próximos Passos) */}
        {feedback && (
          <div
            className={`p-5 rounded-2xl border shadow-xs space-y-3 animate-in slide-in-from-top-2 transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                : feedback.type === 'warning'
                ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                : feedback.type === 'info'
                ? 'bg-blue-50/90 border-blue-200 text-blue-950'
                : 'bg-rose-50/90 border-rose-200 text-rose-950'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    feedback.type === 'success'
                      ? 'bg-emerald-100 text-emerald-700'
                      : feedback.type === 'warning'
                      ? 'bg-amber-100 text-amber-700'
                      : feedback.type === 'info'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {feedback.type === 'success' && <CheckCircle2 className="h-5 w-5" />}
                  {feedback.type === 'warning' && <AlertCircle className="h-5 w-5" />}
                  {feedback.type === 'info' && <Info className="h-5 w-5" />}
                  {feedback.type === 'error' && <AlertCircle className="h-5 w-5" />}
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold tracking-tight">{feedback.title}</h4>
                  <p className="text-xs opacity-90 leading-relaxed">{feedback.message}</p>
                </div>
              </div>

              <button
                onClick={() => setFeedback(null)}
                className="text-xs font-bold opacity-60 hover:opacity-100 p-1 rounded-md transition-opacity"
                title="Fechar aviso"
              >
                ✕
              </button>
            </div>

            {/* Instruções Seguintes / Próximos Passos */}
            {feedback.nextSteps && feedback.nextSteps.length > 0 && (
              <div className="pl-11 pt-2 border-t border-black/5 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider opacity-80 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Instruções Seguintes & Próximos Passos:</span>
                </p>
                <ul className="space-y-1.5 text-xs opacity-90">
                  {feedback.nextSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-bold shrink-0 text-[11px] mt-0.5">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Ação rápida / Atalho */}
            {feedback.actionLabel && feedback.onAction && (
              <div className="pl-11 pt-1 flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    feedback.onAction?.();
                    setFeedback(null);
                  }}
                  className="h-8 text-xs font-semibold gap-1.5"
                >
                  <span>{feedback.actionLabel}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
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
            error={atribuicoesError}
          />
        </>
      )}
    </DashboardLayout>
  );
}