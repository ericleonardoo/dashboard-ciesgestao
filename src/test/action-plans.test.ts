import { describe, it, expect } from 'vitest';
import { actionPlanSchema } from '../lib/validation/action-plan-schema';

describe('Action Plan Schema (5W2H) — Validation and Normalization', () => {
  it('deve validar um plano de ação 5W2H válido com sucesso', () => {
    const validPlan = {
      what: 'Treinamento de captação de consultores',
      why: 'Aumentar a conversão comercial',
      where: 'Sede CIES ou Zoom',
      when: '25/08/2026',
      who: 'Nayara Silva',
      how: 'Realizar workshop com simulações de roteiro',
      howMuchCents: 'R$ 150,00',
      status: 'pendente',
      kpiAssociated: 'Taxa de conversão comercial',
    };

    const result = actionPlanSchema.safeParse(validPlan);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('pendente');
      expect(result.data.howMuchCents).toBe(15000); // 150 BRL -> 15000 cents
    }
  });

  it('deve sanitizar tags HTML nos campos de texto', () => {
    const dirtyPlan = {
      what: '<strong>Treinamento</strong>',
      why: 'Melhorar captação',
      where: 'Polo CIES',
      when: '25/08/2026',
      who: 'Nayara',
      how: '<script>alert("run")</script> Reunião presencial',
    };

    const result = actionPlanSchema.safeParse(dirtyPlan);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.what).toBe('Treinamento');
      expect(result.data.how).toBe('alert("run") Reunião presencial');
    }
  });

  it('deve falhar se faltarem campos obrigatórios', () => {
    const incomplete = {
      what: 'Treinamento',
      who: 'Nayara',
    };

    const result = actionPlanSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it('deve adotar valor R$ 0,00 (0 cents) por padrão se howMuch for omitido', () => {
    const noBudgetPlan = {
      what: 'Alinhamento geral',
      why: 'Ajustar metas operacionais',
      where: 'Zoom',
      when: '30/08/2026',
      who: 'Elen Sena',
      how: 'Reunião de alinhamento quinzenal',
    };

    const result = actionPlanSchema.safeParse(noBudgetPlan);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.howMuchCents).toBe(0);
    }
  });
});
