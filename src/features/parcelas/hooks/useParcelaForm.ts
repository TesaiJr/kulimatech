// src/features/parcelas/hooks/useParcelaForm.ts
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ParcelaFormData, parcelaFormSchema } from '../schemas/parcelaSchemas';
import { parcelaService } from '../services/parcelaService';
import { TipoSolo, ParcelaListItem } from '../types';
import { ApiError } from '@/lib/api/client';

export interface UseParcelaFormOptions {
  initialData?: ParcelaListItem;
  agricultorId?: string;
  onSuccess?: () => void;
}

export function useParcelaForm({ initialData, agricultorId = 'usr-farm-01', onSuccess }: UseParcelaFormOptions = {}) {
  const router = useRouter();

  const [formData, setFormData] = useState<ParcelaFormData>({
    nome: initialData?.nome || '',
    areaHectares: initialData?.areaHectares || ('' as unknown as number),
    tipoSolo: (initialData?.tipoSolo || 'FRANCO') as TipoSolo,
    localizacao: initialData?.localizacao || '',
    latitude: initialData?.latitude ?? undefined,
    longitude: initialData?.longitude ?? undefined,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ParcelaFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // GPS Geolocation State
  const [isGettingGps, setIsGettingGps] = useState<boolean>(false);
  const [gpsSuccessMessage, setGpsSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (field: keyof ParcelaFormData, value: string | number | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpar erro do campo ao alterar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleGetLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setSubmitError('Geolocalização GPS não é suportada pelo seu navegador.');
      return;
    }

    setIsGettingGps(true);
    setGpsSuccessMessage(null);
    setSubmitError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));

        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          localizacao: prev.localizacao
            ? prev.localizacao
            : `GPS: ${lat}, ${lng} (Distrito de Nhamatanda)`,
        }));

        setIsGettingGps(false);
        setGpsSuccessMessage(`Coordenadas obtidas: Lat ${lat}, Lng ${lng}`);
      },
      (error) => {
        setIsGettingGps(false);
        let errorMsg = 'Não foi possível obter a localização GPS.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Permissão de localização negada pelo utilizador.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Sinal GPS indisponível no momento.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Tempo limite excedido ao procurar GPS.';
        }
        setSubmitError(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setIsSubmitting(true);
    setSubmitError(null);
    setErrors({});

    // Converter string de área para número se necessário
    const formattedData = {
      ...formData,
      areaHectares: Number(formData.areaHectares),
    };

    const validationResult = parcelaFormSchema.safeParse(formattedData);

    if (!validationResult.success) {
      const fieldErrors: Partial<Record<keyof ParcelaFormData, string>> = {};
      validationResult.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as keyof ParcelaFormData] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      if (initialData) {
        // Atualizar parcela existente
        await parcelaService.updateParcela(initialData.id, validationResult.data);
      } else {
        // Criar nova parcela associada ao agricultor autenticado
        await parcelaService.createParcela(validationResult.data);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/parcelas');
      }
    } catch (err) {
      console.error('Falha ao submeter formulario de parcela:', err);
      if (err instanceof ApiError) {
        setSubmitError(err.message);
      } else {
        setSubmitError('Ocorreu um erro ao guardar a parcela. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    submitError,
    isGettingGps,
    gpsSuccessMessage,
    handleInputChange,
    handleGetLocation,
    handleSubmit,
  };
}
