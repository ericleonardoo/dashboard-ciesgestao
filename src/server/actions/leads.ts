'use server';

import { getAdminDb } from '../../lib/firebase/admin';
import { requirePermission } from '../../lib/permissions';
import { Lead, leadSchema, normalizePhone } from '../../lib/validation/lead-schema';
import { revalidatePath } from 'next/cache';

const COLLECTION = 'leads';

export async function getLeads(filters?: {
  status?: string;
  source?: string;
  ownerId?: string;
  search?: string;
}): Promise<Lead[]> {
  const user = await requirePermission('leads', 'read');

  try {
    const db = getAdminDb();
    let query: FirebaseFirestore.Query = db.collection(COLLECTION);

    // Se o usuário não for da gestão/admin, restringe a busca à própria carteira (ownerId === uid)
    const isGestao = user.areas.includes('gestao') || user.areas.includes('administrativo');
    if (!isGestao) {
      query = query.where('ownerId', '==', user.uid);
    } else if (filters?.ownerId && filters.ownerId !== 'todos') {
      query = query.where('ownerId', '==', filters.ownerId);
    }

    if (filters?.status && filters.status !== 'todos') {
      query = query.where('status', '==', filters.status);
    }

    if (filters?.source && filters.source !== 'todos') {
      query = query.where('source', '==', filters.source);
    }

    query = query.orderBy('createdAt', 'desc');

    const snapshot = await query.get();
    let leads = snapshot.docs.map(doc => {
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
      } as Lead;
    });

    if (filters?.search) {
      const term = filters.search.toLowerCase().trim();
      const termDigits = normalizePhone(term);
      leads = leads.filter(l => 
        l.name.toLowerCase().includes(term) ||
        (l.phoneNormalized && l.phoneNormalized.includes(termDigits)) ||
        l.courseInterest.toLowerCase().includes(term) ||
        (l.ownerName && l.ownerName.toLowerCase().includes(term))
      );
    }

    return leads;
  } catch (error) {
    console.error('Erro ao buscar leads:', error);
    throw new Error('Falha ao carregar leads do banco de dados.');
  }
}

export async function createLead(data: unknown) {
  const user = await requirePermission('leads', 'write');

  const parsed = leadSchema.parse(data);
  const phoneNormalized = normalizePhone(parsed.phone);

  try {
    const db = getAdminDb();
    const docRef = db.collection(COLLECTION).doc();
    const now = new Date().toISOString();

    const leadData = {
      ...parsed,
      id: docRef.id,
      phoneNormalized,
      ownerId: parsed.ownerId || user.uid,
      createdBy: user.uid,
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(leadData);

    // Registra atividade comercial inicial automaticamente
    await db.collection('salesActivities').add({
      actorId: user.uid,
      type: 'NEW_CONTACT',
      entityType: 'LEAD',
      entityId: docRef.id,
      occurredAt: now,
      notes: `Lead criado via canal ${parsed.source} para o curso ${parsed.courseInterest}.`,
      source: 'AUTO',
      createdAt: now,
    });

    revalidatePath('/leads');
    return { success: true, id: docRef.id, data: leadData };
  } catch (error: unknown) {
    console.error('Erro ao criar lead:', error);
    const msg = error instanceof Error ? error.message : 'Falha ao criar lead.';
    return { success: false, error: msg };
  }
}

export async function updateLead(id: string, data: unknown) {
  const user = await requirePermission('leads', 'write');

  try {
    const db = getAdminDb();
    const docRef = db.collection(COLLECTION).doc(id);
    const existingSnap = await docRef.get();

    if (!existingSnap.exists) {
      return { success: false, error: 'Lead não encontrado.' };
    }

    const existingData = existingSnap.data() as Lead;
    const isGestao = user.areas.includes('gestao') || user.areas.includes('administrativo');

    // Consultor comum só pode alterar a própria carteira
    if (!isGestao && existingData.ownerId !== user.uid) {
      return { success: false, error: 'Você não tem permissão para alterar leads de outro consultor.' };
    }

    const parsed = leadSchema.partial().parse(data);
    const now = new Date().toISOString();

    const updateData: Record<string, unknown> = {
      ...parsed,
      updatedBy: user.uid,
      updatedAt: now,
    };

    if (parsed.phone) {
      updateData.phoneNormalized = normalizePhone(parsed.phone);
    }

    await docRef.update(updateData);

    // Registra auditoria se houve redistribuição de carteira (mudança de ownerId)
    if (parsed.ownerId && parsed.ownerId !== existingData.ownerId) {
      await db.collection('auditLogs').add({
        actorId: user.uid,
        action: 'LEAD_REASSIGN',
        entityType: 'LEAD',
        entityId: id,
        changedFields: {
          previousOwnerId: existingData.ownerId,
          newOwnerId: parsed.ownerId,
        },
        timestamp: now,
      });
    }

    // Registra atividade comercial se o status mudou
    if (parsed.status && parsed.status !== existingData.status) {
      await db.collection('salesActivities').add({
        actorId: user.uid,
        type: parsed.status === 'ENROLLED' ? 'ENROLLMENT' : 'FOLLOW_UP',
        entityType: 'LEAD',
        entityId: id,
        occurredAt: now,
        notes: `Status alterado de ${existingData.status} para ${parsed.status}. ${parsed.lossReason ? `Motivo: ${parsed.lossReason}` : ''}`,
        source: 'AUTO',
        createdAt: now,
      });
    }

    revalidatePath('/leads');
    return { success: true };
  } catch (error: unknown) {
    console.error('Erro ao atualizar lead:', error);
    const msg = error instanceof Error ? error.message : 'Falha ao atualizar o lead.';
    return { success: false, error: msg };
  }
}

export async function convertLeadToEnrollment(leadId: string, enrollmentId: string) {
  const user = await requirePermission('leads', 'write');

  try {
    const db = getAdminDb();
    const docRef = db.collection(COLLECTION).doc(leadId);
    const now = new Date().toISOString();

    await docRef.update({
      status: 'ENROLLED',
      convertedEnrollmentId: enrollmentId,
      updatedBy: user.uid,
      updatedAt: now,
    });

    await db.collection('salesActivities').add({
      actorId: user.uid,
      type: 'ENROLLMENT',
      entityType: 'LEAD',
      entityId: leadId,
      occurredAt: now,
      notes: `Lead convertido com sucesso em matrícula (ID: ${enrollmentId}).`,
      source: 'AUTO',
      createdAt: now,
    });

    revalidatePath('/leads');
    return { success: true };
  } catch (error: unknown) {
    console.error('Erro ao converter lead:', error);
    const msg = error instanceof Error ? error.message : 'Falha ao converter lead.';
    return { success: false, error: msg };
  }
}
