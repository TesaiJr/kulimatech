// src/features/users/components/CarteiraTecnicaPanel.tsx
'use client';

import React, { useState } from 'react';
import { CarteiraTecnicaItem, UserAdminDTO } from '../types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  UserCheck,
  Users,
  UserPlus,
  UserMinus,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';

interface CarteiraTecnicaPanelProps {
  tecnicos: CarteiraTecnicaItem[];
  agricultoresPendentes: UserAdminDTO[];
  loading: boolean;
  actionLoading: boolean;
  onRefresh: () => void;
  onOpenAtribuirModal: (tecnicoId?: string) => void;
  onRemoverAtribuicao: (tecnicoId: string, agricultorId: string) => void;
}

export const CarteiraTecnicaPanel: React.FC<CarteiraTecnicaPanelProps> = ({
  tecnicos,
  agricultoresPendentes,
  loading,
  actionLoading,
  onRefresh,
  onOpenAtribuirModal,
  onRemoverAtribuicao,
}) => {
  const [selectedTecnicoId, setSelectedTecnicoId] = useState<string | null>(
    tecnicos.length > 0 ? tecnicos[0].tecnico.id : null
  );

  const activeItem =
    tecnicos.find((t) => t.tecnico.id === selectedTecnicoId) || tecnicos[0] || null;

  return (
    <div className="space-y-6">
      {/* Alerta de Agricultores Pendentes de Atribuição */}
      {agricultoresPendentes.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                {agricultoresPendentes.length} Agricultor(es) sem Técnico SDAE
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Existem agricultores registados que ainda não foram vinculados a nenhum extensionista de campo.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => onOpenAtribuirModal(activeItem?.tecnico.id)}
            className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 h-9"
          >
            <UserPlus className="h-4 w-4 mr-1.5" />
            Atribuir Agora
          </Button>
        </div>
      )}

      {/* Grid Principal de Carteiras */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Esquerda: Lista de Técnicos SDAE (4 cols) */}
        <div className="lg:col-span-5 bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-blue-600" />
                Técnicos do SDAE ({tecnicos.length})
              </h3>
              <p className="text-xs text-muted-foreground">Selecione para gerir a carteira</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <div className="divide-y divide-border overflow-y-auto max-h-[550px]">
            {loading && tecnicos.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs">
                A carregar técnicos...
              </div>
            ) : tecnicos.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs">
                Nenhum técnico SDAE cadastrado no sistema.
              </div>
            ) : (
              tecnicos.map((item) => {
                const isSelected = activeItem?.tecnico.id === item.tecnico.id;
                return (
                  <button
                    key={item.tecnico.id}
                    onClick={() => setSelectedTecnicoId(item.tecnico.id)}
                    className={`w-full p-4 text-left transition-colors flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-primary/10 border-l-4 border-primary'
                        : 'hover:bg-muted/40'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground truncate">
                          {item.tecnico.nome}
                        </p>
                        {item.tecnico.status === 'ATIVO' ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Ativo" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-rose-500" title="Bloqueado" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{item.tecnico.email}</p>
                      {item.tecnico.zonaAtuacao && (
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {item.tecnico.zonaAtuacao}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <Badge
                        variant="secondary"
                        className={
                          item.totalAgricultores > 0
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-muted text-muted-foreground'
                        }
                      >
                        {item.totalAgricultores} agricultor(es)
                      </Badge>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Coluna Direita: Detalhes da Carteira Selecionada (7 cols) */}
        <div className="lg:col-span-7 bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
          {activeItem ? (
            <>
              {/* Header do Técnico Selecionado */}
              <div className="p-5 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-foreground">
                      Carteira: {activeItem.tecnico.nome}
                    </h3>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                      Técnico SDAE
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {activeItem.tecnico.email}
                    </span>
                    {activeItem.tecnico.telefone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {activeItem.tecnico.telefone}
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => onOpenAtribuirModal(activeItem.tecnico.id)}
                  className="h-9 px-3 shrink-0"
                >
                  <UserPlus className="h-4 w-4 mr-1.5" />
                  Vincular Agricultores
                </Button>
              </div>

              {/* Lista de Agricultores Supervisionados */}
              <div className="p-4 overflow-y-auto max-h-[550px]">
                {activeItem.agricultores.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <FolderOpen className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="font-semibold text-foreground">Nenhum agricultor atribuído</p>
                    <p className="text-xs mt-1">
                      Este técnico ainda não tem agricultores familiares vinculados à sua carteira.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenAtribuirModal(activeItem.tecnico.id)}
                      className="mt-4"
                    >
                      <UserPlus className="h-4 w-4 mr-1.5" />
                      Vincular Primeiro Agricultor
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {activeItem.agricultores.map((agri) => (
                      <div
                        key={agri.id}
                        className="p-3 rounded-lg border border-border bg-background hover:bg-muted/20 transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {agri.nome}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-0.5">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {agri.email}
                            </span>
                            {agri.telefone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {agri.telefone}
                              </span>
                            )}
                            {agri.zonaAtuacao && (
                              <span className="flex items-center gap-1 text-primary">
                                <MapPin className="h-3 w-3" />
                                {agri.zonaAtuacao}
                              </span>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={actionLoading}
                          onClick={() => onRemoverAtribuicao(activeItem.tecnico.id, agri.id)}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 px-2.5 shrink-0 text-xs"
                          title="Desvincular da carteira deste técnico"
                        >
                          <UserMinus className="h-3.5 w-3.5 mr-1" />
                          Desvincular
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              Selecione um técnico à esquerda para ver e gerir a carteira de agricultores.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
