import { z } from 'zod';
import { parseCurrencyToCents } from './enrollment-schema';

export const campaignChannelSchema = z.enum(['instagram', 'google', 'facebook', 'tiktok', 'acao_local', 'email', 'outro']);
export type CampaignChannel = z.infer<typeof campaignChannelSchema>;

export const campaignSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Nome da campanha é obrigatório').transform(val => val.replace(/<[^>]*>?/gm, '')),
  channel: campaignChannelSchema,
  startDate: z.string().min(10, 'Data de início inválida'), // YYYY-MM-DD
  endDate: z.string().optional(),
  costCents: z.union([z.string(), z.number()]).transform(parseCurrencyToCents),
  leadsAttracted: z.number().int().min(0).default(0),
  enrollmentsClosed: z.number().int().min(0).default(0),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Campaign = z.infer<typeof campaignSchema>;
