/**
 * Regras e Matriz de Permissões (RBAC) do Sistema KulimaTech
 * Especificação F1 - Segregação estrita de perfis
 */

import { AppAction, AppResource, AuthUser, UserRole } from '@/types/auth';

/**
 * Matriz estática de permissões por perfil (Ação:Recurso)
 */
export const ROLE_CAPABILITIES: Record<UserRole, Record<AppResource, AppAction[]>> = {
  ADMIN: {
    users: ['create', 'read', 'update', 'delete'],
    catalogs: ['create', 'read', 'update', 'delete'],
    // Isolamento estrito: Admin não intervém em dados operacionais
    parcels: [],
    moisture_readings: [],
    recommendations: [],
    pest_reports: [],
    messages: [],
  },
  TECNICO_SDAE: {
    users: [],
    catalogs: ['read'],
    parcels: ['read'],
    moisture_readings: ['read', 'validate'],
    recommendations: ['create', 'read', 'update'],
    pest_reports: ['read', 'respond'],
    messages: ['create', 'read'],
  },
  AGRICULTOR: {
    users: [],
    catalogs: ['read'],
    parcels: ['create', 'read', 'update', 'delete'],
    moisture_readings: ['create', 'read'],
    recommendations: ['read'],
    pest_reports: ['create', 'read'],
    messages: ['create', 'read'],
  },
};

/**
 * Verifica se um utilizador tem permissão para executar determinada ação sobre um recurso.
 * Valida o perfil geral e o escopo de titularidade/associação (ownership / assignment).
 *
 * @param user Utilizador autenticado
 * @param action Ação requerida (ex: 'create', 'read', 'validate')
 * @param resource Recurso alvo (ex: 'parcels', 'catalogs')
 * @param resourceOwnerId ID do agricultor titular do dado (opcional, para validação de escopo)
 */
export function can(
  user: AuthUser | null | undefined,
  action: AppAction,
  resource: AppResource,
  resourceOwnerId?: string
): boolean {
  if (!user) return false;

  const allowedActions = ROLE_CAPABILITIES[user.role]?.[resource] || [];
  const hasBaseCapability = allowedActions.includes(action);

  if (!hasBaseCapability) {
    return false;
  }

  // Se não foi especificado proprietário do recurso, validação base é suficiente (ex: listagem global permitida)
  if (!resourceOwnerId) {
    return true;
  }

  // Verificação de escopo operacional para Agricultor (somente os seus próprios dados)
  if (user.role === 'AGRICULTOR') {
    return resourceOwnerId === user.id;
  }

  // Verificação de escopo operacional para Técnico SDAE (somente agricultores associados a si)
  if (user.role === 'TECNICO_SDAE') {
    if (!user.assignedFarmerIds || user.assignedFarmerIds.length === 0) {
      return false;
    }
    return user.assignedFarmerIds.includes(resourceOwnerId);
  }

  return true;
}

/**
 * Utilitário para verificar se o utilizador possui um dos perfis informados
 */
export function isRole(user: AuthUser | null | undefined, ...roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}
