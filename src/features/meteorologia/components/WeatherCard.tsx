// src/features/meteorologia/components/WeatherCard.tsx
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { WeatherData } from '../types';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  Droplets,
  Wind,
  Thermometer,
  Calendar,
  RefreshCw,
  MapPin,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

interface WeatherCardProps {
  clima: WeatherData | null;
  loading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export function WeatherCard({
  clima,
  loading = false,
  onRefresh,
  className = '',
}: WeatherCardProps) {
  const renderWeatherIcon = (iconName: string, classNameStr: string) => {
    switch (iconName) {
      case 'sun':
        return <Sun className={`${classNameStr} text-amber-500`} />;
      case 'cloud-sun':
        return <CloudSun className={`${classNameStr} text-amber-500`} />;
      case 'cloud':
        return <Cloud className={`${classNameStr} text-slate-400`} />;
      case 'cloud-drizzle':
        return <CloudDrizzle className={`${classNameStr} text-cyan-500`} />;
      case 'cloud-rain':
        return <CloudRain className={`${classNameStr} text-cyan-600`} />;
      case 'cloud-lightning':
        return <CloudLightning className={`${classNameStr} text-purple-600`} />;
      default:
        return <CloudSun className={`${classNameStr} text-amber-500`} />;
    }
  };

  const formatDayName = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('pt-MZ', { weekday: 'short' });
    } catch {
      return dateStr;
    }
  };

  if (loading && !clima) {
    return (
      <Card variant="surface" className={`p-6 animate-pulse space-y-4 ${className}`}>
        <div className="h-6 bg-secondary/20 rounded w-1/3" />
        <div className="h-20 bg-secondary/15 rounded-xl" />
        <div className="grid grid-cols-3 gap-3">
          <div className="h-16 bg-secondary/15 rounded-xl" />
          <div className="h-16 bg-secondary/15 rounded-xl" />
          <div className="h-16 bg-secondary/15 rounded-xl" />
        </div>
      </Card>
    );
  }

  if (!clima) {
    return null;
  }

  return (
    <Card
      variant="surface"
      className={`overflow-hidden border border-secondary/20 hover:border-accent transition-all duration-200 ${className}`}
    >
      {/* Top Header */}
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-secondary/10 bg-gradient-to-r from-secondary/10 via-surface to-accent/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-extrabold text-primary flex items-center gap-1.5">
                <span>{clima.localizacao}</span>
              </CardTitle>
              <p className="text-[11px] text-primary/60 font-mono">
                {clima.coordenadas.latitude.toFixed(2)}° S, {clima.coordenadas.longitude.toFixed(2)}° E • Open-Meteo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {clima.isFallback && (
              <Badge variant="accent" size="sm" className="text-[10px]">
                Modo Offline
              </Badge>
            )}
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                className="p-1.5 rounded-lg text-primary/60 hover:text-primary hover:bg-secondary/15 transition-colors"
                title="Atualizar clima"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Temperatura Atual & Métricas Principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 shrink-0">
              {renderWeatherIcon(clima.atual.icone, 'w-10 h-10')}
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-primary tracking-tight">
                  {Math.round(clima.atual.temperatura)}°C
                </span>
                <span className="text-xs text-primary/60">
                  Sensação {Math.round(clima.atual.sensacaoTermica)}°C
                </span>
              </div>
              <p className="text-xs font-semibold text-secondary">
                {clima.atual.condicao}
              </p>
            </div>
          </div>

          {/* Indicadores complementares */}
          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-secondary/5 border border-secondary/10 text-xs text-center">
            <div className="space-y-0.5">
              <span className="text-[10px] text-primary/60 flex items-center justify-center gap-1">
                <Droplets className="w-3 h-3 text-cyan-600" />
                Humidade
              </span>
              <p className="font-bold text-primary">{clima.atual.humidadeRelativa}%</p>
            </div>

            <div className="space-y-0.5 border-x border-secondary/10">
              <span className="text-[10px] text-primary/60 flex items-center justify-center gap-1">
                <Wind className="w-3 h-3 text-teal-600" />
                Vento
              </span>
              <p className="font-bold text-primary">{Math.round(clima.atual.velocidadeVento)} km/h</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-primary/60 flex items-center justify-center gap-1">
                <CloudRain className="w-3 h-3 text-blue-600" />
                Chuva
              </span>
              <p className="font-bold text-primary">{clima.atual.precipitacao} mm</p>
            </div>
          </div>
        </div>

        {/* Previsão para os Próximos 3 Dias */}
        <div className="space-y-1.5 pt-2 border-t border-secondary/10">
          <span className="text-[11px] font-bold text-primary/70 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-secondary" />
            Previsão para 3 Dias (Nhamatanda):
          </span>

          <div className="grid grid-cols-3 gap-2">
            {clima.previsao3Dias.map((dia, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-surface border border-secondary/20 flex flex-col items-center text-center space-y-1 hover:border-secondary transition-all"
              >
                <span className="text-[11px] font-bold text-primary capitalize">
                  {formatDayName(dia.data)}
                </span>
                {renderWeatherIcon(dia.icone, 'w-5 h-5 my-0.5')}
                <span className="text-xs font-black text-primary">
                  {Math.round(dia.tempMax)}° <span className="text-[10px] font-normal text-primary/60">{Math.round(dia.tempMin)}°</span>
                </span>
                <span className="text-[9px] font-semibold text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded-full border border-cyan-200">
                  {dia.probabilidadeChuva}% chuva
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Caixa de Recomendação Agroclimática */}
        {clima.recomendacaoAgricola && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs text-primary/90 leading-relaxed">
              <strong className="text-emerald-950 font-bold block mb-0.5">
                Orientação Agroclimática Automática:
              </strong>
              {clima.recomendacaoAgricola}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
