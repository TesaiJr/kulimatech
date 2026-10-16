// src/features/users/components/UserStatsCards.tsx
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { UserStatsDTO } from '../types';
import { Users, UserCheck, Shield, UserX, AlertTriangle } from 'lucide-react';

interface UserStatsCardsProps {
  stats: UserStatsDTO;
}

export const UserStatsCards: React.FC<UserStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Total Utilizadores */}
      <Card className="border-border hover:border-primary/40 transition-colors shadow-sm">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Utilizadores
            </p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{stats.totalUsers}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-emerald-600 font-medium">{stats.totalAtivos} ativos</span>
              {stats.totalBloqueados > 0 && (
                <span className="text-rose-600 font-medium ml-1.5">({stats.totalBloqueados} bloqueados)</span>
              )}
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Users className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Técnicos SDAE */}
      <Card className="border-border hover:border-blue-500/40 transition-colors shadow-sm">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Técnicos SDAE
            </p>
            <h3 className="text-2xl font-bold text-blue-700 mt-1">{stats.totalTecnicos}</h3>
            <p className="text-xs text-muted-foreground mt-1">Extensionistas de campo</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <UserCheck className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Agricultores Familiares */}
      <Card className="border-border hover:border-emerald-500/40 transition-colors shadow-sm">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Agricultores
            </p>
            <h3 className="text-2xl font-bold text-emerald-700 mt-1">{stats.totalAgricultores}</h3>
            <p className="text-xs text-muted-foreground mt-1">Produtores no distrito</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Shield className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Pendentes de Atribuição */}
      <Card
        className={`border-border transition-colors shadow-sm ${
          stats.totalPendentesAtribuicao > 0 ? 'bg-amber-50/30 border-amber-200' : ''
        }`}
      >
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sem Técnico Atribuído
            </p>
            <h3
              className={`text-2xl font-bold mt-1 ${
                stats.totalPendentesAtribuicao > 0 ? 'text-amber-700' : 'text-foreground'
              }`}
            >
              {stats.totalPendentesAtribuicao}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalPendentesAtribuicao > 0
                ? 'Requerem alocação do SDAE'
                : 'Todas as carteiras atendidas'}
            </p>
          </div>
          <div
            className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
              stats.totalPendentesAtribuicao > 0
                ? 'bg-amber-100 text-amber-700'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {stats.totalPendentesAtribuicao > 0 ? (
              <AlertTriangle className="h-6 w-6" />
            ) : (
              <UserCheck className="h-6 w-6" />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
