/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateEnrollmentFields } from '../server/actions/enrollments';
import { requirePermission } from '../lib/permissions';
import { getAdminDb } from '../lib/firebase/admin';

// Mock das dependências
vi.mock('../lib/permissions', () => ({
  requirePermission: vi.fn(),
}));

vi.mock('../lib/firebase/admin', () => {
  const mockUpdate = vi.fn();
  const mockGet = vi.fn();
  const mockDoc = vi.fn(() => ({
    get: mockGet,
    update: mockUpdate,
  }));
  const mockCollection = vi.fn(() => ({
    doc: mockDoc,
  }));
  return {
    getAdminDb: vi.fn(() => ({
      collection: mockCollection,
    })),
    getAdminAuth: vi.fn(),
  };
});

// Mock do next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Enrollments Action — RBAC and Audit Logging', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve rejeitar alteracao de Vendedor se o usuario nao pertencer a area de Gestao', async () => {
    // Simula um usuário da área de Relacionamento
    vi.mocked(requirePermission).mockResolvedValue({
      uid: 'user-rel-123',
      name: 'Nayara',
      email: 'nayara@cies.com.br',
      status: 'active',
      areas: ['relacionamento'],
      permissions: {},
    });

    await expect(
      updateEnrollmentFields('enrollment-abc', { sellerName: 'Ninha' })
    ).rejects.toThrow('Apenas colaboradores da área de Gestão');
  });

  it('deve rejeitar alteracao de Valor se o usuario nao for Gestao nem Administrativo', async () => {
    // Simula um usuário do Comercial
    vi.mocked(requirePermission).mockResolvedValue({
      uid: 'user-com-123',
      name: 'Ninha',
      email: 'ninha@cies.com.br',
      status: 'active',
      areas: ['comercial'],
      permissions: {},
    });

    await expect(
      updateEnrollmentFields('enrollment-abc', { amountCents: 15000 })
    ).rejects.toThrow('Permissões insuficientes para alterar o valor financeiro');
  });

  it('deve autorizar alteracao de Vendedor para Gestao e gerar log de auditoria correto', async () => {
    // Simula usuário de Gestão
    vi.mocked(requirePermission).mockResolvedValue({
      uid: 'user-gestao-123',
      name: 'Elen',
      email: 'elen@cies.com.br',
      status: 'active',
      areas: ['gestao'],
      permissions: {},
    });

    // Simula documento existente no Firestore
    const mockDb = getAdminDb();
    const mockDocRef = mockDb.collection('enrollments').doc('enrollment-abc');
    
    vi.mocked(mockDocRef.get).mockResolvedValue({
      exists: true,
      data: () => ({
        sellerName: 'Bia',
        amountCents: 19990,
        auditLogs: [],
      }),
    } as any);

    await updateEnrollmentFields('enrollment-abc', { sellerName: 'Ninha' });

    // Verifica se o update foi chamado
    expect(mockDocRef.update).toHaveBeenCalled();
    
    const updatePayload = vi.mocked(mockDocRef.update).mock.calls[0][0] as any;
    expect(updatePayload.sellerName).toBe('Ninha');
    
    // Verifica log de auditoria
    expect(updatePayload.auditLogs.length).toBe(1);
    expect(updatePayload.auditLogs[0]).toMatchObject({
      field: 'sellerName',
      oldValue: 'Bia',
      newValue: 'Ninha',
      updatedBy: 'user-gestao-123',
      updatedByName: 'Elen',
    });
  });

  it('deve autorizar alteracao de Valor para Administrativo e registrar auditoria', async () => {
    // Simula usuário do Administrativo
    vi.mocked(requirePermission).mockResolvedValue({
      uid: 'user-admin-123',
      name: 'Bia',
      email: 'bia@cies.com.br',
      status: 'active',
      areas: ['administrativo'],
      permissions: {},
    });

    const mockDb = getAdminDb();
    const mockDocRef = mockDb.collection('enrollments').doc('enrollment-abc');
    
    vi.mocked(mockDocRef.get).mockResolvedValue({
      exists: true,
      data: () => ({
        sellerName: 'Bia',
        amountCents: 19990,
        auditLogs: [],
      }),
    } as any);

    await updateEnrollmentFields('enrollment-abc', { amountCents: 25000 });

    expect(mockDocRef.update).toHaveBeenCalled();
    const updatePayload = vi.mocked(mockDocRef.update).mock.calls[0][0] as any;
    expect(updatePayload.amountCents).toBe(25000);
    expect(updatePayload.auditLogs[0]).toMatchObject({
      field: 'amountCents',
      oldValue: 19990,
      newValue: 25000,
      updatedBy: 'user-admin-123',
      updatedByName: 'Bia',
    });
  });
});
