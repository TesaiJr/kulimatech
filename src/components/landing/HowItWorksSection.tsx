'use client';

import React from 'react';
import { UserCheck, MapPin, Droplets, FileCheck2 } from 'lucide-react';
import { Carousel } from '@/components/ui/Carousel';

export function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Registo do Produtor',
      description:
        'O agricultor é cadastrado e associado ao técnico do SDAE responsável pela sua zona de extensão agrária em Nhamatanda.',
      icon: UserCheck,
    },
    {
      number: '02',
      title: 'Registo da Parcela',
      description:
        'Caracterização do talhão agrícola: localização distrital (Tica, Lamego), área em hectares, tipo de solo e cultura instalada.',
      icon: MapPin,
    },
    {
      number: '03',
      title: 'Leitura de Humidade',
      description:
        'Submissão periódica da leitura de humidade do solo (sensor ou punho) para monitorização contínua do estado hídrico.',
      icon: Droplets,
    },
    {
      number: '04',
      title: 'Recomendação Técnica',
      description:
        'O técnico do SDAE valida a leitura e emite orientações práticas de rega e medidas preventivas de fitossanidade.',
      icon: FileCheck2,
    },
  ];

  return (
    <section id="como-funciona" className="py-16 md:py-24 bg-surface text-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 space-y-12">
        
        {/* Título da Secção Sóbrio */}
        <div className="max-w-3xl text-left space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-secondary/70">
            Fluxo Operacional de Campo
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary tracking-tight">
            Como o iMunda Funciona no Terreno
          </h2>
          <p className="text-sm sm:text-base text-secondary/80 leading-relaxed">
            Processo direto e adaptado às condições de conectividade e trabalho dos técnicos e agricultores no distrito de Nhamatanda.
          </p>
        </div>

        {/* Carrossel no Mobile / Grade no Desktop */}
        <Carousel mobileOnly desktopColumns={4} showDots>
          {steps.map((step, idx) => {
            const Icon = step.icon;

            return (
              <div
                key={idx}
                className="bg-white p-6 sm:p-7 rounded-3xl border border-secondary/20 shadow-sm flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-mono font-bold bg-secondary/10 text-secondary px-3 py-1 rounded-lg">
                      Etapa {step.number}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-surface text-secondary flex items-center justify-center">
                      <Icon className="w-5 h-5 stroke-[2]" />
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-primary mb-2.5">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-secondary/80 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-8 pt-3 border-t border-secondary/10 text-xs font-medium text-secondary/60">
                  Passo {idx + 1} de 4
                </div>
              </div>
            );
          })}
        </Carousel>

      </div>
    </section>
  );
}
