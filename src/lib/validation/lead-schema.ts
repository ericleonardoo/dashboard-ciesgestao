import { z } from 'zod';
import { phoneSchema } from './enrollment-schema';

export const leadStatusEnum = z.enum([
  'NEW',
  'FIRST_CONTACT',
  'IN_SERVICE',
  'QUALIFIED',
  'PROPOSAL_SENT',
  'NEGOTIATION',
  'FOLLOW_UP',
  'ENROLLED',
  'LOST',
  'NO_RESPONSE'
]);

export type LeadStatus = z.infer<typeof leadStatusEnum>;

export const LEAD_STATUS_LABELS: Record<LeadStatus, { label: string; color: string }> = {
  NEW: { label: 'Novo', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  FIRST_CONTACT: { label: 'Primeiro Contato', color: 'bg-sky-100 text-sky-700 border-sky-200' },
  IN_SERVICE: { label: 'Em Atendimento', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  QUALIFIED: { label: 'Qualificado', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  PROPOSAL_SENT: { label: 'Proposta Enviada', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  NEGOTIATION: { label: 'Negociação', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  FOLLOW_UP: { label: 'Follow-up', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  ENROLLED: { label: 'Matriculado', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  LOST: { label: 'Perdido', color: 'bg-red-100 text-red-700 border-red-200' },
  NO_RESPONSE: { label: 'Sem Retorno', color: 'bg-slate-100 text-slate-700 border-slate-200' }
};

export const LEAD_SOURCES = [
  'Instagram',
  'Facebook',
  'Google',
  'WhatsApp',
  'Indicação',
  'Evento',
  'Ação Externa',
  'Empresa Parceira',
  'Orgânico',
  'Outros'
] as const;

export const leadSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Nome deve conter pelo menos 3 caracteres'),
  phone: phoneSchema,
  phoneNormalized: z.string().optional(),
  city: z.string().default('Poços de Caldas'),
  courseInterest: z.string().min(2, 'Informe o curso de interesse'),
  modality: z.enum(['EAD', 'SEMIPRESENCIAL']).default('EAD'),
  institutionInterest: z.enum(['UniFecaf', 'UniFacvest', 'FSL']).default('UniFecaf'),
  source: z.string().default('WhatsApp'),
  ownerId: z.string().min(1, 'Responsável é obrigatório'),
  ownerName: z.string().optional(),
  status: leadStatusEnum.default('NEW'),
  lastContactAt: z.string().optional(),
  nextContactAt: z.string().optional(),
  potentialAmountCents: z.number().int().nonnegative().optional(),
  lossReason: z.string().optional(),
  notes: z.string().optional(),
  partnershipId: z.string().optional(),
  campaignId: z.string().optional(),
  convertedEnrollmentId: z.string().optional(),
  createdAt: z.string().optional(),
  createdBy: z.string().optional(),
  updatedAt: z.string().optional(),
  updatedBy: z.string().optional(),
}).refine(data => {
  if (data.status === 'LOST' && (!data.lossReason || data.lossReason.trim().length === 0)) {
    return false;
  }
  return true;
}, {
  message: 'Motivo de perda é obrigatório ao marcar como Perdido',
  path: ['lossReason']
});

export type Lead = z.infer<typeof leadSchema>;

/**
 * Função utilitária para higienizar número de telefone apenas com dígitos
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Verifica se um lead possui follow-up vencido
 */
export function isFollowUpOverdue(lead: Lead): boolean {
  if (lead.status === 'ENROLLED' || lead.status === 'LOST') {
    return false;
  }
  if (!lead.nextContactAt) {
    return false;
  }
  const nextDate = new Date(lead.nextContactAt);
  return nextDate < new Date();
}
