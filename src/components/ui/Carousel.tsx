'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CarouselProps {
  children: React.ReactNode[];
  mobileOnly?: boolean; // Se true, no desktop vira grid normal e só é carrossel no mobile
  desktopColumns?: 2 | 3 | 4;
  showArrows?: boolean;
  showDots?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
  itemClassName?: string;
}

export function Carousel({
  children,
  mobileOnly = false,
  desktopColumns = 4,
  showArrows = true,
  showDots = true,
  autoPlay = false,
  autoPlayInterval = 5000,
  className = '',
  itemClassName = '',
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const totalItems = React.Children.count(children);

  const scrollToIndex = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.children;
    if (items[index]) {
      const targetItem = items[index] as HTMLElement;
      container.scrollTo({
        left: targetItem.offsetLeft - container.offsetLeft,
        behavior: 'smooth',
      });
      setCurrentIndex(index);
    }
  }, []);

  const handleNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % totalItems;
    scrollToIndex(nextIndex);
  }, [currentIndex, totalItems, scrollToIndex]);

  const handlePrev = useCallback(() => {
    const prevIndex = (currentIndex - 1 + totalItems) % totalItems;
    scrollToIndex(prevIndex);
  }, [currentIndex, totalItems, scrollToIndex]);

  // Sincroniza index com scroll manual / touch no mobile
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const itemWidth = container.offsetWidth;
    const newIndex = Math.round(scrollLeft / (itemWidth || 1));
    if (newIndex >= 0 && newIndex < totalItems && newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(handleNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, handleNext]);

  // Classes de grid no desktop quando mobileOnly é true
  const desktopGridCols = {
    2: 'md:grid md:grid-cols-2 md:gap-6',
    3: 'md:grid md:grid-cols-3 md:gap-6',
    4: 'md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-5',
  }[desktopColumns];

  if (mobileOnly) {
    return (
      <div className={`relative w-full ${className}`}>
        {/* Carrossel no Mobile / Grid no Desktop */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className={`flex md:block overflow-x-auto md:overflow-visible snap-x snap-mandatory scrollbar-none pb-4 md:pb-0 gap-4 md:gap-0 ${desktopGridCols}`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {React.Children.map(children, (child, idx) => (
            <div
              key={idx}
              className={`w-[85vw] sm:w-[70vw] md:w-auto flex-shrink-0 md:flex-shrink snap-center ${itemClassName}`}
            >
              {child}
            </div>
          ))}
        </div>

        {/* Indicadores de bolinhas (Dots) visíveis apenas no Mobile */}
        {showDots && totalItems > 1 && (
          <div className="flex md:hidden items-center justify-center gap-1.5 pt-2">
            {Array.from({ length: totalItems }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToIndex(idx)}
                aria-label={`Ir para o slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-200 ${
                  currentIndex === idx
                    ? 'w-6 bg-primary'
                    : 'w-2 bg-secondary/20 hover:bg-secondary/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      {/* Container de Slides */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {React.Children.map(children, (child, idx) => (
          <div
            key={idx}
            className={`w-full flex-shrink-0 snap-center ${itemClassName}`}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Setas de Navegação */}
      {showArrows && totalItems > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Item anterior"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-primary hover:bg-white shadow-md flex items-center justify-center transition-colors border border-secondary/15 z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Próximo item"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-primary hover:bg-white shadow-md flex items-center justify-center transition-colors border border-secondary/15 z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Indicadores de bolinhas (Dots) */}
      {showDots && totalItems > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-3">
          {Array.from({ length: totalItems }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToIndex(idx)}
              aria-label={`Ir para o slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-200 ${
                currentIndex === idx
                  ? 'w-6 bg-primary'
                  : 'w-2 bg-secondary/20 hover:bg-secondary/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
