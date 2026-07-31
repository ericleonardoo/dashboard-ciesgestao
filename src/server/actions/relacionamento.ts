'use server';

import { getAdminDb } from '../../lib/firebase/admin';
import { requirePermission } from '../../lib/permissions';
import { getSafeRedirectUrl } from '../../lib/validation/url-sanitizer';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

export interface BvsQueueItem {
  id: string;
  studentName: string;
  courseName: string;
  institution: string;
  sellerName: string;
  phone: string;
  redirectUrl: string;
  bvsStatus: 'SIM' | 'NÃO' | 'NÃO INFORMADO';
  releaseStatus: 'SIM' | 'NÃO' | 'NÃO INFORMADO';
  createdAt: string | null;
}

export interface BvsQueueResult {
  pending: BvsQueueItem[];
  sent: BvsQueueItem[];
}

/**
 * Server Action para buscar a fila de pendências e o histórico recente de BVS (boas-vindas)
 */
export async function getBvsQueue(referenceMonth: string): Promise<BvsQueueResult> {
  // Exige permissão de leitura
  await requirePermission('enrollments', 'read');

  if (!referenceMonth) {
    return { pending: [], sent: [] };
  }

  try {
    const db = getAdminDb();

    // Consulta no Firestore com ordenação (usando nosso índice composto)
    const snapshot = await db
      .collection('enrollments')
      .where('referenceMonth', '==', referenceMonth)
      .where('releaseStatus', '==', 'SIM')
      .orderBy('createdAt', 'desc')
      .get();

    const pending: BvsQueueItem[] = [];
    const sent: BvsQueueItem[] = [];

    snapshot.docs.forEach((doc: { data: () => Record<string, any>; id: string }) => {
      const data = doc.data();
      const bvsStatus = data.bvsStatus || 'NÃO INFORMADO';
      
      const item: BvsQueueItem = {
        id: doc.id,
        studentName: data.studentName || '',
        courseName: data.courseName || '',
        institution: data.institution || '',
        sellerName: data.sellerName || '',
        phone: data.phone || '',
        // Higieniza o link na saída do servidor para segurança contra XSS
        redirectUrl: getSafeRedirectUrl(data.redirectUrl, data.phone || ''),
        bvsStatus,
        releaseStatus: data.releaseStatus || 'NÃO INFORMADO',
        createdAt: data.createdAt ? (data.createdAt.toDate() as Date).toISOString() : null,
      };

      if (bvsStatus === 'SIM') {
        sent.push(item);
      } else {
        pending.push(item);
      }
    });

    return { pending, sent };
  } catch (error) {
    console.error('Erro ao ler fila de BVS no servidor:', error);
    throw new Error('Falha ao carregar fila de relacionamento.');
  }
}

/**
 * Server Action para atualizar o status de BVS (boas-vindas) do aluno
 */
export async function updateBvsStatus(
  enrollmentId: string,
  status: 'SIM' | 'NÃO' | 'NÃO INFORMADO'
): Promise<void> {
  // Exige permissão operacional de alteração
  const user = await requirePermission('enrollments', 'write_operational');

  if (!enrollmentId || !status) {
    throw new Error('ID de matrícula e status são obrigatórios.');
  }

  try {
    const db = getAdminDb();
    
    // Atualiza o status no Firestore
    await db.collection('enrollments').doc(enrollmentId).update({
      bvsStatus: status,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: user.uid,
      updatedByName: user.name,
    });

    // Força revalidação das rotas envolvidas
    revalidatePath('/relacionamento');
    revalidatePath('/matriculas');
    revalidatePath('/');
  } catch (error) {
    console.error('Erro ao atualizar status de BVS no servidor:', error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error('Falha ao alterar status de BVS. Detalhes: ' + message);
  }
}
