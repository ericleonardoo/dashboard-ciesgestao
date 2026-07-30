import { describe, it, expect } from 'vitest';
import { partnershipSchema, normalizeCnpj } from '../lib/validation/partnership-schema';

describe('Partnership Schema (Convênios & B2B) — Validation and Normalization', () => {
  it('deve validar um convênio B2B com dados completos', () => {
    const validPartnership = {
      companyName: 'Empresa Parceira Ltda',
      cnpj: '12.345.678/0001-90',
      segment: 'Indústria',
      contactName: 'Carlos Silva',
      contactRole: 'Gerente de RH',
      contactPhone: '11988887777',
      ownerId: 'colab-123',
      status: 'PARTNERSHIP_ACTIVE' as const,
      deciderIdentified: true,
      visitsCompleted: 5,
      conversionStats: {
        leadsGenerated: 10,
        enrollmentsClosed: 2,
        totalRevenueCents: 500000
      },
    };

    const result = partnershipSchema.safeParse(validPartnership);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('PARTNERSHIP_ACTIVE');
      expect(result.data.deciderIdentified).toBe(true);
    }
  });

  it('deve exigir motivo da recusa ao marcar status NO_INTEREST', () => {
    const invalidNoInterest = {
      companyName: 'Empresa Sem Interesse',
      contactName: 'Marta Souza',
      contactPhone: '35988887777',
      ownerId: 'colab-123',
      status: 'NO_INTEREST' as const,
      noInterestReason: '', // Vazio deve falhar
    };

    const result = partnershipSchema.safeParse(invalidNoInterest);
    expect(result.success).toBe(false);
  });

  it('deve aceitar status NO_INTEREST com motivo devidamente preenchido', () => {
    const validNoInterest = {
      companyName: 'Empresa Sem Interesse',
      contactName: 'Marta Souza',
      contactPhone: '35988887777',
      ownerId: 'colab-123',
      status: 'NO_INTEREST' as const,
      noInterestReason: 'Empresa já possui política de reembolso integral com instituição parceira exclusiva',
    };

    const result = partnershipSchema.safeParse(validNoInterest);
    expect(result.success).toBe(true);
  });

  it('deve normalizar CNPJ apenas para digitos numericos', () => {
    expect(normalizeCnpj('12.345.678/0001-90')).toBe('12345678000190');
    expect(normalizeCnpj()).toBe('');
  });

  it('deve falhar se o telefone de contato for invalido', () => {
    const badPhone = {
      companyName: 'Empresa X',
      contactName: 'Marta',
      contactPhone: '12345',
      ownerId: 'colab-123',
    };

    const result = partnershipSchema.safeParse(badPhone);
    expect(result.success).toBe(false);
  });
});
