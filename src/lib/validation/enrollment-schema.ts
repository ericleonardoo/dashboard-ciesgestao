import { z } from 'zod';

/**
 * Função utilitária para limpar caracteres não-numéricos (máscaras de CPF, Telefone, etc.)
 */
export function cleanNumericString(value: string): string {
  return value.replace(/\D/g, '');
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
