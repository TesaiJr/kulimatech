// src/features/users/components/EditUserModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { UserAdminDTO, UpdateUserInput } from '../types';
import { UserRole, UserStatus } from '@/features/auth/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Edit3, ShieldAlert, KeyRound } from 'lucide-react';

interface EditUserModalProps {
  isOpen: boolean;
  user: UserAdminDTO | null;
  onClose: () => void;
  onSubmit: (id: string, data: UpdateUserInput) => Promise<boolean>;
  loading: boolean;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  user,
  onClose,
  onSubmit,
  loading,
}) => {
  const [formData, setFormData] = useState<UpdateUserInput>({
    nome: '',
    role: 'AGRICULTOR',
    status: 'ATIVO',
    telefone: '',
    zonaAtuacao: '',
    password: '',
  });

  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome,
        role: user.role,
        status: user.status,
        telefone: user.telefone || '',
        zonaAtuacao: user.zonaAtuacao || '',
        password: '',
      });
      setFormError(null);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (formData.nome && formData.nome.trim().length < 3) {
      setFormError('O nome deve conter pelo menos 3 caracteres.');
      return;
    }

    if (formData.password && formData.password.trim().length > 0 && formData.password.trim().length < 6) {
      setFormError('Se for alterar a palavra-passe, ela deve ter no mínimo 6 caracteres.');
      return;
    }

    const payload: UpdateUserInput = {
      nome: formData.nome?.trim(),
      role: formData.role,
      status: formData.status,
      telefone: formData.telefone?.trim() || null,
      zonaAtuacao: formData.zonaAtuacao?.trim() || null,
    };

    if (formData.password && formData.password.trim().length >= 6) {
      payload.password = formData.password.trim();
    }

    const success = await onSubmit(user.id, payload);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-xl border border-border shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Editar Utilizador</h2>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground rounded-lg p-1 hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {formError && (
            <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Nome */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Nome Completo <span className="text-rose-500">*</span>
            </label>
            <Input
              value={formData.nome || ''}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
              className="h-10"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Perfil */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Perfil de Acesso
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="AGRICULTOR">Agricultor Familiar</option>
                <option value="TECNICO">Técnico SDAE</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Estado da Conta
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
                <option value="BLOQUEADO">Bloqueado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Telefone */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Contacto Telefónico
              </label>
              <Input
                value={formData.telefone || ''}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="+258 84 123 4567"
                className="h-10"
              />
            </div>

            {/* Zona */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Zona de Atuação / Residência
              </label>
              <Input
                value={formData.zonaAtuacao || ''}
                onChange={(e) => setFormData({ ...formData, zonaAtuacao: e.target.value })}
                placeholder="Ex: Tica, Nhamatanda"
                className="h-10"
              />
            </div>
          </div>

          {/* Redefinição de senha */}
          <div className="pt-2 border-t border-border">
            <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
              Redefinir Palavra-passe (Opcional)
            </label>
            <Input
              type="password"
              value={formData.password || ''}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Preencha apenas se desejar redefinir"
              className="h-10"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Deixe em branco para manter a palavra-passe atual intacta.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="h-10"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="h-10 px-5">
              {loading ? 'A guardar...' : 'Guardar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
