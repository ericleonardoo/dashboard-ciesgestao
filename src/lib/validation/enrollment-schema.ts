import { z } from 'zod';

/**
 * Função utilitária para limpar caracteres não-numéricos (máscaras de CPF, Telefone, etc.)
 */
export function cleanNumericString(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Normaliza qualquer formato de mês (ex: "Julho", "Julho/2026", "07/2026", "2026-07") para "YYYY-MM"
 */
export function normalizeReferenceMonth(input: string): string {
  if (!input) return '';
  const cleanInput = input.trim().toLowerCase();

  // Caso 1: YYYY-MM (ex: "2026-07" ou "2026-7")
  const yyyyMmRegex = /^(\d{4})-(\d{1,2})$/;
  const matchYyyyMm = cleanInput.match(yyyyMmRegex);
  if (matchYyyyMm) {
    const year = matchYyyyMm[1];
    const month = matchYyyyMm[2].padStart(2, '0');
    return `${year}-${month}`;
  }

  // Caso 2: MM/YYYY ou MM-YYYY (ex: "07/2026" ou "7/2026")
  const mmYyyyRegex = /^(\d{1,2})[\/\-](\d{4})$/;
  const matchMmYyyy = cleanInput.match(mmYyyyRegex);
  if (matchMmYyyy) {
    const month = matchMmYyyy[1].padStart(2, '0');
    const year = matchMmYyyy[2];
    return `${year}-${month}`;
  }

  // Caso 3: MM/YY ou MM-YY (ex: "07/26")
  const mmYyRegex = /^(\d{1,2})[\/\-](\d{2})$/;
  const matchMmYy = cleanInput.match(mmYyRegex);
  if (matchMmYy) {
    const month = matchMmYy[1].padStart(2, '0');
    const year = `20${matchMmYy[2]}`; // Assume século 21
    return `${year}-${month}`;
  }

  // Caso 4: Nomes textuais do mês em português (ex: "Julho", "Julho/2026", "julho/26")
  const monthMap: Record<string, string> = {
    janeiro: '01', jan: '01',
    fevereiro: '02', fev: '02',
    marco: '03', março: '03', mar: '03',
    abril: '04', abr: '04',
    maio: '05', mai: '05',
    junho: '06', jun: '06',
    julho: '07', jul: '07',
    agosto: '08', ago: '08',
    setembro: '09', set: '09',
    outubro: '10', out: '10',
    novembro: '11', nov: '11',
    dezembro: '12', dez: '12'
  };

  // Procura se algum nome de mês está contido na string
  let foundMonthNum = '';
  for (const [name, num] of Object.entries(monthMap)) {
    if (cleanInput.includes(name)) {
      foundMonthNum = num;
      break;
    }
  }

  if (foundMonthNum) {
    let year = new Date().getFullYear().toString(); // Default para ano atual
    
    // Procura por 4 dígitos consecutivos (ex: "2026")
    const year4Match = cleanInput.match(/\b(20\d{2})\b/);
    if (year4Match) {
      year = year4Match[1];
    } else {
      // Procura por 2 dígitos depois de barra ou espaço no final (ex: "/26" ou "de 26")
      const year2Match = cleanInput.match(/[\/\s](\d{2})$/);
      if (year2Match) {
        year = `20${year2Match[1]}`;
      }
    }
    return `${year}-${foundMonthNum}`;
  }

  return input;
}

/**
 * Normaliza e valida o CPF para exatamente 11 dígitos numéricos
 */
export const cpfSchema = z
  .string()
  .transform((val) => cleanNumericString(val))
  .refine((val) => val.length === 11, {
    message: 'CPF deve conter exatamente 11 dígitos após remoção da máscara.',
  });

/**
 * Normaliza e valida o telefone para dígitos com DDI/DDD opcional (10 a 13 dígitos)
 */
export const phoneSchema = z
  .string()
  .transform((val) => cleanNumericString(val))
  .refine((val) => val.length >= 10 && val.length <= 13, {
    message: 'Telefone deve possuir entre 10 e 13 dígitos (incluindo DDD).',
  });

/**
 * Converte strings financeiras do padrão brasileiro (ex: "R$ 199,90", "199.90", "199,9") para centavos inteiros
 */
export function parseCurrencyToCents(val: string | number): number {
  if (typeof val === 'number') {
    return Math.round(val * 100);
  }

  // Remove símbolos monetários e espaços
  let cleanVal = val.replace(/R\$\s?/gi, '').trim();

  // Caso contenha pontos e vírgula (ex: 1.099,90)
  if (cleanVal.includes('.') && cleanVal.includes(',')) {
    cleanVal = cleanVal.replace(/\./g, '').replace(',', '.');
  } else if (cleanVal.includes(',')) {
    // Caso use vírgula como separador decimal (ex: 199,90)
    cleanVal = cleanVal.replace(',', '.');
  }

  const parsed = parseFloat(cleanVal);
  if (isNaN(parsed)) {
    throw new Error(`Valor financeiro inválido: ${val}`);
  }

  return Math.round(parsed * 100);
}

export const amountCentsSchema = z
  .union([z.string(), z.number()])
  .transform((val, ctx) => {
    try {
      return parseCurrencyToCents(val);
    } catch (err) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: err instanceof Error ? err.message : 'Formato de valor inválido.',
      });
      return z.NEVER;
    }
  });

/**
 * Normaliza instituições para valores controlados
 */
export function normalizeInstitution(val: string): 'UniFecaf' | 'UniFacvest' | 'FSL' | string {
  const clean = val.trim().toLowerCase();
  if (clean.includes('fecaf')) return 'UniFecaf';
  if (clean.includes('facvest') || clean.includes('vest')) return 'UniFacvest';
  if (clean.includes('sao luiz') || clean.includes('são luiz') || clean === 'fsl') return 'FSL';
  return val.trim(); // Retorna o valor original limpo se não for correspondido (para validação posterior)
}

export const institutionSchema = z
  .string()
  .transform((val) => normalizeInstitution(val))
  .refine((val) => ['UniFecaf', 'UniFacvest', 'FSL'].includes(val), {
    message: 'Instituição não reconhecida. Deve ser UniFecaf, UniFacvest ou FSL.',
  });

/**
 * Normaliza formas de pagamento
 */
export function normalizePaymentMethod(val: string): 'Pix' | 'Boleto' | 'Cartão' | string {
  const clean = val.trim().toLowerCase();
  if (clean.includes('pix')) return 'Pix';
  if (clean.includes('boleto')) return 'Boleto';
  if (clean.includes('cartao') || clean.includes('cartão')) return 'Cartão';
  return val.trim();
}

export const paymentMethodSchema = z
  .string()
  .transform((val) => normalizePaymentMethod(val))
  .refine((val) => ['Pix', 'Boleto', 'Cartão'].includes(val), {
    message: 'Forma de pagamento não reconhecida. Deve ser Pix, Boleto ou Cartão.',
  });

/**
 * Normaliza os estados tri-state de BVS? e Subiu?
 */
export function normalizeTriState(val: string | null | undefined): 'SIM' | 'NÃO' | 'NÃO INFORMADO' {
  if (!val) return 'NÃO INFORMADO';
  const clean = val.trim().toUpperCase();
  if (clean === 'SIM' || clean === 'S' || clean === 'YES' || clean === 'Y') return 'SIM';
  if (clean === 'NÃO' || clean === 'NAO' || clean === 'N' || clean === 'NO') return 'NÃO';
  return 'NÃO INFORMADO';
}

export const triStateSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((val) => normalizeTriState(val));

/**
 * Esquema Zod completo para validar e normalizar uma linha bruta de matrícula
 */
export const enrollmentRowSchema = z.object({
  studentName: z.string().min(1, 'Nome do aluno é obrigatório.').transform((val) => val.trim()),
  amountCents: amountCentsSchema,
  type: z.union([z.string(), z.null(), z.undefined()]).transform((val) => val?.trim() || ''),
  institution: institutionSchema,
  sellerName: z.string().min(1, 'Vendedor é obrigatório.').transform((val) => val.trim()),
  bvsStatus: triStateSchema,
  cpf: cpfSchema,
  phone: phoneSchema,
  redirectUrl: z.union([z.string(), z.null(), z.undefined()]).transform((val) => val?.trim() || ''),
  releaseStatus: triStateSchema, // Campo 'Subiu?'
  courseName: z.string().min(1, 'Curso é obrigatório.').transform((val) => val.trim()),
  paymentMethod: paymentMethodSchema,
});

export type NormalizedEnrollmentRow = z.infer<typeof enrollmentRowSchema>;
