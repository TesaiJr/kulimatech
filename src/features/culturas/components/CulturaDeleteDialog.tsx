// src/features/culturas/components/CulturaDeleteDialog.tsx
'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { CulturaListItem } from '../types';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface CulturaDeleteDialogProps {
  cultura: CulturaListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export function CulturaDeleteDialog({
  cultura,
  isOpen,
  onClose,
  onConfirm,
}: CulturaDeleteDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!cultura) return null;

  const hasRecommendations = (cultura._count?.recomendacoes ?? 0) > 0;
  const hasPests = (cultura._count?.pragas ?? 0) > 0;
  const isBlocked = hasRecommendations || hasPests;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await onConfirm(cultura.id);
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível eliminar esta cultura do catálogo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar Cultura Agronómica"
      description="Confirmação de remoção de espécie do catálogo mestre de Nhamatanda."
      size="sm"
    >
      <div className="space-y-4 pt-2">
        {error && (
          <Alert variant="error">
            <span className="text-xs">{error}</span>
          </Alert>
        )}

        {isBlocked ? (
          <Alert variant="warning">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">Esta cultura não pode ser eliminada diretamente.</p>
                <p className="text-primary/70">
                  Existem dependências ativas no sistema:
                  {hasRecommendations && (
                    <span className="block">• {cultura._count?.recomendacoes} recomendações técnicas associadas</span>
                  )}
                  {hasPests && (
                    <span className="block">• {cultura._count?.pragas} pragas associadas no catálogo</span>
                  )}
                </p>
                <p className="text-[11px] text-primary/60 italic pt-1">
                  A remoção causaria perda de integridade dos dados históricos agrícolas.
                </p>
              </div>
            </div>
          </Alert>
        ) : (
          <p className="text-xs text-primary/80 leading-relaxed">
            Tem a certeza de que deseja eliminar a cultura <strong>{cultura.nome}</strong>? Esta ação é irreversível e removerá todos os parâmetros climáticos associados.
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-secondary/10">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            {isBlocked ? 'Entendido' : 'Cancelar'}
          </Button>
          {!isBlocked && (
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={handleDelete}
              leftIcon={<Trash2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
              className="text-red-600 border-red-300 hover:bg-red-600 hover:text-white hover:border-red-600"
            >
              {loading ? 'A eliminar...' : 'Confirmar Eliminação'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
