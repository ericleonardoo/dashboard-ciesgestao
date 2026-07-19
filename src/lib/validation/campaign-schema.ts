import { z } from 'zod';
import { parseCurrencyToCents } from './enrollment-schema';

export const campaignChannelSchema = z.enum([
  'Instagram',
  'WhatsApp',
  'Indicação',
  'Presencial',
  'Panfleto',
  'Empresa conveniada',
  'Evento',
  'Google',
  'TikTok',
  'Campanha interna',
  'Outro'
]);

export type CampaignChannel = z.infer<typeof campaignChannelSchema>;

export const campaignStatusSchema = z.enum(['Ativa', 'Pausada', 'Concluída']);
export type CampaignStatus = z.infer<typeof campaignStatusSchema>;

export const campaignSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Nome da campanha deve ter no mínimo 3 caracteres.').transform(val => val.replace(/<[^>]*>?/gm, '')),
  channel: campaignChannelSchema,
  startDate: z.string().min(10, 'Data de início é obrigatória.'), // YYYY-MM-DD
  endDate: z.string().optional(),
  costCents: z.union([z.string(), z.number()]).transform(parseCurrencyToCents).default(0),
  leadsCount: z.union([z.string(), z.number()]).transform(val => Number(val) || 0).default(0),
  enrollmentsCount: z.union([z.string(), z.number()]).transform(val => Number(val) || 0).default(0),
  institution: z.string().optional(),
  status: campaignStatusSchema.default('Ativa'),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Campaign = z.infer<typeof campaignSchema>;
