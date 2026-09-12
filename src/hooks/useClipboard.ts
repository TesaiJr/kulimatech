'use client';

import { useState, useCallback } from 'react';
import { copyToClipboard } from '@/utils/helpers';

/**
 * Hook para copiar valores para a área de transferência com estado visual temporário
 */
export function useClipboard(timeoutMs = 2000) {
  const [copied, setCopied] = useState<boolean>(false);

  const copy = useCallback(
    async (text: string) => {
      const success = await copyToClipboard(text);
      if (success) {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, timeoutMs);
      }
      return success;
    },
    [timeoutMs]
  );

  return { copied, copy };
}
