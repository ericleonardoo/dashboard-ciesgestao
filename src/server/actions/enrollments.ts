'use server';

import { getAdminDb } from '../../lib/firebase/admin';
import { requirePermission } from '../../lib/permissions';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

export interface AuditLogEntry {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  updatedBy: string;
  updatedByName: string;
  timestamp: string;
}

export interface EnrollmentItem {
  id: string;
  studentName: string;
  amountCents: number;
  type: string;
  courseName: string;
  institution: string;
  sellerName: string;
  bvsStatus: 'SIM' | 'NÃO' | 'NÃO INFORMADO';
  releaseStatus: 'SIM' | 'NÃO' | 'NÃO INFORMADO';
  cpf: string;
  phone: string;
  redirectUrl: string;
  paymentMethod: string;
  referenceMonth: string;
  isDbDuplicate: boolean;
  isInternalDuplicate: boolean;
  auditLogs?: AuditLogEntry[];
  createdAt: string | null;
}

/**
 * Server Action para listar todas as matrículas do período informado
 */
export async function getEnrollmentsList(referenceMonth: string): Promise<EnrollmentItem[]> {
  // Exige permissão de leitura
  await requirePermission('enrollments', 'read');

  if (!referenceMonth) {
    return [];
  }

  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection('enrollments')
      .where('referenceMonth', '==', referenceMonth)
      .orderBy('createdAt', 'desc')
      .get();

    const enrollments: EnrollmentItem[] = [];

    snapshot.docs.forEach((doc: { data: () => Record<string, any>; id: string }) => {
      const data = doc.data();
      enrollments.push({
        id: doc.id,
        studentName: data.studentName || '',
        amountCents: data.amountCents || 0,
        type: data.type || '',
        courseName: data.courseName || '',
        institution: data.institution || '',
        sellerName: data.sellerName || '',
        bvsStatus: data.bvsStatus || 'NÃO INFORMADO',
        releaseStatus: data.releaseStatus || 'NÃO INFORMADO',
        cpf: data.cpf || '',
        phone: data.phone || '',
        redirectUrl: data.redirectUrl || '',
        paymentMethod: data.paymentMethod || '',
        referenceMonth: data.referenceMonth || '',
        isDbDuplicate: data.isDbDuplicate === true,
        isInternalDuplicate: data.isInternalDuplicate === true,
        auditLogs: data.auditLogs || [],
        createdAt: data.createdAt ? (data.createdAt.toDate() as Date).toISOString() : null,
      });
    });

    return enrollments;
  } catch (error) {
    console.error('Erro ao ler matrículas do servidor:', error);
    throw new Error('Falha ao obter lista de matrículas.');
  }
}

interface EnrollmentUpdates {
  sellerName?: string;
  amountCents?: number;
  bvsStatus?: 'SIM' | 'NÃO' | 'NÃO INFORMADO';
  releaseStatus?: 'SIM' | 'NÃO' | 'NÃO INFORMADO';
}

/**
 * Server Action para alterar campos da matrícula com regras RBAC estritas e logs de auditoria
 */
export async function updateEnrollmentFields(
  enrollmentId: string,
  updates: EnrollmentUpdates
): Promise<void> {
  // 1. Obtém o colaborador logado da sessão SSR
  const user = await requirePermission('enrollments', 'write_operational');

  if (!enrollmentId) {
    throw new Error('ID de matrícula é obrigatório.');
  }

  const isGestao = user.areas.includes('gestao');
  const isAdministrativo = user.areas.includes('administrativo');

  // 2. Valida RBAC estrito para alteração de campos protegidos
  if (updates.sellerName !== undefined) {
    // Regra 9.6: Somente Gestão pode alterar vendedor
    if (!isGestao) {
      throw new Error('Apenas colaboradores da área de Gestão possuem permissão para alterar o vendedor de uma matrícula.');
    }
  }

  if (updates.amountCents !== undefined) {
    // Regra 9.5: Somente Gestão ou Administrativo pode alterar valor
    if (!isGestao && !isAdministrativo) {
      throw new Error('Permissões insuficientes para alterar o valor financeiro de uma matrícula.');
    }
  }

  try {
    const db = getAdminDb();
    const docRef = db.collection('enrollments').doc(enrollmentId);
    
    // Obtém o estado atual para auditoria
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      throw new Error('Matrícula não encontrada.');
    }

    const current = docSnap.data() || {};
    const auditLogs: AuditLogEntry[] = current.auditLogs || [];
    const timestampStr = new Date().toISOString();

    const dbUpdates: Record<string, unknown> = {};

    // 3. Monta logs de auditoria se houver alteração real dos valores
    if (updates.sellerName !== undefined && updates.sellerName !== current.sellerName) {
      auditLogs.push({
        field: 'sellerName',
        oldValue: current.sellerName || 'NÃO INFORMADO',
        newValue: updates.sellerName,
        updatedBy: user.uid,
        updatedByName: user.name,
        timestamp: timestampStr,
      });
      dbUpdates.sellerName = updates.sellerName;
    }

    if (updates.amountCents !== undefined && updates.amountCents !== current.amountCents) {
      auditLogs.push({
        field: 'amountCents',
        oldValue: current.amountCents || 0,
        newValue: updates.amountCents,
        updatedBy: user.uid,
        updatedByName: user.name,
        timestamp: timestampStr,
      });
      dbUpdates.amountCents = updates.amountCents;
    }

    if (updates.bvsStatus !== undefined && updates.bvsStatus !== current.bvsStatus) {
      auditLogs.push({
        field: 'bvsStatus',
        oldValue: current.bvsStatus || 'NÃO INFORMADO',
        newValue: updates.bvsStatus,
        updatedBy: user.uid,
        updatedByName: user.name,
        timestamp: timestampStr,
      });
      dbUpdates.bvsStatus = updates.bvsStatus;
    }

    if (updates.releaseStatus !== undefined && updates.releaseStatus !== current.releaseStatus) {
      auditLogs.push({
        field: 'releaseStatus',
        oldValue: current.releaseStatus || 'NÃO INFORMADO',
        newValue: updates.releaseStatus,
        updatedBy: user.uid,
        updatedByName: user.name,
        timestamp: timestampStr,
      });
      dbUpdates.releaseStatus = updates.releaseStatus;
    }

    // Se nenhum campo sofreu alteração, apenas retorna
    if (Object.keys(dbUpdates).length === 0) {
      return;
    }

    // Grava as alterações e atualiza o histórico de auditoria
    dbUpdates.auditLogs = auditLogs;
    dbUpdates.updatedAt = FieldValue.serverTimestamp();
    dbUpdates.updatedBy = user.uid;
    dbUpdates.updatedByName = user.name;

    await docRef.update(dbUpdates);

    // 4. Força revalidação das telas principais
    revalidatePath('/matriculas');
    revalidatePath('/relacionamento');
    revalidatePath('/');
  } catch (error) {
    console.error('Erro ao atualizar campos de matrícula:', error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error('Falha ao gravar modificação. Detalhes: ' + message);
  }
}
