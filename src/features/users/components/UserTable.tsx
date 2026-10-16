// src/features/users/components/UserTable.tsx
'use client';

import React from 'react';
import { UserAdminDTO } from '../types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Search,
  UserCheck,
  Shield,
  ShieldAlert,
  Edit2,
  Lock,
  Unlock,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { UserRole, UserStatus } from '@/features/auth/types';

interface UserTableProps {
  users: UserAdminDTO[];
  loading: boolean;
  actionLoading: boolean;
  searchQuery: string;
  selectedRole: string;
  selectedStatus: string;
  onSearchChange: (val: string) => void;
  onRoleChange: (val: string) => void;
  onStatusChange: (val: string) => void;
  onRefresh: () => void;
  onEditUser: (user: UserAdminDTO) => void;
  onToggleStatus: (id: string, currentStatus: UserStatus) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  actionLoading,
  searchQuery,
  selectedRole,
  selectedStatus,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onRefresh,
  onEditUser,
  onToggleStatus,
}) => {
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200">
            <Shield className="w-3 h-3 mr-1 inline" /> Administrador
          </Badge>
        );
      case 'TECNICO':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200">
            <UserCheck className="w-3 h-3 mr-1 inline" /> Técnico SDAE
          </Badge>
        );
      case 'AGRICULTOR':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200">
            Agricultor Familiar
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'ATIVO':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 inline-block" />
            Ativo
          </Badge>
        );
      case 'INATIVO':
        return (
          <Badge variant="outline" className="text-muted-foreground border-border">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mr-1.5 inline-block" />
            Inativo
          </Badge>
        );
      case 'BLOQUEADO':
        return (
          <Badge className="bg-rose-50 text-rose-700 border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 inline-block" />
            Bloqueado
          </Badge>
        );
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Controles de Filtros e Busca */}
      <div className="p-4 border-b border-border bg-muted/20 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Pesquisar por nome, e-mail, telefone ou zona..."
            className="pl-9 h-10 w-full bg-background"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro Perfil */}
          <select
            value={selectedRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="h-10 px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">Todos os Perfis</option>
            <option value="ADMIN">Administradores</option>
            <option value="TECNICO">Técnicos SDAE</option>
            <option value="AGRICULTOR">Agricultores</option>
          </select>

          {/* Filtro Status */}
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="h-10 px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">Todos os Estados</option>
            <option value="ATIVO">Ativos</option>
            <option value="INATIVO">Inativos</option>
            <option value="BLOQUEADO">Bloqueados</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="h-10 px-3"
            title="Recarregar utilizadores"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Tabela de Utilizadores */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
              <th className="py-3.5 px-4">Utilizador</th>
              <th className="py-3.5 px-4">Perfil</th>
              <th className="py-3.5 px-4">Estado</th>
              <th className="py-3.5 px-4">Contacto & Localização</th>
              <th className="py-3.5 px-4">Supervisão Técnica</th>
              <th className="py-3.5 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading && users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                    <span>A carregar utilizadores...</span>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ShieldAlert className="h-8 w-8 text-muted-foreground/60" />
                    <p className="font-medium text-foreground">Nenhum utilizador encontrado</p>
                    <p className="text-xs">Tente ajustar os filtros ou os termos de pesquisa.</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const tecnicoResponsavel = u.tecnicosResponsaveis?.[0]?.tecnico;
                const totalSupervisionados = u.agricultoresAcompanhados?.length || 0;

                return (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    {/* Utilizador */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                          {getInitials(u.nome)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{u.nome}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                            <Mail className="h-3 w-3 shrink-0" />
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Perfil */}
                    <td className="py-3.5 px-4 whitespace-nowrap">{getRoleBadge(u.role)}</td>

                    {/* Estado */}
                    <td className="py-3.5 px-4 whitespace-nowrap">{getStatusBadge(u.status)}</td>

                    {/* Contacto & Localização */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs space-y-1">
                        {u.telefone ? (
                          <div className="flex items-center gap-1.5 text-foreground">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{u.telefone}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">Sem telefone</span>
                        )}
                        {u.zonaAtuacao && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span>{u.zonaAtuacao}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Supervisão Técnica */}
                    <td className="py-3.5 px-4">
                      {u.role === 'AGRICULTOR' ? (
                        tecnicoResponsavel ? (
                          <div className="text-xs">
                            <span className="font-medium text-blue-700 block">
                              {tecnicoResponsavel.nome}
                            </span>
                            <span className="text-muted-foreground">Técnico SDAE</span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 text-[11px]">
                            Sem técnico
                          </Badge>
                        )
                      ) : u.role === 'TECNICO' ? (
                        <div className="text-xs">
                          <span className="font-medium text-foreground">
                            {totalSupervisionados} produtor(es)
                          </span>
                          <span className="text-muted-foreground block">na carteira</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Administração Central</span>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditUser(u)}
                          className="h-8 px-2 text-muted-foreground hover:text-foreground"
                          title="Editar dados"
                        >
                          <Edit2 className="h-3.5 w-3.5 mr-1" />
                          <span className="text-xs">Editar</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={actionLoading}
                          onClick={() => onToggleStatus(u.id, u.status)}
                          className={`h-8 px-2 text-xs ${
                            u.status === 'ATIVO'
                              ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50'
                              : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                          }`}
                          title={u.status === 'ATIVO' ? 'Bloquear conta' : 'Reativar conta'}
                        >
                          {u.status === 'ATIVO' ? (
                            <>
                              <Lock className="h-3.5 w-3.5 mr-1" /> Bloquear
                            </>
                          ) : (
                            <>
                              <Unlock className="h-3.5 w-3.5 mr-1" /> Reativar
                            </>
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
