import { describe, it, expect } from 'vitest';
import { isEnrollmentValid, isBvsPending } from '../lib/validation/enrollment-rules';

describe('Dashboard KPIs and Aggregation Business Rules', () => {

  describe('Regras de Matrícula Válida (isEnrollmentValid)', () => {
    it('deve retornar TRUE para uma matrícula padrão regular sem duplicidades', () => {
      const enrollment = {
        isDbDuplicate: false,
        isInternalDuplicate: false,
        bvsStatus: 'SIM' as const,
        releaseStatus: 'SIM' as const,
      };
      expect(isEnrollmentValid(enrollment)).toBe(true);
    });

    it('deve retornar FALSE se for duplicidade no banco de dados', () => {
      const enrollment = {
        isDbDuplicate: true,
        isInternalDuplicate: false,
      };
      expect(isEnrollmentValid(enrollment)).toBe(false);
    });

    it('deve retornar FALSE se for duplicidade interna no arquivo', () => {
      const enrollment = {
        isDbDuplicate: false,
        isInternalDuplicate: true,
      };
      expect(isEnrollmentValid(enrollment)).toBe(false);
    });
  });

  describe('Fila Automática de Boas-Vindas (isBvsPending)', () => {
    it('deve retornar TRUE se a matrícula SUBIU (releaseStatus=SIM) e BVS for NÃO', () => {
      const enrollment = {
        releaseStatus: 'SIM' as const,
        bvsStatus: 'NÃO' as const,
      };
      expect(isBvsPending(enrollment)).toBe(true);
    });

    it('deve retornar TRUE se a matrícula SUBIU (releaseStatus=SIM) e BVS for NÃO INFORMADO', () => {
      const enrollment = {
        releaseStatus: 'SIM' as const,
        bvsStatus: 'NÃO INFORMADO' as const,
      };
      expect(isBvsPending(enrollment)).toBe(true);
    });

    it('deve retornar FALSE se a matrícula SUBIU (releaseStatus=SIM) e BVS for SIM', () => {
      const enrollment = {
        releaseStatus: 'SIM' as const,
        bvsStatus: 'SIM' as const,
      };
      expect(isBvsPending(enrollment)).toBe(false);
    });

    it('deve retornar FALSE se a matrícula NÃO SUBIU (releaseStatus=NÃO) mesmo sem BVS', () => {
      const enrollment = {
        releaseStatus: 'NÃO' as const,
        bvsStatus: 'NÃO' as const,
      };
      expect(isBvsPending(enrollment)).toBe(false);
    });

    it('deve retornar FALSE se a matrícula NÃO SUBIU (releaseStatus=NÃO INFORMADO)', () => {
      const enrollment = {
        releaseStatus: 'NÃO INFORMADO' as const,
        bvsStatus: 'NÃO' as const,
      };
      expect(isBvsPending(enrollment)).toBe(false);
    });
  });
});
