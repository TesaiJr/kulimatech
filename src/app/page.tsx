import React from 'react';
import type { Metadata } from 'next';
import {
  LandingNavbar,
  HeroSection,
  StatsSection,
  HowItWorksSection,
  ProductShowcase,
  InstitutionalSection,
  CallToActionSection,
} from '@/components/landing';
import { Footer } from '@/components/layout';

export const metadata: Metadata = {
  title: 'iMunda • Apoio à Decisão Agrícola em Nhamatanda',
  description:
    'Sistema integrado de apoio à decisão agrícola para o Distrito de Nhamatanda (Sofala, Moçambique), ligando agricultores e técnicos do SDAE com base na humidade do solo e recomendações técnicas.',
  keywords: [
    'iMunda',
    'Nhamatanda',
    'Sofala',
    'Moçambique',
    'SDAE',
    'UniZambeze',
    'Agricultura',
    'Humidade do Solo',
    'Extensão Agrária',
  ],
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-primary selection:bg-accent selection:text-primary">
      {/* 1. Barra de Navegação Superior Fixa */}
      <LandingNavbar />

      {/* 2. Conteúdo Principal Estruturado em Módulos */}
      <main className="flex-1">
        {/* Hero Section com Proposta de Valor e Demonstração */}
        <HeroSection />

        {/* Prova de Valor e Métricas de Impacto em Nhamatanda */}
        <StatsSection />

        {/* Ciclo Operacional em 4 Passos */}
        <HowItWorksSection />

        {/* Demonstração Realista da Plataforma */}
        <ProductShowcase />

        {/* Cooperação Institucional: UniZambeze & SDAE Nhamatanda */}
        <InstitutionalSection />

        {/* Chamada Final para Ação */}
        <CallToActionSection />
      </main>

      {/* 3. Rodapé Institucional Reutilizado de Layout com variante landing */}
      <Footer variant="landing" />
    </div>
  );
}
