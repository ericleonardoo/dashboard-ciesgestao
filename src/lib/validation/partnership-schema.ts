import { z } from 'zod';
import { phoneSchema } from './enrollment-schema';

export const b2bStatusEnum = z.enum([
  'PROSPECTED',
  'CONTACT_MADE',
  'DECIDER_IDENTIFIED',
  'MEETING_SCHEDULED',
  'MEETING_HELD',
  'PROPOSAL_SENT',
  'IN_NEGOTIATION',
  'PARTNERSHIP_APPROVED',
  'PARTNERSHIP_ACTIVE',
  'NO_INTEREST'
]);

export type B2BStatus = z.infer<typeof b2bStatusEnum>;

export const B2B_STATUS_LABELS: Record<B2BStatus, { label: string; color: string }> = {
  PROSPECTED: { label: 'Prospectada', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  CONTACT_MADE: { label: 'Contato Realizado', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  DECIDER_IDENTIFIED: { label: 'Decisor Identificado', color: 'bg-sky-100 text-sky-700 border-sky-200' },
  MEETING_SCHEDULED: { label: 'Reunião Agendada', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  MEETING_HELD: { label: 'Reunião Realizada', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  PROPOSAL_SENT: { label: 'Proposta Enviada', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  IN_NEGOTIATION: { label: 'Em Negociação', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  PARTNERSHIP_APPROVED: { label: 'Parceria Aprovada', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  PARTNERSHIP_ACTIVE: { label: 'Parceria Ativa', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  NO_INTEREST: { label: 'Sem Interesse', color: 'bg-red-100 text-red-700 border-red-200' }
};

export const B2B_SEGMENTS = [
  'Comércio / Varejo',
  'Indústria',
  'Saúde / Hospitais',
  'Educação',
  'Tecnologia / TI',
  'Serviços',
  'Alimentação / Gastronomia',
  'Setor Público / Órgãos',
  'Outros'
] as const;

export const partnershipSchema = z.object({
  id: z.string().optional(),
  companyName: z.string().min(2, 'Razão ou nome da empresa é obrigatório'),
  cnpj: z.string().optional(),
  segment: z.string().default('Comércio / Varejo'),
  estimatedEmployees: z.number().int().nonnegative().optional(),
  city: z.string().default('Poços de Caldas'),
  contactName: z.string().min(2, 'Nome do contato é obrigatório'),
  contactRole: z.string().default('Gestor de RH'),
  contactPhone: phoneSchema,
  contactEmail: z.string().email('E-mail inválido').optional().or(z.literal('')),
  deciderIdentified: z.boolean().default(false),
  ownerId: z.string().min(1, 'Responsável CIES é obrigatório'),
  ownerName: z.string().optional(),
  status: b2bStatusEnum.default('PROSPECTED'),
  lastContactAt: z.string().optional(),
  nextStep: z.string().optional(),
  nextStepAt: z.string().optional(),
  meetingDate: z.string().optional(),
  proposalAmountCents: z.number().int().nonnegative().optional(),
  noInterestReason: z.string().optional(),
  notes: z.string().optional(),
  visitsCompleted: z.number().int().min(0).default(0),
  conversionStats: z.object({
    leadsGenerated: z.number().int().min(0).default(0),
    enrollmentsClosed: z.number().int().min(0).default(0),
    totalRevenueCents: z.number().int().min(0).default(0)
  }).default({ leadsGenerated: 0, enrollmentsClosed: 0, totalRevenueCents: 0 }),
  createdAt: z.string().optional(),
  createdBy: z.string().optional(),
  updatedAt: z.string().optional(),
  updatedBy: z.string().optional(),
}).refine(data => {
  if (data.status === 'NO_INTEREST' && (!data.noInterestReason || data.noInterestReason.trim().length === 0)) {
    return false;
  }
  return true;
}, {
  message: 'Motivo do desinteresse é obrigatório ao encerrar empresa',
  path: ['noInterestReason']
});

export type Partnership = z.infer<typeof partnershipSchema>;

/**
 * Higieniza CNPJ para apenas dígitos
 */
export function normalizeCnpj(cnpj?: string): string {
  if (!cnpj) return '';
  return cnpj.replace(/\D/g, '');
}
