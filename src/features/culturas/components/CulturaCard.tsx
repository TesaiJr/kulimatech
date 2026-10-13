// src/features/culturas/components/CulturaCard.tsx
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CulturaListItem } from '../types';
import {
  Sprout,
  Droplets,
  Calendar,
  Clock,
  Info,
  Edit,
  Trash2,
  AlertCircle,
} from 'lucide-react';

interface CulturaCardProps {
  cultura: CulturaListItem;
  isAdmin?: boolean;
  onEdit?: (cultura: CulturaListItem) => void;
  onDelete?: (cultura: CulturaListItem) => void;
}

export function CulturaCard({
  cultura,
  isAdmin = false,
  onEdit,
  onDelete,
}: CulturaCardProps) {
  return (
    <Card
      variant="surface"
      className="hover:border-accent transition-all duration-200 flex flex-col justify-between h-full group"
    >
      <div>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg flex items-center gap-2 font-black text-primary truncate">
                <Sprout className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="truncate">{cultura.nome}</span>
              </CardTitle>
              {cultura.nomeCientifico && (
                <CardDescription className="italic text-xs font-serif mt-0.5 text-secondary truncate">
                  {cultura.nomeCientifico}
                </CardDescription>
              )}
            </div>
            <Badge variant="accent" size="sm" className="shrink-0">
              {cultura.humidadeMin}% - {cultura.humidadeMax}%
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-xs text-primary/80 leading-relaxed line-clamp-3">
            {cultura.descricao}
          </p>

          {/* Metadados e Parâmetros Agronómicos */}
          <div className="space-y-2 pt-3 border-t border-secondary/10 text-xs">
            <div className="flex items-center justify-between text-primary/70">
              <span className="flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                Humidade Ideal:
              </span>
              <span className="font-bold text-primary">
                {cultura.humidadeMin}% a {cultura.humidadeMax}%
              </span>
            </div>

            {cultura.cicloDias && (
              <div className="flex items-center justify-between text-primary/70">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  Ciclo Vegetativo:
                </span>
                <span className="font-semibold text-primary">
                  {cultura.cicloDias} dias
                </span>
              </div>
            )}

            {cultura.epocaPlantio && (
              <div className="flex items-center justify-between text-primary/70">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Época de Plantio:
                </span>
                <span className="font-semibold text-primary text-right max-w-[55%] truncate">
                  {cultura.epocaPlantio}
                </span>
              </div>
            )}
          </div>

          {/* Cuidados e Dicas Técnicas */}
          {cultura.cuidados && (
            <div className="p-2.5 rounded-xl bg-secondary/5 border border-secondary/15 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" />
              <p className="text-[11px] text-primary/70 leading-normal line-clamp-3">
                <strong>Maneio:</strong> {cultura.cuidados}
              </p>
            </div>
          )}

          {/* Indicadores de Vínculos (se existirem) */}
          {cultura._count && (cultura._count.recomendacoes !== undefined || cultura._count.pragas !== undefined) && (
            <div className="flex items-center gap-3 text-[10px] text-primary/60 pt-1">
              {cultura._count.recomendacoes !== undefined && (
                <span>Recomendações: <strong>{cultura._count.recomendacoes}</strong></span>
              )}
              {cultura._count.pragas !== undefined && (
                <span>Pragas: <strong>{cultura._count.pragas}</strong></span>
              )}
            </div>
          )}
        </CardContent>
      </div>

      {/* Ações Administrativas */}
      {isAdmin && (
        <div className="p-3 bg-secondary/5 border-t border-secondary/10 flex items-center justify-end gap-2 rounded-b-2xl">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onEdit?.(cultura)}
            leftIcon={<Edit className="w-3.5 h-3.5 text-primary" />}
            className="text-xs py-1 h-8"
          >
            Editar
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onDelete?.(cultura)}
            leftIcon={<Trash2 className="w-3.5 h-3.5 text-red-600" />}
            className="text-xs py-1 h-8 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
          >
            Eliminar
          </Button>
        </div>
      )}
    </Card>
  );
}
