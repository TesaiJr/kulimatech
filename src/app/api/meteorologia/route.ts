// src/app/api/meteorologia/route.ts
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/rbac/guard';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/errors';

export const revalidate = 1800; // 30 minutos de cache em nível de servidor

// Cache em memória para resiliência e suporte offline/instabilidade
interface CachedWeather {
  timestamp: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

let memoryCache: CachedWeather | null = null;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos

// Mapeamento de WMO Weather interpretation codes (WW)
function mapWmoCode(code: number): { condicao: string; icone: string } {
  switch (code) {
    case 0:
      return { condicao: 'Céu Limpo', icone: 'sun' };
    case 1:
      return { condicao: 'Predominantemente Ensolarado', icone: 'sun' };
    case 2:
      return { condicao: 'Parcialmente Nublado', icone: 'cloud-sun' };
    case 3:
      return { condicao: 'Nublado', icone: 'cloud' };
    case 45:
    case 48:
      return { condicao: 'Nevoeiro / Neblina', icone: 'cloud-fog' };
    case 51:
    case 53:
    case 55:
      return { condicao: 'Chuvisco Fraco', icone: 'cloud-drizzle' };
    case 61:
      return { condicao: 'Chuva Fraca', icone: 'cloud-rain' };
    case 63:
      return { condicao: 'Chuva Moderada', icone: 'cloud-rain' };
    case 65:
      return { condicao: 'Chuva Forte', icone: 'cloud-rain' };
    case 80:
    case 81:
    case 82:
      return { condicao: 'Aguaceiros Dispersos', icone: 'cloud-rain' };
    case 95:
    case 96:
    case 99:
      return { condicao: 'Trovoada com Precipitação', icone: 'cloud-lightning' };
    default:
      return { condicao: 'Tempo Variável', icone: 'cloud-sun' };
  }
}

// Gerador de recomendação agroclimática para Nhamatanda
function generateAgroAdvisory(
  temp: number,
  humidity: number,
  probChuvaMax: number,
  windSpeed: number
): string {
  if (probChuvaMax >= 60) {
    return 'Alerta de precipitação iminente para as próximas 48h. Evite aplicação de defensivos foliares ou adubação de cobertura sujeita a lixiviação. Assegure valas de drenagem nos talhões baixos.';
  }
  if (humidity < 40 && temp >= 30) {
    return 'Tempo seco e temperaturas elevadas em Nhamatanda. Reforce a irrigação nas primeiras horas da manhã e aplique mulching (cobertura morta) para conservar a humidade do solo.';
  }
  if (windSpeed > 25) {
    return 'Ventos moderados a fortes na região. Suspenda pulverizações fitossanitárias para evitar deriva do produto.';
  }
  if (probChuvaMax <= 20 && humidity >= 50) {
    return 'Condições agroclimáticas excelentes para sementeira, sachas e maneio cultural nos talhões. Humidade relativa e temperatura favoráveis ao desenvolvimento vegetativo.';
  }
  return 'Condições agroclimáticas estáveis para o distrito de Nhamatanda. Mantenha a monitoria regular dos sensores de humidade do solo.';
}

// Fallback climático sazonal de Nhamatanda (caso Open-Meteo esteja inacessível)
function getFallbackData(lat: number, lon: number) {
  const hoje = new Date();
  const formatarData = (dias: number) => {
    const d = new Date(hoje);
    d.setDate(d.getDate() + dias);
    return d.toISOString().split('T')[0];
  };

  return {
    localizacao: 'Distrito de Nhamatanda, Sofala',
    coordenadas: { latitude: lat, longitude: lon },
    atual: {
      temperatura: 28.5,
      sensacaoTermica: 30.2,
      humidadeRelativa: 64,
      precipitacao: 0.0,
      velocidadeVento: 11.2,
      condicao: 'Parcialmente Nublado',
      codigoClima: 2,
      icone: 'cloud-sun',
    },
    previsao3Dias: [
      {
        data: formatarData(1),
        tempMin: 21.0,
        tempMax: 31.5,
        probabilidadeChuva: 15,
        condicao: 'Predominantemente Ensolarado',
        icone: 'sun',
      },
      {
        data: formatarData(2),
        tempMin: 22.0,
        tempMax: 32.0,
        probabilidadeChuva: 25,
        condicao: 'Parcialmente Nublado',
        icone: 'cloud-sun',
      },
      {
        data: formatarData(3),
        tempMin: 20.5,
        tempMax: 29.5,
        probabilidadeChuva: 35,
        condicao: 'Aguaceiros Dispersos',
        icone: 'cloud-rain',
      },
    ],
    recomendacaoAgricola:
      'Condições agroclimáticas estimadas favoráveis para o distrito de Nhamatanda. Mantenha a monitoria das leituras de campo.',
    isFallback: true,
    atualizadoEm: new Date().toISOString(),
  };
}

export async function GET(req: NextRequest) {
  try {
    requireAuth(req);

    const lat = parseFloat(process.env.NEXT_PUBLIC_NHAMATANDA_LAT || '-19.2667');
    const lon = parseFloat(process.env.NEXT_PUBLIC_NHAMATANDA_LON || '34.2167');
    const timezone = process.env.NEXT_PUBLIC_NHAMATANDA_TIMEZONE || 'Africa/Maputo';
    const baseUrl = process.env.OPEN_METEO_API_URL || 'https://api.open-meteo.com/v1/forecast';

    // 1. Verificar cache em memória
    const now = Date.now();
    if (memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
      return createSuccessResponse(memoryCache.data, 200);
    }

    // 2. Chamar a API pública Open-Meteo
    const url = new URL(baseUrl);
    url.searchParams.set('latitude', lat.toString());
    url.searchParams.set('longitude', lon.toString());
    url.searchParams.set(
      'current',
      'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m'
    );
    url.searchParams.set(
      'daily',
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max'
    );
    url.searchParams.set('timezone', timezone);
    url.searchParams.set('forecast_days', '4');

    try {
      const response = await fetch(url.toString(), {
        next: { revalidate: 1800 },
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Open-Meteo retornou código HTTP ${response.status}`);
      }

      const raw = await response.json();
      const current = raw.current || {};
      const daily = raw.daily || {};

      const currentMapped = mapWmoCode(current.weather_code ?? 0);
      const tempAtual = current.temperature_2m ?? 28;
      const humAtual = current.relative_humidity_2m ?? 65;
      const windAtual = current.wind_speed_10m ?? 10;

      // Montar previsão dos próximos 3 dias (exclui o dia 0 que é o dia atual)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const previsao3Dias: any[] = [];
      const datas = daily.time || [];
      const codes = daily.weather_code || [];
      const maxs = daily.temperature_2m_max || [];
      const mins = daily.temperature_2m_min || [];
      const probs = daily.precipitation_probability_max || [];

      for (let i = 1; i < Math.min(datas.length, 4); i++) {
        const diaMapped = mapWmoCode(codes[i] ?? 0);
        previsao3Dias.push({
          data: datas[i],
          tempMin: mins[i] ?? 20,
          tempMax: maxs[i] ?? 30,
          probabilidadeChuva: probs[i] ?? 10,
          condicao: diaMapped.condicao,
          icone: diaMapped.icone,
        });
      }

      const probChuvaMaxProxima = previsao3Dias[0]?.probabilidadeChuva ?? 10;
      const recomendacao = generateAgroAdvisory(tempAtual, humAtual, probChuvaMaxProxima, windAtual);

      const dadosFormatados = {
        localizacao: 'Distrito de Nhamatanda, Sofala',
        coordenadas: { latitude: lat, longitude: lon },
        atual: {
          temperatura: tempAtual,
          sensacaoTermica: current.apparent_temperature ?? tempAtual,
          humidadeRelativa: humAtual,
          precipitacao: current.precipitation ?? 0,
          velocidadeVento: windAtual,
          condicao: currentMapped.condicao,
          codigoClima: current.weather_code ?? 0,
          icone: currentMapped.icone,
        },
        previsao3Dias,
        recomendacaoAgricola: recomendacao,
        isFallback: false,
        atualizadoEm: new Date().toISOString(),
      };

      // Guardar em cache
      memoryCache = {
        timestamp: now,
        data: dadosFormatados,
      };

      return createSuccessResponse(dadosFormatados, 200);
    } catch (externalErr) {
      console.warn('[Meteorologia] Falha ao consultar Open-Meteo, utilizando fallback/cache:', externalErr);

      if (memoryCache) {
        return createSuccessResponse(
          { ...memoryCache.data, isStale: true },
          200
        );
      }

      const fallback = getFallbackData(lat, lon);
      return createSuccessResponse(fallback, 200);
    }
  } catch (error) {
    return handleApiError(error);
  }
}
