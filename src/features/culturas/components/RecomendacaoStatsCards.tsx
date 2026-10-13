// src/features/culturas/components/RecomendacaoStatsCards.tsx
'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { RecomendacaoStats } from '../types';
import { ClipboardList, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

interface RecomendacaoStatsCardsProps {
  stats: RecomendacaoStats | null;
  loading?: boolean;
}

export function RecomendacaoStatsCards({ stats, loading }: RecomendacaoStatsCardsProps) {
  const total = stats?.total ?? 0;
  const pendentes = stats?.pendentes ?? 0;
  const aplicadas = stats?.aplicadas ?? 0;
  const taxaAdocao = total > 0 ? Math.round((aplicadas / total) * 100) : 0;

  const items = [
    {
      title: 'Total de Recomendações',
      value: total,
      label: 'Registadas no sistema',
      icon: <ClipboardList className="w-5 h-5 text-secondary" />,
      bgIcon: 'bg-secondary/15',
    },
    {
      title: 'Aguardam Aplicação',
      value: pendentes,
      label: 'Pendentes no campo',
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      bgIcon: 'bg-amber-100',
    },
    {
      title: 'Aplicadas no Solo',
      value: aplicadas,
      label: 'Confirmadas pelo produtor',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      bgIcon: 'bg-emerald-100',
    },
    {
      title: 'Taxa de Adoção',
      value: `${taxaAdocao}%`,
      label: 'Eficácia da extensão agrária',
      icon: <TrendingUp className="w-5 h-5 text-cyan-600" />,
      bgIcon: 'bg-cyan-100',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-surface rounded-2xl border border-secondary/20" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, idx) => (
        <Card key={idx} variant="surface" className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-primary/70 block">
              {item.title}
            </span>
            <span className="text-xl sm:text-2xl font-black text-primary block tracking-tight">
              {item.value}
            </span>
            <span className="text-[10px] text-primary/60 block">
              {item.label}
            </span>
          </div>
          <div className={`w-10 h-10 rounded-xl ${item.bgIcon} flex items-center justify-center shrink-0`}>
            {item.icon}
          </div>
        </Card>
      ))}
    </div>
  );
}
