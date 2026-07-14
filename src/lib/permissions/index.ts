import { getCurrentUserPermissions, UserPermissions } from '../firebase/auth-session';

if (typeof window !== 'undefined') {
  throw new Error('permissions utilities can only be imported in server-side modules.');
}

/**
 * Verifica se um perfil de usuário possui permissão para um módulo e ação específicos
 */
export function hasPermission(
  user: UserPermissions,
  module: string,
  action: string
): boolean {
  // Usuário inativo não possui nenhuma permissão
  if (user.status !== 'active') {
    return false;
  }

  // Área 'gestao' possui acesso irrestrito a todas as ações
  if (user.areas.includes('gestao')) {
    return true;
  }

  // Verifica na matriz granular de permissões do documento do usuário
  const modulePermissions = user.permissions[module];
  if (modulePermissions && modulePermissions.includes(action)) {
    return true;
  }

  // Regras de área padrão se as permissões explícitas não estiverem definidas
  if (module === 'enrollments') {
    if (action === 'read') {
      return user.areas.some(area => 
        ['relacionamento', 'administrativo', 'comercial', 'marketing'].includes(area)
      );
    }
    if (action === 'write_operational') {
      return user.areas.some(area => 
        ['relacionamento', 'administrativo'].includes(area)
      );
    }
  }

  if (module === 'imports') {
    if (action === 'read' || action === 'write') {
      return user.areas.includes('administrativo');
    }
  }

  return false;
}

/**
 * Helper de servidor que bloqueia a execução de Server Actions se o usuário não possuir a permissão devida
 */
export async function requirePermission(
  module: string,
  action: string
): Promise<UserPermissions> {
  const userPermissions = await getCurrentUserPermissions();

  if (!userPermissions) {
    throw new Error('UNAUTHORIZED: Usuário não autenticado.');
  }

  if (userPermissions.status !== 'active') {
    throw new Error('UNAUTHORIZED: A conta do colaborador está inativa.');
  }

  if (!hasPermission(userPermissions, module, action)) {
    throw new Error(`FORBIDDEN: Permissão insuficiente para o módulo '${module}' e ação '${action}'.`);
  }

  return userPermissions;
}
