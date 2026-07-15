import { z } from 'zod';
import { parseCurrencyToCents } from './enrollment-schema';

export const actionPlanStatusSchema = z.enum(['pendente', 'em_andamento', 'concluido', 'cancelado']);
export type ActionPlanStatus = z.infer<typeof actionPlanStatusSchema>;

export const actionPlanSchema = z.object({
  id: z.string().optional(),
  what: z.string().min(5, 'Descreva "O quê" será feito').transform(val => val.replace(/<[^>]*>?/gm, '')),
  why: z.string().min(5, 'Descreva "Por quê" será feito').transform(val => val.replace(/<[^>]*>?/gm, '')),
  where: z.string().min(2, 'Descreva "Onde"').transform(val => val.replace(/<[^>]*>?/gm, '')),
  when: z.string().min(10, 'Data limite (Quando) é obrigatória'),
  who: z.string().min(2, 'Responsável (Quem) é obrigatório').transform(val => val.replace(/<[^>]*>?/gm, '')),
  how: z.string().min(5, 'Descreva "Como" será executado').transform(val => val.replace(/<[^>]*>?/gm, '')),
  howMuchCents: z.union([z.string(), z.number()]).transform(parseCurrencyToCents).default(0),
  status: actionPlanStatusSchema.default('pendente'),
  kpiAssociated: z.string().optional().transform(val => val?.replace(/<[^>]*>?/gm, '')),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type ActionPlan = z.infer<typeof actionPlanSchema>;
