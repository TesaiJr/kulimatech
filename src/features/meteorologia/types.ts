// src/features/meteorologia/types.ts

export interface CurrentWeather {
  temperatura: number;
  sensacaoTermica: number;
  humidadeRelativa: number;
  precipitacao: number;
  velocidadeVento: number;
  condicao: string;
  codigoClima: number;
  icone: string;
}

export interface DailyForecast {
  data: string;
  tempMin: number;
  tempMax: number;
  probabilidadeChuva: number;
  condicao: string;
  icone: string;
}

export interface WeatherData {
  localizacao: string;
  coordenadas: {
    latitude: number;
    longitude: number;
  };
  atual: CurrentWeather;
  previsao3Dias: DailyForecast[];
  recomendacaoAgricola: string;
  isFallback?: boolean;
  isStale?: boolean;
  atualizadoEm: string;
}
