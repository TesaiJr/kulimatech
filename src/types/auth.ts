/**
 * Tipos e interfaces de Autenticação e Perfis de Acesso (RBAC)
 * Especificação F1 - Sistema KulimaTech (Moçambique)
 */

export type UserRole = 'ADMIN' | 'TECNICO_SDAE' | 'AGRICULTOR';

export type AppResource =
  | 'users'              // Gestão de contas e atribuições de utilizadores
  | 'catalogs'           // Catálogos de referência (Culturas e Pragas)
  | 'parcels'            // Parcelas agrícolas
  | 'moisture_readings'  // Leituras de humidade do solo
  | 'recommendations'    // Recomendações agronómicas de rega/cultura
  | 'pest_reports'       // Ocorrências e reportes de pragas
  | 'messages';          // Comunicação entre agricultor e técnico

export type AppAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'validate'
  | 'respond';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  province?: string;
  district?: string;
  assignedTechnicianId?: string; // Aplicável a Agricultor
  assignedFarmerIds?: string[];  // Aplicável a Técnico SDAE
}

export interface UserRoleInfo {
  role: UserRole;
  label: string;
  description: string;
  badgeVariant: 'primary' | 'secondary' | 'accent';
}

export const USER_ROLES_INFO: Record<UserRole, UserRoleInfo> = {
  ADMIN: {
    role: 'ADMIN',
    label: 'Administrador',
    description: 'Gestão de contas de utilizadores e catálogos mestres do sistema (culturas e pragas).',
    badgeVariant: 'primary',
  },
  TECNICO_SDAE: {
    role: 'TECNICO_SDAE',
    label: 'Técnico SDAE',
    description: 'Acompanhamento dos agricultores associados, validação de leituras, recomendações e ocorrências.',
    badgeVariant: 'secondary',
  },
  AGRICULTOR: {
    role: 'AGRICULTOR',
    label: 'Agricultor',
    description: 'Registo e gestão de parcelas, leituras de humidade, comunicação técnica e reporte de pragas.',
    badgeVariant: 'accent',
  },
};
