// src/features/meteorologia/services/meteorologiaService.ts
import { api, ApiError } from '@/lib/api/client';
import { WeatherData } from '../types';

class MeteorologiaService {
  /**
   * Obtém os dados meteorológicos e previsão agroclimática de Nhamatanda
   */
  public async getMeteorologia(): Promise<WeatherData> {
    try {
      return await api.get<WeatherData>('/api/meteorologia');
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao carregar dados meteorológicos de Nhamatanda.', 'GET_METEOROLOGIA_ERROR');
    }
  }
}

export const meteorologiaService = new MeteorologiaService();
