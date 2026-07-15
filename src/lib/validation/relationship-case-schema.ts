import { z } from 'zod';
import { cpfSchema } from './enrollment-schema';

export const caseCategorySchema = z.enum(['acesso', 'financeiro', 'evasao', 'outro']);
export type CaseCategory = z.infer<typeof caseCategorySchema>;

export const caseStatusSchema = z.enum(['aberto', 'em_tratativa', 'resolvido']);
export type CaseStatus = z.infer<typeof caseStatusSchema>;

export const relationshipCaseSchema = z.object({
  id: z.string().optional(),
  studentName: z.string().min(3, 'Nome do aluno é obrigatório').transform(val => val.replace(/<[^>]*>?/gm, '')),
  studentCpf: cpfSchema,
  category: caseCategorySchema,
  status: caseStatusSchema.default('aberto'),
  description: z.string().min(10, 'Descreva o caso com detalhes (mín. 10 caracteres)').transform(val => val.replace(/<[^>]*>?/gm, '')),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type RelationshipCase = z.infer<typeof relationshipCaseSchema>;
