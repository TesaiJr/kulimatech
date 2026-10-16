// src/hooks/usePollingNotification.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api/client';
import { useAuth } from '@/features/auth/hooks/useAuth';

const POLLING_INTERVAL_MS = 30000; // 30 segundos (RNF04)

interface UnreadCountResponse {
  count: number;
}

export function usePollingNotification() {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchCount = useCallback(async () => {
    if (!isAuthenticated) return;

    // Pausar se a aba estiver oculta para poupar dados móveis e bateria
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      return;
    }

    try {
      const data = await api.get<UnreadCountResponse>('/api/alertas/unread-count');
      if (typeof data.count === 'number') {
        setUnreadCount(data.count);
      }
    } catch {
      // Falha silenciosa em conexões móveis transitórias
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    // Consulta inicial imediata
    fetchCount();

    // Configurar polling de 30 segundos
    timerRef.current = setInterval(fetchCount, POLLING_INTERVAL_MS);

    // Pausar/retomar ao alternar abas no navegador
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCount();
      }
    };

    const handleAlertsUpdated = () => {
      fetchCount();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('kulima:alerts-updated', handleAlertsUpdated);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('kulima:alerts-updated', handleAlertsUpdated);
    };
  }, [isAuthenticated, fetchCount]);

  return {
    unreadCount,
    setUnreadCount,
    refresh: fetchCount,
  };
}
