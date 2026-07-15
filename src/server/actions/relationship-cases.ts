'use server';

import { getAdminDb } from '../../lib/firebase/admin';
import { requirePermission } from '../../lib/permissions';
import { RelationshipCase, relationshipCaseSchema } from '../../lib/validation/relationship-case-schema';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

const COLLECTION = 'relationship-cases';

export async function getRelationshipCases(): Promise<RelationshipCase[]> {
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
      } as RelationshipCase;
    });
  } catch (error) {
    console.error('Erro ao buscar casos de relacionamento:', error);
    throw new Error('Falha ao carregar casos de relacionamento.');
  }
}

export async function createRelationshipCase(data: Omit<RelationshipCase, 'id'>) {
  const user = await requirePermission(COLLECTION, 'write');

  const parsed = relationshipCaseSchema.parse(data);

  try {
    const docRef = getAdminDb().collection(COLLECTION).doc();
    await docRef.set({
      ...parsed,
      createdBy: user.uid,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    revalidatePath('/relacionamento/casos');
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Erro ao criar caso de relacionamento:', error);
    throw new Error('Falha ao criar caso de relacionamento.');
  }
}

export async function updateRelationshipCase(id: string, data: Partial<RelationshipCase>) {
  await requirePermission(COLLECTION, 'write');

  try {
    const updateData = { ...data, updatedAt: FieldValue.serverTimestamp() };
    delete updateData.id;

    await getAdminDb().collection(COLLECTION).doc(id).update(updateData);

    revalidatePath('/relacionamento/casos');
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar caso de relacionamento:', error);
    throw new Error('Falha ao atualizar o caso.');
  }
}
