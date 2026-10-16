// src/features/parcelas/components/ParcelaForm.tsx
'use client';

import React from 'react';
import { useParcelaForm } from '../hooks/useParcelaForm';
import { ParcelaListItem } from '../types';
import { Layers, MapPin, Compass, Save, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';
import Link from 'next/link';

export interface ParcelaFormProps {
  initialData?: ParcelaListItem | null;
  agricultorId?: string;
  onSuccess?: (parcela?: ParcelaListItem) => void;
  onCancel?: () => void;
}

export function ParcelaForm({ initialData, agricultorId = 'usr-farm-01', onSuccess, onCancel }: ParcelaFormProps) {
  const isEditing = Boolean(initialData);

  const {
    formData,
    errors,
    isSubmitting,
    submitError,
    isGettingGps,
    gpsSuccessMessage,
    handleInputChange,
    handleGetLocation,
    handleSubmit,
  } = useParcelaForm({ initialData: initialData || undefined, agricultorId, onSuccess });

  return (
    <Card variant="surface" className="border border-muted/40 rounded-lg p-6 sm:p-8 bg-surface/50 shadow-sm max-w-3xl mx-auto">
      <div className="flex items-center justify-between border-b border-muted/30 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-primary text-accent flex items-center justify-center font-bold text-lg shadow-sm">
            <Layers className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary">
              {isEditing ? 'Editar Parcela Agrícola' : 'Registar Nova Parcela Agrícola'}
            </h2>
            <p className="text-xs text-secondary/70">
              Distrito de Nhamatanda • Província de Sofala
            </p>
          </div>
        </div>

        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel} className="text-xs font-semibold gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar</span>
          </Button>
        )}
      </div>

      {submitError && (
        <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nome da Parcela */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1.5">
            Nome da Parcela <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.nome || ''}
            onChange={(e) => handleInputChange('nome', e.target.value)}
            placeholder="Ex.: Parcela Lamego 1 — Tomate"
            className="w-full bg-white border-muted/50 rounded-md text-sm text-primary font-semibold"
          />
          {errors.nome && <p className="text-xs text-red-600 mt-1 font-medium">{errors.nome}</p>}
        </div>

        {/* Grade de Área e Solo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Área em Hectares */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1.5">
              Área em Hectares (ha) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type="number"
                step="0.1"
                min="0.1"
                value={formData.areaHectares ?? ''}
                onChange={(e) => handleInputChange('areaHectares', parseFloat(e.target.value) || 0)}
                placeholder="Ex.: 2.5"
                className="w-full bg-white border-muted/50 rounded-md text-sm text-primary font-bold pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-secondary">
                ha
              </span>
            </div>
            {errors.areaHectares && <p className="text-xs text-red-600 mt-1 font-medium">{errors.areaHectares}</p>}
          </div>

          {/* Tipo de Solo */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1.5">
              Tipo de Solo <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.tipoSolo || 'FRANCO'}
              onChange={(e) => handleInputChange('tipoSolo', e.target.value)}
              className="w-full bg-white border border-muted/50 rounded-md px-3 py-2.5 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="FRANCO">Franco-Argiloso (Predominante em Nhamatanda)</option>
              <option value="ARGILOSO">Argiloso</option>
              <option value="ARENOSO">Arenoso</option>
              <option value="MISTO">Misto</option>
              <option value="OUTRO">Outro</option>
            </select>
            {errors.tipoSolo && <p className="text-xs text-red-600 mt-1 font-medium">{errors.tipoSolo}</p>}
          </div>
        </div>

        {/* Descrição da Localização */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1.5">
            Localização Descritiva no Distrito
          </label>
          <div className="relative">
            <Input
              type="text"
              value={formData.localizacao || ''}
              onChange={(e) => handleInputChange('localizacao', e.target.value)}
              placeholder="Ex.: Posto de Lamego, Talhão Sul, Junto ao Canal de Irrigação"
              className="w-full bg-white border-muted/50 rounded-md text-sm text-primary pl-9"
            />
            <MapPin className="w-4 h-4 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Coordenadas GPS (Opcionais com Botão Geolocation) */}
        <div className="p-4 rounded-md bg-white border border-muted/40 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-secondary" />
                Coordenadas Geográficas (GPS)
              </span>
              <p className="text-[11px] text-secondary/70">
                Opcional. Ajuda a calibrar com dados de deteção remota e sensores.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGetLocation}
              disabled={isGettingGps}
              className="text-xs font-bold gap-1.5 bg-muted/20 border-muted/50 text-primary hover:bg-primary hover:text-white transition-all"
            >
              <Compass className={`w-3.5 h-3.5 ${isGettingGps ? 'animate-spin' : ''}`} />
              <span>{isGettingGps ? 'A Obter GPS...' : 'Obter Localização Atual (GPS)'}</span>
            </Button>
          </div>

          {gpsSuccessMessage && (
            <p className="text-xs text-secondary font-medium flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>{gpsSuccessMessage}</span>
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-secondary mb-1">Latitude</label>
              <Input
                type="number"
                step="0.000001"
                value={formData.latitude ?? ''}
                onChange={(e) => handleInputChange('latitude', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="Ex.: -19.234567"
                className="w-full bg-surface border-muted/40 rounded-md text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-secondary mb-1">Longitude</label>
              <Input
                type="number"
                step="0.000001"
                value={formData.longitude ?? ''}
                onChange={(e) => handleInputChange('longitude', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="Ex.: 34.218901"
                className="w-full bg-surface border-muted/40 rounded-md text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Botões de Submissão */}
        <div className="pt-4 border-t border-muted/30 flex items-center justify-end gap-3">
          {onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
          ) : (
            <Link href="/parcelas">
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancelar
              </Button>
            </Link>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="bg-primary hover:bg-secondary text-white font-extrabold px-6 gap-2 rounded-md shadow-md"
          >
            <Save className="w-4 h-4 text-accent" />
            <span>{isSubmitting ? 'A Guardar...' : isEditing ? 'Atualizar Parcela' : 'Guardar Parcela'}</span>
          </Button>
        </div>
      </form>
    </Card>
  );
}
