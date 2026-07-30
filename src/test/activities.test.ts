import { describe, it, expect } from 'vitest';
import { activitySchema } from '../lib/validation/activity-schema';

describe('Sales Activities Schema — Timeline and Rules', () => {
  it('deve validar uma atividade manual registrada por consultor', () => {
    const validActivity = {
      actorId: 'consultor-1',
      actorName: 'Eric Carvalho',
      type: 'PHONE_CALL' as const,
      entityType: 'LEAD' as const,
      entityId: 'lead-123',
      entityName: 'João da Silva',
      notes: 'Ligação realizada. Lead confirmou interesse em bolsas EAD para o próximo mês.',
      source: 'MANUAL' as const,
    };

    const result = activitySchema.safeParse(validActivity);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe('PHONE_CALL');
      expect(result.data.source).toBe('MANUAL');
    }
  });

  it('deve validar atividade automatica gerada por transicao de status', () => {
    const autoActivity = {
      actorId: 'system-user',
      actorName: 'Sistema CIES',
      type: 'ENROLLMENT' as const,
      entityType: 'LEAD' as const,
      entityId: 'lead-456',
      notes: 'Status alterado de NEGOTIATION para ENROLLED.',
      source: 'AUTO' as const,
    };

    const result = activitySchema.safeParse(autoActivity);
    expect(result.success).toBe(true);
  });

  it('deve falhar se observacao da atividade for omitida ou muito curta', () => {
    const invalidActivity = {
      actorId: 'consultor-1',
      type: 'VISIT' as const,
      entityType: 'COMPANY' as const,
      entityId: 'company-789',
      notes: '', // Vazio deve falhar
    };

    const result = activitySchema.safeParse(invalidActivity);
    expect(result.success).toBe(false);
  });
});
