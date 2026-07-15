'use server';

import { getAdminDb } from '../../lib/firebase/admin';
import { requirePermission } from '../../lib/permissions';
import { Lead, leadSchema } from '../../lib/validation/lead-schema';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

const COLLECTION = 'leads';

export async function getLeads(): Promise<Lead[]> {
  await requirePermission(COLLECTION, 'read');

  // Check demo mode (client usually avoids calling this if demo mode is on, but just in case)
  // Demo mode logic is primarily handled in the UI and demo-store.ts

  try {
    const snapshot = await getAdminDb().collection(COLLECTION).orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt ? (data.createdAt.toDate() as Date).toISOString() : undefined,
        updatedAt: data.updatedAt ? (data.updatedAt.toDate() as Date).toISOString() : undefined,
      } as Lead;
    });
  } catch (error) {
    console.error('Erro ao buscar leads:', error);
    throw new Error('Falha ao carregar leads do banco de dados.');
  }
}

export async function createLead(data: Omit<Lead, 'id'>) {
  const user = await requirePermission(COLLECTION, 'write');

  const parsed = leadSchema.parse(data);

  try {
    const docRef = getAdminDb().collection(COLLECTION).doc();
    await docRef.set({
      ...parsed,
      createdBy: user.uid,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    revalidatePath('/leads');
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Erro ao criar lead:', error);
    throw new Error('Falha ao criar lead no banco de dados.');
  }
}

export async function updateLeadStatus(id: string, status: Lead['status'], lossReason?: string) {
  await requirePermission(COLLECTION, 'write');

  try {
    await getAdminDb().collection(COLLECTION).doc(id).update({
      status,
      ...(lossReason ? { lossReason } : {}),
      updatedAt: FieldValue.serverTimestamp(),
    });

    revalidatePath('/leads');
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar status do lead:', error);
    throw new Error('Falha ao atualizar o lead.');
  }
}
