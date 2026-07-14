import { vi } from 'vitest';

// Mock dos módulos que usam o Firebase Admin e dependem de variáveis de ambiente
vi.mock('../lib/firebase/admin', () => ({
  adminAuth: {},
  adminDb: {},
}));
vi.mock('../lib/firebase/auth-session', () => ({
  getCurrentUserPermissions: vi.fn(),
}));

import { describe, it, expect, beforeEach } from 'vitest';
import { hasPermission } from '../lib/permissions';
import { UserPermissions } from '../lib/firebase/auth-session';

describe('Permissions & RBAC Authorization Logic', () => {
  let mockUser: UserPermissions;

  beforeEach(() => {
    mockUser = {
      uid: 'colab-1',
      name: 'Test Collaborator',
      email: 'test@ciesmg.com.br',
      status: 'active',
      areas: [],
      permissions: {},
    };
  });

  it('deve rejeitar qualquer permissao se o usuario estiver inativo', () => {
    mockUser.status = 'inactive';
    mockUser.areas = ['gestao']; // Mesmo sendo da gestão, se inativo, bloqueia
    
    expect(hasPermission(mockUser, 'enrollments', 'read')).toBe(false);
    expect(hasPermission(mockUser, 'imports', 'write')).toBe(false);
  });

  it('deve conceder acesso total se o usuario for da area gestao', () => {
    mockUser.areas = ['gestao'];
    
    expect(hasPermission(mockUser, 'enrollments', 'read')).toBe(true);
    expect(hasPermission(mockUser, 'enrollments', 'write_critical')).toBe(true);
    expect(hasPermission(mockUser, 'imports', 'write')).toBe(true);
    expect(hasPermission(mockUser, 'users', 'write')).toBe(true);
  });

  it('deve validar permissões granulares explicitas no mapa de permissions', () => {
    mockUser.areas = ['relacionamento'];
    mockUser.permissions = {
      enrollments: ['read', 'write_operational'],
      imports: ['read'],
    };

    expect(hasPermission(mockUser, 'enrollments', 'read')).toBe(true);
    expect(hasPermission(mockUser, 'enrollments', 'write_operational')).toBe(true);
    expect(hasPermission(mockUser, 'enrollments', 'write_critical')).toBe(false); // Não possui
    expect(hasPermission(mockUser, 'imports', 'read')).toBe(true);
    expect(hasPermission(mockUser, 'imports', 'write')).toBe(false); // Não possui
  });

  it('deve usar regras base de area se as permissões explicitas estiverem vazias', () => {
    mockUser.areas = ['relacionamento'];
    mockUser.permissions = {}; // Vazio

    // Regra base: Relacionamento tem permissão de ler e editar dados operacionais de matrícula
    expect(hasPermission(mockUser, 'enrollments', 'read')).toBe(true);
    expect(hasPermission(mockUser, 'enrollments', 'write_operational')).toBe(true);
    expect(hasPermission(mockUser, 'imports', 'read')).toBe(false); // Relacionamento não lê importações por padrão
  });

  it('deve conceder permissão de importação padrão para Administrativo', () => {
    mockUser.areas = ['administrativo'];
    mockUser.permissions = {};

    expect(hasPermission(mockUser, 'imports', 'read')).toBe(true);
    expect(hasPermission(mockUser, 'imports', 'write')).toBe(true);
  });
});
