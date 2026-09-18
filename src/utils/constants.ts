/**
 * Constantes globais do sistema KulimaTech adaptadas ao contexto de Moçambique
 */

export const APP_CONFIG = {
  NAME: 'KulimaTech',
  DESCRIPTION: 'Sistema Integrado de Gestão KulimaTech - Moçambique',
  VERSION: '1.0.0',
  COUNTRY: 'Moçambique',
  COUNTRY_CODE: 'MZ',
  DIALING_CODE: '+258',
  CURRENCY_CODE: 'MZN',
  CURRENCY_SYMBOL: 'MT',
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  API_TIMEOUT_MS: 15000,
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@kulimatech:auth_token',
  REFRESH_TOKEN: '@kulimatech:refresh_token',
  USER_DATA: '@kulimatech:user_data',
  THEME: '@kulimatech:theme_mode',
  SIDEBAR_COLLAPSED: '@kulimatech:sidebar_collapsed',
  PREFERENCES: '@kulimatech:preferences',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Províncias da República de Moçambique
 */
export const MOZAMBIQUE_PROVINCES = [
  { value: 'maputo_cidade', label: 'Maputo Cidade', code: 'MC' },
  { value: 'maputo_provincia', label: 'Maputo Província', code: 'MP' },
  { value: 'gaza', label: 'Gaza', code: 'GZ' },
  { value: 'inhambane', label: 'Inhambane', code: 'IN' },
  { value: 'sofala', label: 'Sofala', code: 'SO' },
  { value: 'manica', label: 'Manica', code: 'MA' },
  { value: 'tete', label: 'Tete', code: 'TE' },
  { value: 'zambezia', label: 'Zambézia', code: 'ZA' },
  { value: 'nampula', label: 'Nampula', code: 'NA' },
  { value: 'cabo_delgado', label: 'Cabo Delgado', code: 'CD' },
  { value: 'niassa', label: 'Niassa', code: 'NI' },
] as const;

/**
 * Operadoras de Telecomunicações em Moçambique
 */
export const MOZAMBIQUE_OPERATORS = [
  {
    name: 'Vodacom Moçambique',
    code: 'vodacom',
    prefixes: ['84', '85'],
    color: '#E60000',
  },
  {
    name: 'Tmcel (Moçambique Telecom)',
    code: 'tmcel',
    prefixes: ['82', '83'],
    color: '#FFCC00',
  },
  {
    name: 'Movitel',
    code: 'movitel',
    prefixes: ['86', '87'],
    color: '#F37021',
  },
] as const;
