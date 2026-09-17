import React from 'react';
import Link from 'next/link';
import { ParcelaListItem } from '../types';
import { MapPin, Layers, User, Droplets, FileText, AlertTriangle, Edit, Trash2, Eye } from 'lucide-react';
import { Badge, Button } from '@/components/ui';

export interface ParcelaCardProps {
  parcela: ParcelaListItem;
  userRole?: string;
  onDelete?: (parcela: ParcelaListItem) => void;
}

const SOLO_BADGES: Record<string, { label: string; colorClass: string }> = {
  ARENOSO: { label: 'Arenoso', colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  ARGILOSO: { label: 'Argiloso', colorClass: 'bg-amber-100 text-amber-900 border-amber-300' },
  FRANCO: { label: 'Franco-Argiloso', colorClass: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  MISTO: { label: 'Misto', colorClass: 'bg-teal-100 text-teal-900 border-teal-300' },
  OUTRO: { label: 'Outro', colorClass: 'bg-gray-100 text-gray-800 border-gray-300' },
};

export function ParcelaCard({ parcela, userRole = 'AGRICULTOR', onDelete }: ParcelaCardProps) {
  const soloInfo = SOLO_BADGES[parcela.tipoSolo] || SOLO_BADGES.OUTRO;
  const isAgricultor = userRole === 'AGRICULTOR';

  return (
    <div className="bg-[#e6efe8] p-6 rounded-lg border border-[#8eb69b]/45 shadow-sm hover:shadow-md hover:border-[#0e4749]/40 transition-all flex flex-col justify-between h-full group">
      <div className="space-y-4">
        {/* Cabeçalho do Card */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-sm border ${soloInfo.colorClass}`}>
              {soloInfo.label}
            </span>
            <h3 className="text-lg font-bold text-[#002626] mt-2 group-hover:text-[#0e4749] transition-colors leading-snug">
              {parcela.nome}
            </h3>
          </div>

          <div className="w-10 h-10 rounded-md bg-[#002626] text-[#95c623] flex items-center justify-center flex-shrink-0 shadow-xs">
            <Layers className="w-5 h-5 stroke-[2]" />
          </div>
        </div>

        {/* Detalhes de Área e Localização */}
        <div className="space-y-2 text-xs text-secondary/85 pt-1 border-t border-[#8eb69b]/25">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#002626]">Área Total:</span>
            <span className="font-mono font-bold text-[#0e4749] bg-white/60 px-2 py-0.5 rounded text-xs">
              {parcela.areaHectares} ha ({parcela.areaHectares * 10000} m²)
            </span>
          </div>

          {parcela.localizacao && (
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0e4749] flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">{parcela.localizacao}</span>
            </div>
          )}

          {parcela.latitude && parcela.longitude && (
            <div className="text-[11px] font-mono text-secondary/70 pl-5">
              GPS: {parcela.latitude}, {parcela.longitude}
            </div>
          )}

          {/* Nome do Agricultor para o Perfil Técnico */}
          {!isAgricultor && parcela.agricultor && (
            <div className="flex items-center gap-1.5 pt-1 text-[#002626] font-medium">
              <User className="w-3.5 h-3.5 text-[#0e4749]" />
              <span>Produtor: <strong>{parcela.agricultor.nome}</strong> ({parcela.agricultor.zonaAtuacao || 'Nhamatanda'})</span>
            </div>
          )}
        </div>

        {/* Contadores de Atividade (Leituras & Recomendações) */}
        <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[11px] border-t border-[#8eb69b]/25">
          <div className="bg-white/50 p-2 rounded-md">
            <div className="flex items-center justify-center gap-1 text-[#0e4749] font-bold">
              <Droplets className="w-3 h-3" />
              <span>{parcela._count?.leituras || 0}</span>
            </div>
            <span className="text-secondary/70 text-[10px]">Leituras</span>
          </div>

          <div className="bg-white/50 p-2 rounded-md">
            <div className="flex items-center justify-center gap-1 text-[#002626] font-bold">
              <FileText className="w-3 h-3" />
              <span>{parcela._count?.recomendacoes || 0}</span>
            </div>
            <span className="text-secondary/70 text-[10px]">Pareceres</span>
          </div>

          <div className="bg-white/50 p-2 rounded-md">
            <div className="flex items-center justify-center gap-1 text-amber-700 font-bold">
              <AlertTriangle className="w-3 h-3" />
              <span>{parcela._count?.ocorrencias || 0}</span>
            </div>
            <span className="text-secondary/70 text-[10px]">Pragas</span>
          </div>
        </div>
      </div>

      {/* Botões de Ação do Rodapé do Card */}
      <div className="mt-5 pt-3.5 border-t border-[#8eb69b]/35 flex items-center justify-between gap-2">
        <Link href={`/parcelas/${parcela.id}`} className="flex-1">
          <Button size="sm" variant="outline" className="w-full text-xs font-bold gap-1.5 bg-white/70 hover:bg-white">
            <Eye className="w-3.5 h-3.5" />
            <span>Ver Detalhe</span>
          </Button>
        </Link>

        {isAgricultor && (
          <>
            <Link href={`/parcelas/${parcela.id}?edit=true`}>
              <Button size="sm" variant="secondary" className="px-2.5 text-xs gap-1" title="Editar Parcela">
                <Edit className="w-3.5 h-3.5" />
              </Button>
            </Link>

            {onDelete && (
              <Button
                size="sm"
                variant="outline"
                className="px-2.5 text-xs text-red-600 hover:bg-red-50 border-red-200"
                onClick={() => onDelete(parcela)}
                title="Eliminar Parcela"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
