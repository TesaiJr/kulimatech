// src/features/pragas/components/PragaCard.tsx
import React from 'react';
import { PragaDTO } from '../types';
import { Bug, Sprout, AlertTriangle, Eye, ShieldAlert, Sparkles } from 'lucide-react';

interface PragaCardProps {
  praga: PragaDTO;
  onOpenDetails: (praga: PragaDTO) => void;
  isAdmin?: boolean;
  onEdit?: (praga: PragaDTO) => void;
  onDelete?: (id: string) => void;
}

export function PragaCard({
  praga,
  onOpenDetails,
  isAdmin = false,
  onEdit,
  onDelete,
}: PragaCardProps) {
  const getSeveridadeBadge = (severidade: string) => {
    switch (severidade) {
      case 'CRITICA':
        return {
          label: 'Severidade Crítica',
          classes: 'bg-rose-100 text-rose-800 border-rose-200',
        };
      case 'ALTA':
        return {
          label: 'Severidade Alta',
          classes: 'bg-orange-100 text-orange-800 border-orange-200',
        };
      case 'MEDIA':
        return {
          label: 'Severidade Média',
          classes: 'bg-amber-100 text-amber-800 border-amber-200',
        };
      case 'BAIXA':
      default:
        return {
          label: 'Severidade Baixa',
          classes: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
    }
  };

  const badge = getSeveridadeBadge(praga.severidadePadrao);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Cabeçalho do Cartão */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base leading-snug">
                {praga.nome}
              </h3>
              {praga.nomeCientifico && (
                <p className="text-xs text-gray-500 italic font-medium">
                  {praga.nomeCientifico}
                </p>
              )}
            </div>
          </div>

          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${badge.classes}`}
          >
            {badge.label}
          </span>
        </div>

        {/* Cultura Associada */}
        {praga.cultura && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50/70 text-emerald-800 text-xs font-semibold mb-3">
            <Sprout className="w-3.5 h-3.5 text-emerald-600" />
            <span>Afeta: {praga.cultura.nome}</span>
          </div>
        )}

        {/* Descrição resumida */}
        <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed">
          {praga.descricao}
        </p>

        {/* Sintomas em destaque */}
        <div className="bg-gray-50/80 rounded-xl p-3 mb-4 border border-gray-100">
          <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            Sintomas Principais
          </div>
          <p className="text-xs text-gray-700 line-clamp-2">
            {praga.sintomas}
          </p>
        </div>
      </div>

      {/* Ações do Rodapé */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onOpenDetails(praga)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
        >
          <Eye className="w-3.5 h-3.5" />
          Ficha e Combate
        </button>

        {isAdmin && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(praga)}
                className="px-2 py-1 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Editar
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(praga.id)}
                className="px-2 py-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
              >
                Excluir
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
