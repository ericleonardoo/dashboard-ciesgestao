import { describe, it, expect } from 'vitest';
import { partnershipSchema } from '../lib/validation/partnership-schema';

describe('Partnership Schema (Convênios) — Validation and Normalization', () => {
  it('deve validar um convênio válido com sucesso', () => {
    const validPartnership = {
      companyName: 'Empresa Parceira Ltda',
      contactName: 'Carlos Silva',
      contactPhone: '11988887777',
      ciesResponsibleId: 'colab-123',
      status: 'em_negociacao',
      visitsCompleted: 5,
      conversionStats: {
        leadsGenerated: 10,
        enrollmentsClosed: 2,
      },
    };

    const result = partnershipSchema.safeParse(validPartnership);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('em_negociacao');
      expect(result.data.visitsCompleted).toBe(5);
    }
  });

  it('deve sanitizar tags HTML nos campos de texto (companyName e contactName)', () => {
    const dirtyPartnership = {
      companyName: '<strong>Parceiro Premium</strong>',
      contactName: '<script>alert("hack")</script> Maria Souza',
      contactPhone: '11988887777',
      ciesResponsibleId: 'colab-123',
    };

    const result = partnershipSchema.safeParse(dirtyPartnership);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyName).toBe('Parceiro Premium');
      expect(result.data.contactName).toBe('alert("hack") Maria Souza');
    }
  });

  it('deve falhar se faltarem campos obrigatórios', () => {
    const incomplete = {
      companyName: '',
      contactName: 'Carlos',
      contactPhone: '11988887777',
    };

    const result = partnershipSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it('deve falhar se o telefone de contato for inválido', () => {
    const badPhone = {
      companyName: 'Empresa X',
      contactName: 'Marta',
      contactPhone: '12345', // telefone com menos de 10 dígitos
      ciesResponsibleId: 'colab-123',
    };

    const result = partnershipSchema.safeParse(badPhone);
    expect(result.success).toBe(false);
  });
});
