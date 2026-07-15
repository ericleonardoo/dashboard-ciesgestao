import { z } from 'zod';
import { cpfSchema, phoneSchema } from './enrollment-schema';

export const leadStatusSchema = z.enum(['novo', 'em_atendimento', 'matriculado', 'perdido']);
export type LeadStatus = z.infer<typeof leadStatusSchema>;

export const leadOriginSchema = z.enum(['meta_ads', 'google_ads', 'organico', 'convenio', 'indicacao', 'outro']);
export type LeadOrigin = z.infer<typeof leadOriginSchema>;

export const leadSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Nome deve conter pelo menos 3 caracteres'),
  cpf: cpfSchema.optional().or(z.literal('')), // Opcional no primeiro contato
  phone: phoneSchema,
  interest: z.string().min(2, 'Informe o curso de interesse'),
  origin: leadOriginSchema.default('organico'),
  consultantId: z.string().optional(), // ID do colaborador responsável
  status: leadStatusSchema.default('novo'),
  lossReason: z.string().optional().transform(val => val?.replace(/<[^>]*>?/gm, '')),
  createdAt: z.string().datetime().optional(), // Armazenado como ISO string no Client, e Timestamp no server. Tipamos como string/date.
  updatedAt: z.string().datetime().optional(),
});

export type Lead = z.infer<typeof leadSchema>;
