'use server';

import { getAdminDb } from '../../lib/firebase/admin';
import { requirePermission } from '../../lib/permissions';
import { Partnership, partnershipSchema } from '../../lib/validation/partnership-schema';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

const COLLECTION = 'partnerships';

export async function getPartnerships(): Promise<Partnership[]> {
  await requirePermission(COLLECTION, 'read');

  try {
    const snapshot = await getAdminDb().collection(COLLECTION).orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt ? (data.createdAt.toDate() as Date).toISOString() : undefined,
        updatedAt: data.updatedAt ? (data.updatedAt.toDate() as Date).toISOString() : undefined,
      } as Partnership;
    });
  } catch (error) {
    console.error('Erro ao buscar parcerias:', error);
    throw new Error('Falha ao carregar convênios do banco de dados.');
  }
}

export async function createPartnership(data: Omit<Partnership, 'id'>) {
  const user = await requirePermission(COLLECTION, 'write');

  const parsed = partnershipSchema.parse(data);

  try {
    const docRef = getAdminDb().collection(COLLECTION).doc();
    await docRef.set({
      ...parsed,
      createdBy: user.uid,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    revalidatePath('/convenios');
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Erro ao criar parceria:', error);
    throw new Error('Falha ao criar convênio.');
  }
}

export async function updatePartnership(id: string, data: Partial<Partnership>) {
  await requirePermission(COLLECTION, 'write');

  try {
    // Basic clean up of undefined/invalid data before update
    const updateData = { ...data, updatedAt: FieldValue.serverTimestamp() };
    delete updateData.id;

    await getAdminDb().collection(COLLECTION).doc(id).update(updateData);

    revalidatePath('/convenios');
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar convênio:', error);
    throw new Error('Falha ao atualizar.');
  }
}
