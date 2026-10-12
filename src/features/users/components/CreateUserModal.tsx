// src/features/users/components/CreateUserModal.tsx
'use client';

import React, { useState } from 'react';
import { CreateUserInput } from '../types';
import { UserRole } from '@/features/auth/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, UserPlus, Shield, UserCheck, Sprout } from 'lucide-react';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserInput) => Promise<boolean>;
  loading: boolean;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
}) => {
  const [formData, setFormData] = useState<CreateUserInput>({
    nome: '',
    email: '',
    password: '',
    role: 'AGRICULTOR',
    telefone: '',
    zonaAtuacao: '',
  });

  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.nome.trim() || formData.nome.length < 3) {
      setFormError('O nome deve conter pelo menos 3 caracteres.');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFormError('Informe um endereço de e-mail válido.');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setFormError('A palavra-passe deve conter pelo menos 6 caracteres.');
      return;
    }

    const success = await onSubmit({
      ...formData,
      email: formData.email.trim().toLowerCase(),
      nome: formData.nome.trim(),
      telefone: formData.telefone?.trim() || undefined,
      zonaAtuacao: formData.zonaAtuacao?.trim() || undefined,
    });

    if (success) {
      setFormData({
        nome: '',
        email: '',
        password: '',
        role: 'AGRICULTOR',
        telefone: '',
        zonaAtuacao: '',
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-xl border border-border shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Registar Novo Utilizador</h2>
              <p className="text-xs text-muted-foreground">
                Criação institucional de contas pelo Administrador
              </p>
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
            <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
              {formError}
            </div>
          )}

          {/* Perfil Seleção */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Perfil de Acesso <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'AGRICULTOR' })}
                className={`p-3 rounded-lg border text-left flex flex-col items-center gap-1.5 transition-all ${
                  formData.role === 'AGRICULTOR'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 font-medium'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted/30'
                }`}
              >
                <Sprout className="h-4 w-4 text-emerald-600" />
                <span className="text-xs">Agricultor</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'TECNICO' })}
                className={`p-3 rounded-lg border text-left flex flex-col items-center gap-1.5 transition-all ${
                  formData.role === 'TECNICO'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-medium'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted/30'
                }`}
              >
                <UserCheck className="h-4 w-4 text-blue-600" />
                <span className="text-xs">Técnico SDAE</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'ADMIN' })}
                className={`p-3 rounded-lg border text-left flex flex-col items-center gap-1.5 transition-all ${
                  formData.role === 'ADMIN'
                    ? 'border-purple-600 bg-purple-50/50 text-purple-900 font-medium'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted/30'
                }`}
              >
                <Shield className="h-4 w-4 text-purple-600" />
                <span className="text-xs">Administrador</span>
              </button>
            </div>
          </div>

          {/* Nome */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Nome Completo <span className="text-rose-500">*</span>
            </label>
            <Input
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Mateus António Machava"
              required
              className="h-10"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Endereço de E-mail <span className="text-rose-500">*</span>
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Ex: mateus.machava@sdae.gov.mz"
              required
              className="h-10"
            />
          </div>

          {/* Palavra-passe */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Palavra-passe Provisória <span className="text-rose-500">*</span>
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Mínimo 6 caracteres"
              required
              className="h-10"
            />
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

            {/* Zona de Atuação */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Zona / Comunidade
              </label>
              <Input
                value={formData.zonaAtuacao || ''}
                onChange={(e) => setFormData({ ...formData, zonaAtuacao: e.target.value })}
                placeholder="Ex: Vila de Nhamatanda, Tica, Metuchira"
                className="h-10"
              />
            </div>
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
              {loading ? 'A registar...' : 'Criar Utilizador'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
