// src/features/pragas/components/OcorrenciaStatsCards.tsx
import React from 'react';
import { OcorrenciaEstatisticasDTO } from '../types';
import { Activity, AlertCircle, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';

interface OcorrenciaStatsCardsProps {
  stats: OcorrenciaEstatisticasDTO | null;
  loading?: boolean;
}

export function OcorrenciaStatsCards({ stats, loading }: OcorrenciaStatsCardsProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-white border border-gray-100 p-4 shadow-sm animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total de Ocorrências',
      value: stats.total,
      subtitle: 'Registadas no histórico',
      icon: Activity,
      color: 'text-gray-700',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-200',
    },
    {
      title: 'Ocorrências Abertas',
      value: stats.abertas,
      subtitle: stats.abertas > 0 ? 'Aguardando diagnóstico' : 'Nenhuma ocorrência aberta',
      icon: AlertCircle,
      color: stats.abertas > 0 ? 'text-amber-600' : 'text-gray-400',
      bgColor: stats.abertas > 0 ? 'bg-amber-50' : 'bg-gray-50',
      borderColor: stats.abertas > 0 ? 'border-amber-200' : 'border-gray-100',
      badge: stats.abertas > 0 ? 'Pendente' : undefined,
    },
    {
      title: 'Em Análise Técnica',
      value: stats.emAnalise,
      subtitle: 'SDAE a avaliar no campo',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      title: 'Resolvidas com Parecer',
      value: stats.resolvidas,
      subtitle: 'Homologadas e tratadas',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`relative rounded-2xl bg-white border ${card.borderColor} p-5 shadow-sm transition-all duration-200 hover:shadow-md flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.bgColor} ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  {card.value}
                </span>
                {card.badge && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    {card.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1 font-medium">{card.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
