'use client';

import React from 'react';
import { Users, Map, Building2, Droplets } from 'lucide-react';
import { Carousel } from '@/components/ui/Carousel';

export function StatsSection() {
  const stats = [
    {
      value: '+150',
      label: 'Produtores em Acompanhamento',
      detail: 'Agricultores familiares cadastrados nos postos de Nhamatanda',
      icon: Users,
    },
    {
      value: '420 ha',
      label: 'Área Agrícola Monitorada',
      detail: 'Parcelas produtivas de milho, feijão bóer e hortícolas',
      icon: Map,
    },
    {
      value: '100%',
      label: 'Presença Técnica SDAE',
      detail: 'Acompanhamento nos postos de Tica, Lamego e Nhamatanda-Sede',
      icon: Building2,
    },
    {
      value: '-30%',
      label: 'Economia Hídrica Estimada',
      detail: 'Calibração dos ciclos de rega com base na humidade do solo',
      icon: Droplets,
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-surface border-t border-secondary/10 text-primary">
      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 2xl:px-24">
        {/* Carrossel no Mobile e Grid no Desktop */}
        <Carousel mobileOnly desktopColumns={4} showDots>
          {stats.map((stat, idx) => {
            const Icon = stat.icon;

            return (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-2xl border border-secondary/15 bg-white shadow-sm flex flex-col justify-between h-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl sm:text-4xl font-black text-primary font-mono tracking-tight">
                    {stat.value}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-sm sm:text-base text-primary">
                    {stat.label}
                  </h3>
                  <p className="text-xs sm:text-sm text-secondary/70 mt-1.5 leading-relaxed">
                    {stat.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </Carousel>
      </div>
    </section>
  );
}
