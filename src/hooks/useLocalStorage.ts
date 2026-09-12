'use client';

import { useState, useEffect, useCallback } from 'react';
import { localStore } from '@/utils/storage';

/**
 * Hook para sincronizar e persistir estado no localStorage com reatividade
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Inicialização preguiçosa (lazy)
  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = localStore.getItem<T>(key);
    return item !== null ? item : initialValue;
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const valueToStore = value instanceof Function ? value(prev) : value;
          localStore.setItem(key, valueToStore);
          return valueToStore;
        });
      } catch (error) {
        console.error(`Erro ao gravar chave "${key}" no localStorage:`, error);
      }
    },
    [key]
  );

  // Escuta alterações originadas em outras abas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch {
          setStoredValue(e.newValue as unknown as T);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}
