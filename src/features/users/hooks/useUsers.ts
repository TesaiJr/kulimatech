// src/features/users/hooks/useUsers.ts
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { UserAdminDTO, CreateUserInput, UpdateUserInput, UserStatsDTO } from '../types';
import { userService } from '../services/userService';
import { UserStatus } from '@/features/auth/types';

export function useUsers(initialRole: string = 'ALL') {
  const [users, setUsers] = useState<UserAdminDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>(initialRole);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getUsers({
        role: selectedRole,
        status: selectedStatus,
        search: searchQuery,
      });
      setUsers(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao listar utilizadores.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [selectedRole, selectedStatus, searchQuery]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Estatísticas calculadas
  const stats: UserStatsDTO = useMemo(() => {
    const totalUsers = users.length;
    let totalAdmins = 0;
    let totalTecnicos = 0;
    let totalAgricultores = 0;
    let totalAtivos = 0;
    let totalInativos = 0;
    let totalBloqueados = 0;
    let totalPendentesAtribuicao = 0;

    users.forEach((u) => {
      if (u.role === 'ADMIN') totalAdmins++;
      if (u.role === 'TECNICO') totalTecnicos++;
      if (u.role === 'AGRICULTOR') {
        totalAgricultores++;
        if (!u.tecnicosResponsaveis || u.tecnicosResponsaveis.length === 0) {
          totalPendentesAtribuicao++;
        }
      }

      if (u.status === 'ATIVO') totalAtivos++;
      else if (u.status === 'INATIVO') totalInativos++;
      else if (u.status === 'BLOQUEADO') totalBloqueados++;
    });

    return {
      totalUsers,
      totalAdmins,
      totalTecnicos,
      totalAgricultores,
      totalAtivos,
      totalInativos,
      totalBloqueados,
      totalPendentesAtribuicao,
    };
  }, [users]);

  const handleCreateUser = async (data: CreateUserInput): Promise<boolean> => {
    setActionLoading(true);
    setError(null);
    try {
      await userService.createUser(data);
      await loadUsers();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao cadastrar utilizador.';
      setError(msg);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUser = async (id: string, data: UpdateUserInput): Promise<boolean> => {
    setActionLoading(true);
    setError(null);
    try {
      await userService.updateUser(id, data);
      await loadUsers();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao atualizar utilizador.';
      setError(msg);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: UserStatus): Promise<boolean> => {
    const newStatus: UserStatus = currentStatus === 'ATIVO' ? 'BLOQUEADO' : 'ATIVO';
    return handleUpdateUser(id, { status: newStatus });
  };

  return {
    users,
    loading,
    actionLoading,
    error,
    stats,
    searchQuery,
    selectedRole,
    selectedStatus,
    setSearchQuery,
    setSelectedRole,
    setSelectedStatus,
    loadUsers,
    createUser: handleCreateUser,
    updateUser: handleUpdateUser,
    toggleStatus: handleToggleStatus,
    clearError: () => setError(null),
  };
}
