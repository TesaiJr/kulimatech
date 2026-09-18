'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const HERO_SLIDES = [
  {
    image: '/images/login-hero.jpg',
    alt: 'Técnica extensionista do SDAE em Nhamatanda',
  },
  {
    image: '/images/hero-2.jpg',
    alt: 'Agricultores familiares e maneio de culturas',
  },
  {
    image: '/images/hero-3.jpg',
    alt: 'Campos agrícolas e regadio em Sofala',
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  // Transição suave e um pouco demorada: 8 segundos ininterruptos
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 8000);

    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section
      id="hero"
      className="relative w-full min-h-[90vh] lg:min-h-[94vh] flex items-center overflow-hidden bg-black text-white selection:bg-[#95C623] selection:text-[#002626]"
    >
      {/* ========================================================================= */}
      {/* 1. FUNDO FOTOGRÁFICO FULL-BLEED (TRANSIÇÃO SUAVE DE 2.0S ENTRE 3 IMAGENS) */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 z-0">
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.image}
              className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-[2000ms] ease-in-out ${
                isActive ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0 pointer-events-none'
              }`}
              style={{
                backgroundImage: `url('${slide.image}')`,
                backgroundPosition: 'center 35%',
              }}
              aria-hidden={!isActive}
            />
          );
        })}

        {/* Gradiente Limpo de Contraste com z-20 para cobrir as fotos e dar legibilidade total ao texto */}
        <div className="absolute inset-0 z-20 bg-gradient-to-r from-black/85 via-black/55 to-black/20 pointer-events-none" />
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* ========================================================================= */}
      {/* 2. CONTEÚDO PRINCIPAL (BORDAS DE ~2% / ROUNDED-MD NOS BOTÕES)             */}
      {/* ========================================================================= */}
      <div className="relative z-30 w-full px-6 sm:px-10 lg:px-16 xl:px-20 2xl:px-28 py-32 lg:py-40">
        <div className="max-w-3xl space-y-6 sm:space-y-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-black text-white tracking-tight leading-[1.08] drop-shadow-2xl">
            Apoio à Decisão Agrícola para o Distrito de{' '}
            <span className="text-[#95C623] underline decoration-[#95C623]/60 underline-offset-8">
              Nhamatanda
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-[#FEFAE0]/90 leading-relaxed font-normal max-w-2xl drop-shadow-lg">
            Plataforma distrital que conecta agricultores familiares e técnicos de extensão agrária do
            SDAE, combinando monitorização contínua da humidade do solo com recomendações técnicas para
            calibrar a rega e proteger as culturas em Sofala.
          </p>

          <div className="pt-2 sm:pt-4">
            <Link href="/auth" className="inline-block">
              <button
                type="button"
                className="min-h-[50px] px-8 py-3 rounded-md bg-[#95C623] hover:bg-white text-[#002626] font-extrabold text-base flex items-center gap-3 transition-all duration-200 shadow-xl active:scale-[0.98] group"
              >
                <span>Aceder ao Sistema</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CONTROLOS DE NAVEGAÇÃO FLUTUANTES (BORDAS DE 2% / ROUNDED-MD)          */}
      {/* ========================================================================= */}
      <div className="absolute bottom-8 right-6 sm:bottom-12 sm:right-10 lg:bottom-14 lg:right-16 xl:right-24 z-30 flex items-center gap-3 bg-black/50 backdrop-blur-md px-3.5 py-2 rounded-md border border-white/20 shadow-xl">
        {/* Indicadores de barras */}
        <div className="flex items-center gap-1.5 pr-2.5 border-r border-white/20">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-sm transition-all duration-500 focus:outline-none ${
                idx === currentSlide ? 'w-6 bg-[#95C623]' : 'w-2 bg-white/40 hover:bg-white/75'
              }`}
              aria-label={`Ir para imagem ${idx + 1}`}
            />
          ))}
        </div>

        {/* Botões < e > com bordas de 2% */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={prevSlide}
            className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all focus:outline-none"
            aria-label="Imagem anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all focus:outline-none"
            aria-label="Próxima imagem"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
