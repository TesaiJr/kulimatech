// src/features/leituras/components/LeituraStatsCards.tsx
import React from 'react';
import { LeituraEstatisticasDTO } from '../types';
import { Activity, Clock, Droplets, AlertTriangle } from 'lucide-react';

interface LeituraStatsCardsProps {
  stats: LeituraEstatisticasDTO | null;
  loading?: boolean;
}

export function LeituraStatsCards({ stats, loading }: LeituraStatsCardsProps) {
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
      title: 'Total de Leituras',
      value: stats.totalLeituras,
      subtitle: 'Registadas no histórico',
      icon: Activity,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
    {
      title: 'Pendentes de Validação',
      value: stats.pendentesValidacao,
      subtitle: stats.pendentesValidacao > 0 ? 'Aguardam parecer do SDAE' : 'Tudo homologado',
      icon: Clock,
      color: stats.pendentesValidacao > 0 ? 'text-amber-600' : 'text-gray-500',
      bgColor: stats.pendentesValidacao > 0 ? 'bg-amber-50' : 'bg-gray-50',
      borderColor: stats.pendentesValidacao > 0 ? 'border-amber-200' : 'border-gray-100',
      badge: stats.pendentesValidacao > 0,
    },
    {
      title: 'Humidade Média (7d)',
      value: `${stats.mediaHumidade7Dias}%`,
      subtitle: `30 dias: ${stats.mediaHumidade30Dias}%`,
      icon: Droplets,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      title: 'Anomalias Críticas',
      value: stats.leiturasCriticas,
      subtitle: stats.leiturasCriticas > 0 ? 'Atenção hídrica urgente' : 'Nenhuma anomalia crítica',
      icon: AlertTriangle,
      color: stats.leiturasCriticas > 0 ? 'text-rose-600' : 'text-gray-400',
      bgColor: stats.leiturasCriticas > 0 ? 'bg-rose-50' : 'bg-gray-50',
      borderColor: stats.leiturasCriticas > 0 ? 'border-rose-200' : 'border-gray-100',
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
                    Ação Requerida
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
