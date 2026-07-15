import { z } from 'zod';
import { phoneSchema } from './enrollment-schema';

export const partnershipStatusSchema = z.enum(['ativo', 'em_negociacao', 'inativo']);
export type PartnershipStatus = z.infer<typeof partnershipStatusSchema>;

export const partnershipSchema = z.object({
  id: z.string().optional(),
  companyName: z.string().min(2, 'Nome da empresa é obrigatório').transform(val => val.replace(/<[^>]*>?/gm, '')),
  contactName: z.string().min(2, 'Nome do contato é obrigatório').transform(val => val.replace(/<[^>]*>?/gm, '')),
  contactPhone: phoneSchema,
  ciesResponsibleId: z.string().min(1, 'Responsável CIES é obrigatório'),
  status: partnershipStatusSchema.default('em_negociacao'),
  visitsCompleted: z.number().int().min(0).default(0),
  conversionStats: z.object({
    leadsGenerated: z.number().int().min(0).default(0),
    enrollmentsClosed: z.number().int().min(0).default(0)
  }).default({ leadsGenerated: 0, enrollmentsClosed: 0 }),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Partnership = z.infer<typeof partnershipSchema>;
