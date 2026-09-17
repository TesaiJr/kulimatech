import React from 'react';
import { ParcelaListItem, ParcelaDetalhe } from '../types';
import { Modal, Button } from '@/components/ui';
import { AlertTriangle, Trash2 } from 'lucide-react';

export interface ParcelaDeleteDialogProps {
  parcela: ParcelaListItem | ParcelaDetalhe | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function ParcelaDeleteDialog({
  parcela,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: ParcelaDeleteDialogProps) {
  if (!parcela) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar Eliminação de Parcela">
      <div className="space-y-4">
        <div className="p-4 rounded-md bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs leading-relaxed">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm text-red-900 mb-1">Ação Irreversível</p>
            <p>
              Tem a certeza de que deseja eliminar a parcela <strong>&ldquo;{parcela.nome}&rdquo;</strong> (
              {parcela.areaHectares} ha)? Todos os históricos de leituras e recomendações associadas deixharão de estar visíveis.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white font-bold gap-1.5 border-none shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'A Eliminar...' : 'Sim, Eliminar Parcela'}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
