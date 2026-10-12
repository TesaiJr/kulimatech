// src/features/users/components/FarmerCardGrid.tsx
'use client';

import React, { useState } from 'react';
import { UserAdminDTO } from '../types';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';
import {
  Search,
  MessageSquare,
  MapPin,
  Phone,
  Mail,
  Sprout,
  Users,
  ExternalLink,
} from 'lucide-react';

interface FarmerCardGridProps {
  farmers: UserAdminDTO[];
  loading: boolean;
}

export const FarmerCardGrid: React.FC<FarmerCardGridProps> = ({ farmers, loading }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredFarmers = farmers.filter(
    (f) =>
      f.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.zonaAtuacao && f.zonaAtuacao.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.telefone && f.telefone.includes(searchQuery))
  );

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Barra de Busca de Produtores */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar agricultor por nome, zona, telefone..."
            className="pl-9 h-10 bg-background"
          />
        </div>
        <p className="text-xs text-muted-foreground self-center">
          Mostrando <span className="font-semibold text-foreground">{filteredFarmers.length}</span> de{' '}
          <span className="font-semibold text-foreground">{farmers.length}</span> agricultor(es) sob supervisão
        </p>
      </div>

      {/* Grid de Cartões */}
      {loading ? (
        <div className="py-16 text-center text-muted-foreground">
          <p className="text-sm">A carregar os seus agricultores acompanhados...</p>
        </div>
      ) : filteredFarmers.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground bg-card rounded-xl border border-border p-8">
          <Users className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <h3 className="text-base font-bold text-foreground">Nenhum agricultor encontrado</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
            {searchQuery
              ? 'Nenhum resultado corresponde à sua pesquisa. Tente outros termos.'
              : 'Você ainda não possui agricultores atribuídos à sua carteira técnica. Solicite a vinculação ao Administrador do SDAE.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFarmers.map((agri) => {
            const parcelasCount = agri._count?.parcelas || 0;

            return (
              <Card
                key={agri.id}
                className="border-border hover:border-primary/50 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <CardContent className="p-5 space-y-4">
                  {/* Cabeçalho do Card */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-11 w-11 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shrink-0">
                        {getInitials(agri.nome)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-foreground text-sm truncate">{agri.nome}</h4>
                        <Badge
                          variant="secondary"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] mt-0.5"
                        >
                          Agricultor Familiar
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Informações de Contato e Localização */}
                  <div className="text-xs space-y-2 pt-1 border-t border-border/60">
                    <div className="flex items-center gap-2 text-muted-foreground truncate">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{agri.email}</span>
                    </div>

                    <div className="flex items-center gap-2 text-foreground">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span>{agri.telefone || 'Sem telefone registado'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-primary font-medium">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span>{agri.zonaAtuacao || 'Zona não especificada'}</span>
                    </div>
                  </div>

                  {/* Indicador de Parcelas */}
                  <div className="p-2.5 rounded-lg bg-muted/40 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Sprout className="h-4 w-4 text-emerald-600" />
                      Parcelas Registadas
                    </span>
                    <span className="font-bold text-foreground">{parcelasCount}</span>
                  </div>

                  {/* Ações */}
                  <div className="pt-2 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/parcelas?agricultorId=${agri.id}`)}
                      className="flex-1 h-9 text-xs"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      Ver Parcelas
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => router.push(`/mensagens?contactId=${agri.id}`)}
                      className="flex-1 h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <MessageSquare className="h-3.5 w-3.5 mr-1" />
                      Conversar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
