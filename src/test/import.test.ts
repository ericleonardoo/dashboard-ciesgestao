import { describe, it, expect } from 'vitest';
import { 
  parseCurrencyToCents, 
  normalizeInstitution, 
  normalizeTriState,
  enrollmentRowSchema,
  normalizeReferenceMonth
} from '../lib/validation/enrollment-schema';
import { generateHmacSignature } from '../server/services/duplicate-detector';

describe('Import Engine — Validation and Normalization', () => {
  
  describe('Moeda para Centavos (parseCurrencyToCents)', () => {
    it('deve converter valor bruto em BRL (R$ 199,90) para centavos inteiros', () => {
      expect(parseCurrencyToCents('R$ 199,90')).toBe(19990);
    });

    it('deve converter string simples (199,9) para centavos inteiros', () => {
      expect(parseCurrencyToCents('199,9')).toBe(19990);
    });

    it('deve tolerar ponto como separador de milhar e vírgula decimal (1.099,50)', () => {
      expect(parseCurrencyToCents('1.099,50')).toBe(109950);
    });

    it('deve converter number direto para centavos', () => {
      expect(parseCurrencyToCents(199.9)).toBe(19990);
    });

    it('deve explodir se for um formato invalido', () => {
      expect(() => parseCurrencyToCents('texto-invalido')).toThrow();
    });
  });

  describe('Normalizador de Instituição (normalizeInstitution)', () => {
    it('deve normalizar strings variadas da UniFecaf', () => {
      expect(normalizeInstitution('fecaf')).toBe('UniFecaf');
      expect(normalizeInstitution('UNIFECAF  ')).toBe('UniFecaf');
    });

    it('deve normalizar strings da UniFacvest', () => {
      expect(normalizeInstitution('facvest')).toBe('UniFacvest');
      expect(normalizeInstitution('UniFacvest')).toBe('UniFacvest');
    });

    it('deve normalizar strings da Faculdade São Luiz', () => {
      expect(normalizeInstitution('sao luiz')).toBe('FSL');
      expect(normalizeInstitution('fsl')).toBe('FSL');
    });

    it('deve retornar o valor limpo se nao reconhecido', () => {
      expect(normalizeInstitution('Outra Facul')).toBe('Outra Facul');
    });
  });

  describe('Normalizador Tri-state (normalizeTriState)', () => {
    it('deve normalizar variantes de SIM', () => {
      expect(normalizeTriState('SIM')).toBe('SIM');
      expect(normalizeTriState('s')).toBe('SIM');
      expect(normalizeTriState('yes')).toBe('SIM');
    });

    it('deve normalizar variantes de NÃO', () => {
      expect(normalizeTriState('NÃO')).toBe('NÃO');
      expect(normalizeTriState('nao')).toBe('NÃO');
      expect(normalizeTriState('no')).toBe('NÃO');
    });

    it('deve retornar NÃO INFORMADO para vazios', () => {
      expect(normalizeTriState(null)).toBe('NÃO INFORMADO');
      expect(normalizeTriState('')).toBe('NÃO INFORMADO');
      expect(normalizeTriState(undefined)).toBe('NÃO INFORMADO');
    });
  });

  describe('Validador e Normalizador Zod de Linha de Matrícula (enrollmentRowSchema)', () => {
    it('deve validar e normalizar uma linha bruta de matrícula perfeitamente', () => {
      const rawRow = {
        studentName: '  Diego Alcantara ',
        amountCents: 'R$ 150,00',
        type: 'Graduação',
        institution: 'fecaf',
        sellerName: 'Bia',
        bvsStatus: 'sim',
        cpf: ' 123.456.789-00 ',
        phone: '(11) 98765-4321',
        redirectUrl: 'http://wa.me/xyz',
        releaseStatus: 'nao',
        courseName: 'Análise e Desenvolvimento de Sistemas',
        paymentMethod: 'pix',
      };

      const result = enrollmentRowSchema.safeParse(rawRow);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.studentName).toBe('Diego Alcantara');
        expect(result.data.amountCents).toBe(15000);
        expect(result.data.institution).toBe('UniFecaf');
        expect(result.data.cpf).toBe('12345678900');
        expect(result.data.phone).toBe('11987654321');
        expect(result.data.bvsStatus).toBe('SIM');
        expect(result.data.releaseStatus).toBe('NÃO');
        expect(result.data.paymentMethod).toBe('Pix');
      }
    });

    it('deve acusar erro se faltar campos obrigatorios ou CPF invalido', () => {
      const invalidRow = {
        studentName: '', // erro: obrigatorio
        amountCents: 'gratis', // erro: invalido
        institution: 'fecaf',
        sellerName: 'Bia',
        cpf: '1234', // erro: menor que 11
        phone: '1234',
        courseName: 'Curso',
        paymentMethod: 'pix',
      };

      const result = enrollmentRowSchema.safeParse(invalidRow);
      expect(result.success).toBe(false);
    });
  });

  describe('Chave de Duplicidade HMAC (generateHmacSignature)', () => {
    it('deve gerar hashes identicos para inputs equivalentes independente de caixa e espaços', () => {
      const hash1 = generateHmacSignature(' 123.456.789-00 ', '  Analise de Sistemas  ', ' UniFecaf ', '2026-06');
      const hash2 = generateHmacSignature('12345678900', 'analise de sistemas', 'unifecaf', '2026-06');
      
      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(64); // sha256 hex
    });

    it('deve gerar hashes diferentes para CPFs ou cursos diferentes', () => {
      const hash1 = generateHmacSignature('12345678900', 'Sistemas', 'UniFecaf', '2026-06');
      const hash2 = generateHmacSignature('12345678900', 'Administracao', 'UniFecaf', '2026-06');
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Normalizador de Mês de Referência (normalizeReferenceMonth)', () => {
    it('deve aceitar e manter o formato YYYY-MM correto', () => {
      expect(normalizeReferenceMonth('2026-07')).toBe('2026-07');
      expect(normalizeReferenceMonth('2026-7')).toBe('2026-07');
    });

    it('deve converter formato MM/YYYY ou MM-YYYY para YYYY-MM', () => {
      expect(normalizeReferenceMonth('07/2026')).toBe('2026-07');
      expect(normalizeReferenceMonth('7-2026')).toBe('2026-07');
    });

    it('deve converter formato MM/YY para YYYY-MM', () => {
      expect(normalizeReferenceMonth('07/26')).toBe('2026-07');
    });

    it('deve converter nome do mês em português (com ou sem ano) para YYYY-MM', () => {
      const currentYear = new Date().getFullYear().toString();
      expect(normalizeReferenceMonth('Julho')).toBe(`${currentYear}-07`);
      expect(normalizeReferenceMonth('Julho/2026')).toBe('2026-07');
      expect(normalizeReferenceMonth('julho de 2026')).toBe('2026-07');
      expect(normalizeReferenceMonth('jul/26')).toBe('2026-07');
      expect(normalizeReferenceMonth('Janeiro/2025')).toBe('2025-01');
    });
  });

  describe('formatMonthName (PeriodSelector) — resistência a dados corrompidos', () => {
    // Importa diretamente a função para testar
    it('deve formatar YYYY-MM correto como "Mês / Ano"', async () => {
      const { formatMonthName } = await import('../components/shared/PeriodSelector');
      const result = formatMonthName('2026-07');
      expect(result).toContain('2026');
      expect(result.toLowerCase()).toContain('julho');
    });

    it('deve lidar com string "Julho" sem crash (normaliza via normalizeReferenceMonth)', async () => {
      const { formatMonthName } = await import('../components/shared/PeriodSelector');
      const result = formatMonthName('Julho');
      // Deve normalizar e formatar corretamente em vez de retornar "Invalid Date"
      expect(result).not.toContain('Invalid');
      expect(result.toLowerCase()).toContain('julho');
    });

    it('deve retornar string vazia para entrada vazia', async () => {
      const { formatMonthName } = await import('../components/shared/PeriodSelector');
      expect(formatMonthName('')).toBe('');
    });

    it('deve retornar o texto original para entrada completamente inválida', async () => {
      const { formatMonthName } = await import('../components/shared/PeriodSelector');
      const result = formatMonthName('abc-xyz');
      // Deve retornar o original sem crash
      expect(result).toBe('abc-xyz');
    });
  });
});
