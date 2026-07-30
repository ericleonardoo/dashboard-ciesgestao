import { z } from 'zod';

export const activityTypeEnum = z.enum([
  'PHONE_CALL',
  'WHATSAPP',
  'NEW_CONTACT',
  'FOLLOW_UP',
  'VISIT',
  'PROSPECTING',
  'MEETING',
  'PROPOSAL',
  'ENROLLMENT'
]);

export type ActivityType = z.infer<typeof activityTypeEnum>;

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, { label: string; icon: string; color: string }> = {
  PHONE_CALL: { label: 'Ligação', icon: 'Phone', color: 'bg-blue-100 text-blue-700' },
  WHATSAPP: { label: 'WhatsApp', icon: 'MessageSquare', color: 'bg-emerald-100 text-emerald-700' },
  NEW_CONTACT: { label: 'Novo Contato', icon: 'UserPlus', color: 'bg-sky-100 text-sky-700' },
  FOLLOW_UP: { label: 'Follow-up', icon: 'Clock', color: 'bg-yellow-100 text-yellow-700' },
  VISIT: { label: 'Visita Comercial', icon: 'MapPin', color: 'bg-purple-100 text-purple-700' },
  PROSPECTING: { label: 'Prospecção B2B', icon: 'Building2', color: 'bg-indigo-100 text-indigo-700' },
  MEETING: { label: 'Reunião Realizada', icon: 'Calendar', color: 'bg-amber-100 text-amber-700' },
  PROPOSAL: { label: 'Proposta Enviada', icon: 'FileText', color: 'bg-orange-100 text-orange-700' },
  ENROLLMENT: { label: 'Matrícula Convertida', icon: 'Award', color: 'bg-emerald-100 text-emerald-700' }
};

export const activitySchema = z.object({
  id: z.string().optional(),
  actorId: z.string().min(1, 'Consultor é obrigatório'),
  actorName: z.string().optional(),
  type: activityTypeEnum,
  entityType: z.enum(['LEAD', 'COMPANY']).default('LEAD'),
  entityId: z.string().min(1, 'Entidade relacionada é obrigatória'),
  entityName: z.string().optional(),
  occurredAt: z.string().default(() => new Date().toISOString()),
  result: z.string().optional(),
  nextStep: z.string().optional(),
  notes: z.string().min(2, 'Observação da atividade é obrigatória'),
  source: z.enum(['AUTO', 'MANUAL']).default('MANUAL'),
  createdAt: z.string().optional(),
});

export type SalesActivity = z.infer<typeof activitySchema>;
