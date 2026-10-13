import React from 'react';
import Link from 'next/link';
import { ParcelaListItem } from '../types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button } from '@/components/ui';
import { Eye, Edit, Trash2, MapPin, Layers } from 'lucide-react';

export interface ParcelaListTableProps {
  parcelas: ParcelaListItem[];
  userRole?: string;
  onDelete?: (parcela: ParcelaListItem) => void;
}

const SOLO_LABELS: Record<string, string> = {
  ARENOSO: 'Arenoso',
  ARGILOSO: 'Argiloso',
  FRANCO: 'Franco-Argiloso',
  MISTO: 'Misto',
  OUTRO: 'Outro',
};

export function ParcelaListTable({ parcelas, userRole = 'AGRICULTOR', onDelete }: ParcelaListTableProps) {
  const isAgricultor = userRole === 'AGRICULTOR';

  if (parcelas.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-muted/40 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/15">
          <TableRow>
            <TableHead className="font-bold text-primary">Parcela</TableHead>
            <TableHead className="font-bold text-primary">Área (ha)</TableHead>
            <TableHead className="font-bold text-primary">Tipo de Solo</TableHead>
            <TableHead className="font-bold text-primary">Localização / GPS</TableHead>
            {!isAgricultor && <TableHead className="font-bold text-primary">Agricultor</TableHead>}
            <TableHead className="font-bold text-primary text-center">Atividades</TableHead>
            <TableHead className="font-bold text-primary text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parcelas.map((parcela) => (
            <TableRow key={parcela.id} className="hover:bg-muted/20 transition-colors">
              <TableCell className="font-bold text-primary">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-primary text-accent flex items-center justify-center text-xs flex-shrink-0">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <span>{parcela.nome}</span>
                </div>
              </TableCell>

              <TableCell className="font-mono font-semibold text-secondary">
                {parcela.areaHectares} ha
              </TableCell>

              <TableCell>
                <span className="text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-0.5 rounded-sm">
                  {SOLO_LABELS[parcela.tipoSolo] || parcela.tipoSolo}
                </span>
              </TableCell>

              <TableCell className="text-xs text-secondary/80 max-w-xs truncate">
                {parcela.localizacao ? (
                  <span className="flex items-center gap-1" title={parcela.localizacao}>
                    <MapPin className="w-3 h-3 text-secondary flex-shrink-0" />
                    <span className="truncate">{parcela.localizacao}</span>
                  </span>
                ) : parcela.latitude && parcela.longitude ? (
                  <span className="font-mono text-[11px]">
                    GPS: {parcela.latitude}, {parcela.longitude}
                  </span>
                ) : (
                  <span className="text-secondary/40 italic">Não especificada</span>
                )}
              </TableCell>

              {!isAgricultor && (
                <TableCell className="text-xs font-medium text-primary">
                  {parcela.agricultor ? (
                    <div>
                      <div className="font-bold">{parcela.agricultor.nome}</div>
                      <div className="text-[10px] text-secondary/60">{parcela.agricultor.zonaAtuacao}</div>
                    </div>
                  ) : (
                    <span className="text-secondary/50">—</span>
                  )}
                </TableCell>
              )}

              <TableCell className="text-center">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold bg-surface px-2.5 py-1 rounded border border-secondary/20">
                  <span title="Leituras">{parcela._count?.leituras || 0}L</span>
                  <span className="text-secondary/30">|</span>
                  <span title="Recomendações">{parcela._count?.recomendacoes || 0}R</span>
                </div>
              </TableCell>

              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <Link href={`/parcelas/${parcela.id}`}>
                    <Button size="sm" variant="outline" className="px-2 py-1 text-xs gap-1" title="Ver Detalhe">
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </Link>

                  {isAgricultor && (
                    <>
                      <Link href={`/parcelas/${parcela.id}?edit=true`}>
                        <Button size="sm" variant="secondary" className="px-2 py-1 text-xs gap-1" title="Editar">
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                      </Link>

                      {onDelete && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 border-red-200"
                          onClick={() => onDelete(parcela)}
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
