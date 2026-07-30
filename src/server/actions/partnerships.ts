'use server';

import { getAdminDb } from '../../lib/firebase/admin';
import { requirePermission } from '../../lib/permissions';
import { Partnership, partnershipSchema, normalizeCnpj } from '../../lib/validation/partnership-schema';
import { revalidatePath } from 'next/cache';

const COLLECTION = 'partnerships';

export async function getPartnerships(filters?: {
  status?: string;
  segment?: string;
  ownerId?: string;
  search?: string;
}): Promise<Partnership[]> {
  const user = await requirePermission('partnerships', 'read');

  try {
    const db = getAdminDb();
    let query: FirebaseFirestore.Query = db.collection(COLLECTION);

    const isGestao = user.areas.includes('gestao') || user.areas.includes('administrativo');
    if (!isGestao) {
      query = query.where('ownerId', '==', user.uid);
    } else if (filters?.ownerId && filters.ownerId !== 'todos') {
      query = query.where('ownerId', '==', filters.ownerId);
    }

    if (filters?.status && filters.status !== 'todos') {
      query = query.where('status', '==', filters.status);
    }

    if (filters?.segment && filters.segment !== 'todos') {
      query = query.where('segment', '==', filters.segment);
    }

    query = query.orderBy('createdAt', 'desc');

    const snapshot = await query.get();
    let companies = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt && typeof data.createdAt.toDate === 'function'
          ? data.createdAt.toDate().toISOString()
          : data.createdAt,
        updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function'
          ? data.updatedAt.toDate().toISOString()
          : data.updatedAt,
      } as Partnership;
    });

    if (filters?.search) {
      const term = filters.search.toLowerCase().trim();
      const termCnpj = normalizeCnpj(term);
      companies = companies.filter(c =>
        c.companyName.toLowerCase().includes(term) ||
        (c.cnpj && normalizeCnpj(c.cnpj).includes(termCnpj)) ||
        c.contactName.toLowerCase().includes(term) ||
        (c.ownerName && c.ownerName.toLowerCase().includes(term))
      );
    }

    return companies;
  } catch (error) {
    console.error('Erro ao buscar empresas B2B:', error);
    throw new Error('Falha ao carregar convênios do banco de dados.');
  }
}

export async function createPartnership(data: unknown) {
  const user = await requirePermission('partnerships', 'write');

  const parsed = partnershipSchema.parse(data);
  const cleanCnpj = normalizeCnpj(parsed.cnpj);

  try {
    const db = getAdminDb();

    // Verificação de Duplicidade por CNPJ ou Razão Social
    if (cleanCnpj) {
      const existingCnpj = await db.collection(COLLECTION).where('cnpj', '==', parsed.cnpj).get();
      if (!existingCnpj.empty) {
        return { success: false, error: 'Já existe uma empresa cadastrada com este CNPJ.' };
      }
    }

    const docRef = db.collection(COLLECTION).doc();
    const now = new Date().toISOString();

    const partnershipData = {
      ...parsed,
      id: docRef.id,
      ownerId: parsed.ownerId || user.uid,
      createdBy: user.uid,
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(partnershipData);

    // Registra atividade B2B inicial
    await db.collection('salesActivities').add({
      actorId: user.uid,
      type: 'PROSPECTING',
      entityType: 'COMPANY',
      entityId: docRef.id,
      occurredAt: now,
      notes: `Empresa ${parsed.companyName} prospectada por ${parsed.ownerName || user.name}.`,
      source: 'AUTO',
      createdAt: now,
    });

    revalidatePath('/convenios');
    return { success: true, id: docRef.id, data: partnershipData };
  } catch (error: unknown) {
    console.error('Erro ao criar convênio:', error);
    const msg = error instanceof Error ? error.message : 'Falha ao criar convênio.';
    return { success: false, error: msg };
  }
}

export async function updatePartnership(id: string, data: unknown) {
  const user = await requirePermission('partnerships', 'write');

  try {
    const db = getAdminDb();
    const docRef = db.collection(COLLECTION).doc(id);
    const existingSnap = await docRef.get();

    if (!existingSnap.exists) {
      return { success: false, error: 'Empresa não encontrada.' };
    }

    const existingData = existingSnap.data() as Partnership;
    const isGestao = user.areas.includes('gestao') || user.areas.includes('administrativo');

    if (!isGestao && existingData.ownerId !== user.uid) {
      return { success: false, error: 'Você não tem permissão para editar empresas de outro consultor.' };
    }

    const parsed = partnershipSchema.partial().parse(data);
    const now = new Date().toISOString();

    const updateData: Record<string, unknown> = {
      ...parsed,
      updatedBy: user.uid,
      updatedAt: now,
    };

    await docRef.update(updateData);

    if (parsed.ownerId && parsed.ownerId !== existingData.ownerId) {
      await db.collection('auditLogs').add({
        actorId: user.uid,
        action: 'COMPANY_REASSIGN',
        entityType: 'COMPANY',
        entityId: id,
        changedFields: {
          previousOwnerId: existingData.ownerId,
          newOwnerId: parsed.ownerId,
        },
        timestamp: now,
      });
    }

    revalidatePath('/convenios');
    return { success: true };
  } catch (error: unknown) {
    console.error('Erro ao atualizar convênio:', error);
    const msg = error instanceof Error ? error.message : 'Falha ao atualizar convênio.';
    return { success: false, error: msg };
  }
}

export async function deletePartnership(id: string) {
  const user = await requirePermission('partnerships', 'write');

  if (!user.areas.includes('gestao') && !user.areas.includes('administrativo')) {
    return { success: false, error: 'Apenas a Gestão pode excluir convênios.' };
  }

  try {
    await getAdminDb().collection(COLLECTION).doc(id).delete();
    revalidatePath('/convenios');
    return { success: true };
  } catch (error: unknown) {
    console.error('Erro ao excluir convênio:', error);
    const msg = error instanceof Error ? error.message : 'Falha ao excluir convênio.';
    return { success: false, error: msg };
  }
}
