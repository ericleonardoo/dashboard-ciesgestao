import { describe, it, expect } from 'vitest';
import { leadSchema, isFollowUpOverdue, normalizePhone, Lead } from '../lib/validation/lead-schema';

describe('B2C Leads Validation & Rules', () => {
  it('deve validar lead com dados obrigatorios completos', () => {
    const validData = {
      name: 'João da Silva',
      phone: '11999998888',
      city: 'Poços de Caldas',
      courseInterest: 'Administração',
      modality: 'EAD' as const,
      institutionInterest: 'UniFecaf' as const,
      source: 'WhatsApp',
      ownerId: 'consultor-1',
      status: 'NEW' as const,
    };

    const result = leadSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('João da Silva');
      expect(result.data.status).toBe('NEW');
    }
  });

  it('deve exigir motivo de perda quando status for LOST', () => {
    const invalidLostData = {
      name: 'Maria Oliveira',
      phone: '35988887777',
      courseInterest: 'Pedagogia',
      ownerId: 'consultor-1',
      status: 'LOST' as const,
      lossReason: '', // Vazio deve falhar
    };

    const result = leadSchema.safeParse(invalidLostData);
    expect(result.success).toBe(false);
  });

  it('deve aceitar status LOST com motivo de perda preenchido', () => {
    const validLostData = {
      name: 'Maria Oliveira',
      phone: '35988887777',
      courseInterest: 'Pedagogia',
      ownerId: 'consultor-1',
      status: 'LOST' as const,
      lossReason: 'Optou por concorrente com curso presencial',
    };

    const result = leadSchema.safeParse(validLostData);
    expect(result.success).toBe(true);
  });

  it('deve identificar follow-up vencido corretamente', () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const overdueLead = {
      id: 'lead-1',
      name: 'Carlos Santos',
      phone: '11977776666',
      courseInterest: 'Direito',
      ownerId: 'consultor-1',
      status: 'FOLLOW_UP' as const,
      nextContactAt: pastDate,
    } as Lead;

    const upcomingLead = {
      id: 'lead-2',
      name: 'Ana Souza',
      phone: '11966665555',
      courseInterest: 'Enfermagem',
      ownerId: 'consultor-1',
      status: 'FOLLOW_UP' as const,
      nextContactAt: futureDate,
    } as Lead;

    const enrolledLead = {
      id: 'lead-3',
      name: 'Pedro Lima',
      phone: '11955554444',
      courseInterest: 'Psicologia',
      ownerId: 'consultor-1',
      status: 'ENROLLED' as const,
      nextContactAt: pastDate, // Mesmo com data passada, se já está matriculado não conta como vencido
    } as Lead;

    expect(isFollowUpOverdue(overdueLead)).toBe(true);
    expect(isFollowUpOverdue(upcomingLead)).toBe(false);
    expect(isFollowUpOverdue(enrolledLead)).toBe(false);
  });

  it('deve normalizar numeros de telefone apenas para digitos', () => {
    expect(normalizePhone('(35) 99999-8888')).toBe('35999998888');
    expect(normalizePhone('+55 (11) 9.8765-4321')).toBe('5511987654321');
  });
});
