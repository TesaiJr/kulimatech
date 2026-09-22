// src/app/(dashboard)/culturas/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { culturaService } from '@/features/culturas/services/culturaService';
import { CulturaListItem } from '@/features/culturas/types';
import { USER_ROLES_INFO, UserRole } from '@/types/auth';
import {
  Sprout,
  Search,
  Droplets,
  Calendar,
  Clock,
  Info,
  RefreshCw,
  Layers,
} from 'lucide-react';

export default function CulturasPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [culturas, setCulturas] = useState<CulturaListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth?mode=login');
    }
  }, [authLoading, isAuthenticated, router]);

  const role: UserRole =
    user?.role === 'TECNICO'
      ? 'TECNICO_SDAE'
      : user?.role === 'ADMIN'
      ? 'ADMIN'
      : 'AGRICULTOR';

  const roleInfo = USER_ROLES_INFO[role];

  const layoutUser = user
    ? {
        name: user.nome,
        email: user.email,
        role: roleInfo.label,
      }
    : undefined;

  const loadCulturas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await culturaService.getCulturas({
        search: searchQuery.trim() || undefined,
      });
      setCulturas(data);
    } catch (err: unknown) {
      console.error(err);
      setError('Falha ao carregar o catálogo de culturas da API.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadCulturas();
  }, [loadCulturas]);

  return (
    <DashboardLayout activeNavId="crops-catalog" user={layoutUser}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Cabeçalho da Página */}
        <PageHeader
          title="Catálogo de Culturas Agronómicas"
          description="Espécies prioritárias, limiares de humidade do solo e orientações técnicas para o distrito de Nhamatanda."
          actions={
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
              onClick={loadCulturas}
              disabled={loading}
            >
              Atualizar
            </Button>
          }
        />

        {/* Barra de Pesquisa e Filtros */}
        <Card variant="surface">
          <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar por cultura, nome científico..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-secondary/30 text-primary placeholder:text-primary/40 text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-primary/70 self-end md:self-auto font-medium">
              <Layers className="w-4 h-4 text-secondary" />
              <span>Total no catálogo: <strong>{culturas.length}</strong> espécies</span>
            </div>
          </div>
        </Card>

        {/* Mensagem de Erro */}
        {error && (
          <Alert variant="error" title="Atenção">
            {error}
          </Alert>
        )}

        {/* Estado de Carregamento */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-surface rounded-2xl border border-secondary/20" />
            ))}
          </div>
        )}

        {/* Listagem Vazia */}
        {!loading && culturas.length === 0 && (
          <Card variant="surface" className="text-center py-12">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-primary">
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-primary">Nenhuma cultura encontrada</h3>
              <p className="text-xs text-primary/70 max-w-sm">
                Tente ajustar os termos da sua pesquisa ou clique em atualizar para recarregar o catálogo.
              </p>
            </div>
          </Card>
        )}

        {/* Grid de Cards de Culturas */}
        {!loading && culturas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {culturas.map((cultura) => (
              <Card
                key={cultura.id}
                variant="surface"
                className="hover:border-accent transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2 font-black text-primary">
                          <Sprout className="w-5 h-5 text-emerald-600 shrink-0" />
                          {cultura.nome}
                        </CardTitle>
                        {cultura.nomeCientifico && (
                          <CardDescription className="italic text-xs font-serif mt-0.5 text-secondary">
                            {cultura.nomeCientifico}
                          </CardDescription>
                        )}
                      </div>
                      <Badge variant="accent" size="sm">
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
                          <Droplets className="w-3.5 h-3.5 text-cyan-600" />
                          Humidade Ideal:
                        </span>
                        <span className="font-bold text-primary">
                          {cultura.humidadeMin}% a {cultura.humidadeMax}%
                        </span>
                      </div>

                      {cultura.cicloDias && (
                        <div className="flex items-center justify-between text-primary/70">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
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
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
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
                        <p className="text-[11px] text-primary/70 leading-normal">
                          <strong>Maneio:</strong> {cultura.cuidados}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}