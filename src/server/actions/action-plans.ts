'use server';

import { getAdminDb } from '../../lib/firebase/admin';
import { requirePermission } from '../../lib/permissions';
import { ActionPlan, actionPlanSchema, ActionPlanStatus } from '../../lib/validation/action-plan-schema';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

const COLLECTION = 'action-plans';

export async function getActionPlans(): Promise<ActionPlan[]> {
  await requirePermission(COLLECTION, 'read');

  try {
    const snapshot = await getAdminDb().collection(COLLECTION).orderBy('createdAt', 'desc').get();
    return snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt ? (data.createdAt.toDate() as Date).toISOString() : undefined,
        updatedAt: data.updatedAt ? (data.updatedAt.toDate() as Date).toISOString() : undefined,
      } as ActionPlan;
    });
  } catch (error) {
    console.error('Erro ao buscar planos de ação:', error);
    throw new Error('Falha ao carregar planos 5W2H.');
  }
}

export async function createActionPlan(data: Omit<ActionPlan, 'id'>) {
  const user = await requirePermission(COLLECTION, 'write');

  const parsed = actionPlanSchema.parse(data);

  try {
    const docRef = getAdminDb().collection(COLLECTION).doc();
    await docRef.set({
      ...parsed,
      createdBy: user.uid,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    revalidatePath('/planos-acao');
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Erro ao criar plano de ação:', error);
    throw new Error('Falha ao criar plano 5W2H.');
  }
}

export async function updateActionPlanStatus(id: string, status: ActionPlanStatus) {
  await requirePermission(COLLECTION, 'write');

  try {
    await getAdminDb().collection(COLLECTION).doc(id).update({ 
      status, 
      updatedAt: FieldValue.serverTimestamp() 
    });

    revalidatePath('/planos-acao');
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar status do plano de ação:', error);
    throw new Error('Falha ao atualizar plano.');
  }
}

export async function updateActionPlan(id: string, data: Partial<ActionPlan>) {
  await requirePermission(COLLECTION, 'write');

  try {
    const updateData = { ...data, updatedAt: FieldValue.serverTimestamp() };
    delete updateData.id;

    await getAdminDb().collection(COLLECTION).doc(id).update(updateData);

    revalidatePath('/planos-acao');
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar plano de ação:', error);
    throw new Error('Falha ao atualizar plano de ação.');
  }
}

export async function deleteActionPlan(id: string) {
  await requirePermission(COLLECTION, 'write');

  try {
    await getAdminDb().collection(COLLECTION).doc(id).delete();
    revalidatePath('/planos-acao');
    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir plano de ação:', error);
    throw new Error('Falha ao excluir plano de ação.');
  }
}
