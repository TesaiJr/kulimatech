// src/features/meteorologia/hooks/useMeteorologia.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { meteorologiaService } from '../services/meteorologiaService';
import { WeatherData } from '../types';

export function useMeteorologia() {
  const [clima, setClima] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClima = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await meteorologiaService.getMeteorologia();
      setClima(data);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar a previsão meteorológica de Nhamatanda.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClima();
  }, [fetchClima]);

  return {
    clima,
    loading,
    error,
    refresh: fetchClima,
  };
}
