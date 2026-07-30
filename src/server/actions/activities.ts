'use server';

import { getAdminDb } from '../../lib/firebase/admin';
import { requirePermission } from '../../lib/permissions';
import { SalesActivity, activitySchema } from '../../lib/validation/activity-schema';
import { revalidatePath } from 'next/cache';

const COLLECTION = 'salesActivities';

export async function getActivities(filters?: {
  entityId?: string;
  entityType?: 'LEAD' | 'COMPANY';
  actorId?: string;
  limit?: number;
}): Promise<SalesActivity[]> {
  const user = await requirePermission('leads', 'read');

  try {
    const db = getAdminDb();
    let query: FirebaseFirestore.Query = db.collection(COLLECTION);

    if (filters?.entityId) {
      query = query.where('entityId', '==', filters.entityId);
    }

    if (filters?.entityType) {
      query = query.where('entityType', '==', filters.entityType);
    }

    const isGestao = user.areas.includes('gestao') || user.areas.includes('administrativo');
    if (!isGestao && !filters?.entityId) {
      query = query.where('actorId', '==', user.uid);
    } else if (filters?.actorId && filters.actorId !== 'todos') {
      query = query.where('actorId', '==', filters.actorId);
    }

    query = query.orderBy('occurredAt', 'desc').limit(filters?.limit || 50);

    const snapshot = await query.get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        occurredAt: data.occurredAt && typeof data.occurredAt.toDate === 'function'
          ? data.occurredAt.toDate().toISOString()
          : data.occurredAt,
        createdAt: data.createdAt && typeof data.createdAt.toDate === 'function'
          ? data.createdAt.toDate().toISOString()
          : data.createdAt,
      } as SalesActivity;
    });
  } catch (error) {
    console.error('Erro ao buscar atividades comerciais:', error);
    throw new Error('Falha ao carregar linha do tempo.');
  }
}

export async function createActivity(data: unknown) {
  const user = await requirePermission('leads', 'write');

  const parsed = activitySchema.parse(data);
  const now = new Date().toISOString();

  try {
    const db = getAdminDb();
    const docRef = db.collection(COLLECTION).doc();

    const activityData = {
      ...parsed,
      id: docRef.id,
      actorId: parsed.actorId || user.uid,
      actorName: parsed.actorName || user.name,
      occurredAt: parsed.occurredAt || now,
      createdAt: now,
    };

    await docRef.set(activityData);

    revalidatePath('/leads');
    revalidatePath('/convenios');

    return { success: true, id: docRef.id, data: activityData };
  } catch (error: unknown) {
    console.error('Erro ao criar atividade comercial:', error);
    const msg = error instanceof Error ? error.message : 'Falha ao registrar atividade.';
    return { success: false, error: msg };
  }
}
