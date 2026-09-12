/**
 * Utilitário seguro para LocalStorage e SessionStorage compatível com SSR (Next.js)
 */

function isClient(): boolean {
  return typeof window !== 'undefined';
}

class StorageWrapper {
  private type: 'localStorage' | 'sessionStorage';

  constructor(type: 'localStorage' | 'sessionStorage') {
    this.type = type;
  }

  private get storage(): Storage | null {
    if (!isClient()) return null;
    try {
      return window[this.type];
    } catch {
      return null;
    }
  }

  /**
   * Obtém um item do armazenamento com conversão automática de JSON
   */
  getItem<T>(key: string, defaultValue?: T): T | null {
    const store = this.storage;
    if (!store) return defaultValue ?? null;

    try {
      const item = store.getItem(key);
      if (item === null) return defaultValue ?? null;
      return JSON.parse(item) as T;
    } catch {
      // Se não for JSON válido, retorna como string caso T seja compatível
      const item = store.getItem(key);
      return (item as unknown as T) ?? defaultValue ?? null;
    }
  }

  /**
   * Salva um item com serialização JSON automática
   */
  setItem<T>(key: string, value: T): boolean {
    const store = this.storage;
    if (!store) return false;

    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      store.setItem(key, serialized);
      return true;
    } catch (error) {
      console.warn(`[${this.type}] Falha ao salvar item "${key}":`, error);
      return false;
    }
  }

  /**
   * Remove uma chave do armazenamento
   */
  removeItem(key: string): boolean {
    const store = this.storage;
    if (!store) return false;

    try {
      store.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Limpa todo o armazenamento selecionado
   */
  clear(): boolean {
    const store = this.storage;
    if (!store) return false;

    try {
      store.clear();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verifica se uma chave existe
   */
  has(key: string): boolean {
    const store = this.storage;
    if (!store) return false;
    return store.getItem(key) !== null;
  }
}

export const localStore = new StorageWrapper('localStorage');
export const sessionStore = new StorageWrapper('sessionStorage');
