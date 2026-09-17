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
    <section id="como-funciona" className="pt-8 sm:pt-10 lg:pt-12 pb-5 sm:pb-6 lg:pb-7 bg-surface text-primary">
      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 2xl:px-24 space-y-5 sm:space-y-6">
        
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
                className="bg-[#e6efe8] p-6 sm:p-7 rounded-lg border border-[#8eb69b]/45 shadow-sm hover:shadow-md hover:border-[#0e4749]/40 transition-all flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-mono font-bold bg-[#002626]/10 text-[#002626] px-2.5 py-1 rounded-sm">
                      Etapa {step.number}
                    </span>
                    <div className="w-9 h-9 rounded-md bg-[#002626] text-[#95c623] flex items-center justify-center shadow-xs">
                      <Icon className="w-4 h-4 stroke-[2.2]" />
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
