// src/features/leituras/components/HumidadeGaugeBar.tsx
import React from 'react';

interface HumidadeGaugeBarProps {
  humidade: number;
  compact?: boolean;
}

export function HumidadeGaugeBar({ humidade, compact = false }: HumidadeGaugeBarProps) {
  const clamped = Math.max(0, Math.min(100, humidade));

  let statusText = 'Óptima';
  let statusBadgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';

  if (clamped < 25) {
    statusText = 'Crítica';
    statusBadgeColor = 'bg-rose-100 text-rose-800 border-rose-200';
  } else if (clamped < 35) {
    statusText = 'Baixa';
    statusBadgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
  } else if (clamped <= 55) {
    statusText = 'Óptima';
    statusBadgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
  } else {
    statusText = 'Excessiva';
    statusBadgeColor = 'bg-blue-100 text-blue-800 border-blue-200';
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 h-2 rounded-full bg-gray-200 overflow-hidden flex">
          <div className="h-full bg-rose-500" style={{ width: '25%' }} />
          <div className="h-full bg-amber-400" style={{ width: '10%' }} />
          <div className="h-full bg-emerald-500" style={{ width: '20%' }} />
          <div className="h-full bg-blue-500" style={{ width: '45%' }} />
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-bold border ${statusBadgeColor}`}
        >
          {humidade}% ({statusText})
        </span>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl p-4 border border-gray-100 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase">
          Escala Agronómica de Humidade
        </span>
        <span
          className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${statusBadgeColor}`}
        >
          {humidade}% — {statusText}
        </span>
      </div>

      {/* Barra de Faixas com Marcador */}
      <div className="relative pt-3 pb-2">
        <div className="h-3 w-full rounded-full overflow-hidden flex shadow-inner">
          <div
            className="h-full bg-rose-500 hover:opacity-90 transition-opacity"
            style={{ width: '25%' }}
            title="Crítica: 0 a 24%"
          />
          <div
            className="h-full bg-amber-400 hover:opacity-90 transition-opacity"
            style={{ width: '10%' }}
            title="Baixa: 25 a 34%"
          />
          <div
            className="h-full bg-emerald-500 hover:opacity-90 transition-opacity"
            style={{ width: '20%' }}
            title="Óptima: 35 a 55%"
          />
          <div
            className="h-full bg-blue-500 hover:opacity-90 transition-opacity"
            style={{ width: '45%' }}
            title="Excessiva: 56 a 100%"
          />
        </div>

        {/* Marcador dinâmico com ponteiro */}
        <div
          className="absolute top-1 transform -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-300"
          style={{ left: `${clamped}%` }}
        >
          <div className="w-3 h-3 bg-gray-900 border-2 border-white rounded-full shadow-md"></div>
          <div className="w-0.5 h-3 bg-gray-900"></div>
        </div>
      </div>

      {/* Legenda de Faixas */}
      <div className="flex justify-between text-[11px] text-gray-500 pt-1 font-medium">
        <span className="text-rose-600 font-semibold">&lt;25% Crítica</span>
        <span className="text-amber-600 font-semibold">25-34% Baixa</span>
        <span className="text-emerald-600 font-semibold">35-55% Óptima</span>
        <span className="text-blue-600 font-semibold">&gt;55% Excessiva</span>
      </div>
    </div>
  );
}
