/**
 * Utilitários gerais e funções de apoio (helpers)
 */

/**
 * Combina classes CSS condicionalmente (compatível com Tailwind CSS)
 */
export function cn(...inputs: (string | boolean | null | undefined | Record<string, boolean>)[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }

  return classes.join(' ').trim();
}

/**
 * Cria uma versão com debounce de uma função
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  waitMs = 300
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = function (this: any, ...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
      timeoutId = null;
    }, waitMs);
  };

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}

/**
 * Cria uma versão com throttle de uma função
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limitMs = 300
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limitMs);
    }
  };
}

/**
 * Copia um texto para a área de transferência do sistema
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined' || !text) return false;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback para navegadores legados ou contextos sem permissão
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    textArea.remove();
    return successful;
  } catch (err) {
    console.error('Falha ao copiar para o clipboard:', err);
    return false;
  }
}

/**
 * Pausa a execução de forma assíncrona por um período de tempo
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Força o download de um arquivo Blob ou texto
 */
export function downloadFile(content: Blob | string, filename: string, mimeType = 'text/plain'): void {
  if (typeof window === 'undefined') return;

  const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Clona profundamente um objeto ou array simples
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;

  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(obj);
    } catch {
      // fallback abaixo
    }
  }

  return JSON.parse(JSON.stringify(obj));
}

/**
 * Gera um ID único com prefixo opcional
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
}

/**
 * Garante que um valor fique dentro dos limites [min, max]
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
