/**
 * Tipagem básica de matrícula para aplicação de regras de negócio
 */
export interface EnrollmentData {
  isDbDuplicate?: boolean;
  isInternalDuplicate?: boolean;
  bvsStatus?: 'SIM' | 'NÃO' | 'NÃO INFORMADO';
  releaseStatus?: 'SIM' | 'NÃO' | 'NÃO INFORMADO';
}

/**
 * Determina centralizadamente se uma matrícula é considerada válida para fins gerenciais e faturamento válido
 */
export function isEnrollmentValid(enrollment: EnrollmentData): boolean {
  // Matrículas duplicadas com registros já existentes no banco de dados
  if (enrollment.isDbDuplicate === true) {
    return false;
  }

  // Linhas duplicadas de forma redundante dentro do próprio lote importado
  if (enrollment.isInternalDuplicate === true) {
    return false;
  }

  return true;
}

/**
 * Determina se uma matrícula está pendente de envio de mensagem de boas-vindas
 * Regra do AGENTS.md (9.4): Subiu? = SIM E BVS? = NÃO ou NÃO INFORMADO
 */
export function isBvsPending(enrollment: EnrollmentData): boolean {
  const hasUploaded = enrollment.releaseStatus === 'SIM';
  const hasNotSentBvs = enrollment.bvsStatus === 'NÃO' || enrollment.bvsStatus === 'NÃO INFORMADO';

  return hasUploaded && hasNotSentBvs;
}
