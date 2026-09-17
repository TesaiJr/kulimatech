'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Droplets,
  MapPin,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const HERO_SLIDES = [
  {
    id: 1,
    image: '/images/login-hero.jpg',
    title: 'Extensão Agrária & Monitoria',
    description: 'Acompanhamento técnico diário das parcelas familiares no distrito.',
    tag: 'Técnica SDAE Nhamatanda',
    highlight: 'Registo Direto de Humidade',
    status: '38.4% (Faixa Óptima)',
  },
  {
    id: 2,
    image: '/images/hero-irrigation.jpg',
    title: 'Maneio Hídrico e Rega por Gotejamento',
    description: 'Optimização dos ciclos de rega para milho, feijão e hortícolas em Lamego.',
    tag: 'Associação de Regantes',
    highlight: 'Economia Hídrica Estimada',
    status: '-30% de Desperdício',
  },
  {
    id: 3,
    image: '/images/hero-crops.jpg',
    title: 'Sanidade Vegetal e Prevenção',
    description: 'Identificação precoce de pragas e recomendações fitossanitárias em tempo real.',
    tag: 'Posto de Tica • Sofala',
    highlight: 'Pareceres Oficiais',
    status: 'Validação 100% Técnica',
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Troca automática a cada 5 segundos
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section
      id="hero"
      className="w-full pt-24 pb-12 md:pt-28 md:pb-16 lg:pt-32 lg:pb-20 bg-[#FEFAE0] text-[#002626] overflow-hidden"
    >
      {/* Container fluido que ocupa 100% da largura da tela sem ficar espremido */}
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-14 xl:px-20 2xl:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center">
          
          {/* ========================================================================= */}
          {/* LADO ESQUERDO: APRESENTAÇÃO E CHAMADA PARA AÇÃO (55% DO ESPAÇO)            */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-6 text-left">
            {/* Tag Institucional */}
            <div className="inline-flex items-center gap-2.5 bg-[#0E4749]/10 px-4 py-2 rounded-full border border-[#0E4749]/20">
              <span className="w-2.5 h-2.5 rounded-full bg-[#95C623] animate-pulse" />
              <span className="text-xs sm:text-sm font-bold text-[#0E4749]">
                Governo de Sofala • SDAE Nhamatanda &amp; UniZambeze
              </span>
            </div>

            {/* Título Principal de Grande Impacto */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-black text-[#002626] tracking-tight leading-[1.12]">
              Apoio à Decisão Agrícola para o Distrito de{' '}
              <span className="text-[#0E4749] underline decoration-[#95C623] decoration-4 underline-offset-8">
                Nhamatanda
              </span>
            </h1>

            {/* Subtítulo Detalhado */}
            <p className="text-base sm:text-lg text-[#0E4749]/90 max-w-2xl leading-relaxed">
              Plataforma distrital que conecta agricultores familiares e técnicos de extensão agrária
              do SDAE, combinando monitorização contínua da humidade do solo com recomendações técnicas
              para calibrar a rega e proteger as culturas em Sofala.
            </p>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-1">
              <Link href="/login" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto min-h-[50px] px-8 py-3.5 rounded-xl bg-[#002626] text-[#FEFAE0] hover:bg-[#0E4749] font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.99] group"
                >
                  <span>Aceder ao Sistema</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>

              <Link href="/registo" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto min-h-[50px] px-7 py-3.5 rounded-xl border-2 border-[#002626] text-[#002626] hover:bg-[#002626] hover:text-[#FEFAE0] font-bold text-sm sm:text-base flex items-center justify-center transition-all"
                >
                  Criar Conta
                </button>
              </Link>
            </div>

            {/* Badges de Confiança do Terreno */}
            <div className="pt-3 flex flex-wrap items-center gap-y-2.5 gap-x-6 text-xs text-[#0E4749]/80 font-medium border-t border-[#8EB69B]/30">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#0E4749] shrink-0" />
                <span>Postos de Tica e Lamego</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#0E4749] shrink-0" />
                <span>Compatível com Telemóveis</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0E4749] shrink-0" />
                <span>Validação Agronómica Oficial</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* LADO DIREITO: CARROSSEL DINÂMICO DE 3 FOTOS AGRÍCOLAS (45% DO ESPAÇO)     */}
          {/* ========================================================================= */}
          <div
            className="lg:col-span-6 xl:col-span-5 w-full relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Moldura da Imagem com Sombra e Bordas Arredondadas */}
            <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[520px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 group">
              
              {/* Slides de Imagens com Transição Suave */}
              {HERO_SLIDES.map((item, index) => (
                <div
                  key={item.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-1000 scale-100 group-hover:scale-105"
                    style={{ backgroundImage: `url('${item.image}')` }}
                  />
                  {/* Gradiente de Escurecimento na Base para Leitura Clara */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                </div>
              ))}

              {/* Tag Superior do Slide Atual */}
              <div className="absolute top-5 left-5 z-20">
                <div className="inline-flex items-center gap-2 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-semibold text-white">
                  <Sparkles className="w-3.5 h-3.5 text-[#95C623]" />
                  <span>{slide.tag}</span>
                </div>
              </div>

              {/* Cartão de Informação Sobreposto no Fundo da Imagem */}
              <div className="absolute bottom-0 inset-x-0 p-6 sm:p-7 z-20 text-white space-y-3">
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow">
                    {slide.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/80 line-clamp-2 drop-shadow-sm">
                    {slide.description}
                  </p>
                </div>

                {/* Badge de Destaque Técnico */}
                <div className="flex items-center justify-between pt-1">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl border border-white/30 text-xs font-bold text-white">
                    <Droplets className="w-3.5 h-3.5 text-[#95C623]" />
                    <span>{slide.highlight}:</span>
                    <span className="text-[#95C623]">{slide.status}</span>
                  </div>

                  {/* Controles do Carrossel */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="w-9 h-9 rounded-xl bg-black/50 hover:bg-black/80 border border-white/25 text-white flex items-center justify-center transition-all backdrop-blur-sm focus:outline-none"
                      aria-label="Imagem anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-9 h-9 rounded-xl bg-black/50 hover:bg-black/80 border border-white/25 text-white flex items-center justify-center transition-all backdrop-blur-sm focus:outline-none"
                      aria-label="Próxima imagem"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Barras de Progresso dos 3 Slides */}
                <div className="flex items-center gap-2 pt-2">
                  {HERO_SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none ${
                        idx === currentSlide ? 'w-8 bg-[#95C623]' : 'w-3 bg-white/40 hover:bg-white/70'
                      }`}
                      aria-label={`Ir para o slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
