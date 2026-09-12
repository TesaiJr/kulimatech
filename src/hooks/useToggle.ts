'use client';

import { useState, useCallback } from 'react';

/**
 * Hook para alternar estados booleanos (ex: abrir/fechar modais, menus)
 */
export function useToggle(initialState = false): [boolean, () => void, (value?: boolean) => void] {
  const [state, setState] = useState<boolean>(initialState);

  const toggle = useCallback(() => {
    setState((prev) => !prev);
  }, []);

  const set = useCallback((value?: boolean) => {
    setState(value !== undefined ? value : (prev) => !prev);
  }, []);

  return [state, toggle, set];
}
