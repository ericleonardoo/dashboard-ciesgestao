'use server';

import { getAdminDb } from '../../lib/firebase/admin';
import { requirePermission } from '../../lib/permissions';
import { Campaign, campaignSchema } from '../../lib/validation/campaign-schema';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

const COLLECTION = 'campaigns';

export async function getCampaigns(): Promise<Campaign[]> {
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
      } as Campaign;
    });
  } catch (error) {
    console.error('Erro ao buscar campanhas:', error);
    throw new Error('Falha ao carregar campanhas de marketing.');
  }
}

export async function createCampaign(data: Omit<Campaign, 'id'>) {
  const user = await requirePermission(COLLECTION, 'write');

  const parsed = campaignSchema.parse(data);

  try {
    const docRef = getAdminDb().collection(COLLECTION).doc();
    await docRef.set({
      ...parsed,
      createdBy: user.uid,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    revalidatePath('/marketing');
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Erro ao criar campanha:', error);
    throw new Error('Falha ao criar campanha de marketing.');
  }
}

export async function updateCampaign(id: string, data: Partial<Campaign>) {
  await requirePermission(COLLECTION, 'write');

  try {
    const updateData = { ...data, updatedAt: FieldValue.serverTimestamp() };
    delete updateData.id;

    await getAdminDb().collection(COLLECTION).doc(id).update(updateData);

    revalidatePath('/marketing');
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar campanha:', error);
    throw new Error('Falha ao atualizar.');
  }
}
