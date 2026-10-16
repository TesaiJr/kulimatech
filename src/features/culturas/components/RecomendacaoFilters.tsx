// src/features/culturas/components/RecomendacaoFilters.tsx
'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { StatusRecomendacao, RecomendacaoStats } from '../types';
import { Search, Filter, CheckCircle2, Clock, Archive } from 'lucide-react';

interface RecomendacaoFiltersProps {
  status: StatusRecomendacao | 'TODOS';
  onStatusChange: (status: StatusRecomendacao | 'TODOS') => void;
  search: string;
  onSearchChange: (search: string) => void;
  stats?: RecomendacaoStats | null;
}

export function RecomendacaoFilters({
  status,
  onStatusChange,
  search,
  onSearchChange,
  stats,
}: RecomendacaoFiltersProps) {
  const tabs: { id: StatusRecomendacao | 'TODOS'; label: string; count?: number; icon: React.ReactNode }[] = [
    {
      id: 'TODOS',
      label: 'Todas',
      count: stats?.total,
      icon: <Filter className="w-3.5 h-3.5" />,
    },
    {
      id: 'PENDENTE',
      label: 'Pendentes',
      count: stats?.pendentes,
      icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
    },
    {
      id: 'APLICADA',
      label: 'Aplicadas no Solo',
      count: stats?.aplicadas,
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
    },
    {
      id: 'ARQUIVADA',
      label: 'Arquivadas',
      count: stats?.arquivadas,
      icon: <Archive className="w-3.5 h-3.5 text-gray-500" />,
    },
  ];

  return (
    <Card variant="surface" className="p-4 space-y-3">
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Abas de Status */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {tabs.map((tab) => {
            const isActive = status === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onStatusChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-secondary text-primary shadow-sm'
                    : 'bg-surface hover:bg-secondary/10 text-primary/70 border border-secondary/20'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-primary text-secondary' : 'bg-secondary/20 text-primary'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Campo de Pesquisa */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Pesquisar parecer, parcela..."
            className="w-full pl-10 pr-4 py-1.5 rounded-xl bg-surface border border-secondary/30 text-primary placeholder:text-primary/40 text-xs focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm"
          />
        </div>
      </div>
    </Card>
  );
}
