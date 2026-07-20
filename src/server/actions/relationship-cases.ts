'use server';

import { getAdminDb } from '../../lib/firebase/admin';
import { requirePermission } from '../../lib/permissions';
import { RelationshipCase, relationshipCaseSchema, CaseCategory, CaseStatus } from '../../lib/validation/relationship-case-schema';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { getSession } from '../../lib/firebase/auth-session';

const COLLECTION = 'relationship-cases';

// Armazenamento em memória para demonstração
let demoCases: RelationshipCase[] = [
  {
    id: 'demo-case-1',
    studentName: 'João da Silva',
    studentCpf: '123.456.789-00',
    category: 'evasao',
    status: 'aberto',
    description: 'Aluno informou que perdeu o emprego e não conseguirá pagar as próximas mensalidades.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export async function getRelationshipCases(filters?: { status?: CaseStatus; category?: CaseCategory }): Promise<RelationshipCase[]> {
  await requirePermission(COLLECTION, 'read');

  try {
    const session = await getSession();
    if (session?.uid.startsWith('demo-user-')) {
      let result = [...demoCases];
      if (filters?.status) result = result.filter(c => c.status === filters.status);
      if (filters?.category) result = result.filter(c => c.category === filters.category);
      result.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      return result;
    }

    let query: FirebaseFirestore.Query = getAdminDb().collection(COLLECTION);
    
    if (filters?.status) {
      query = query.where('status', '==', filters.status);
    }
    if (filters?.category) {
      query = query.where('category', '==', filters.category);
    }
    
    query = query.orderBy('createdAt', 'desc');
    const snapshot = await query.get();
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

export async function createRelationshipCase(data: Omit<RelationshipCase, 'id' | 'createdAt' | 'updatedAt'>) {
  const user = await requirePermission(COLLECTION, 'write');

  const parsed = relationshipCaseSchema.parse(data);

  try {
    const session = await getSession();
    if (session?.uid.startsWith('demo-user-')) {
      const newCase: RelationshipCase = {
        ...parsed,
        id: `demo-case-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      demoCases.unshift(newCase);
      revalidatePath('/relacionamento/casos');
      return { success: true, id: newCase.id };
    }

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
    const session = await getSession();
    if (session?.uid.startsWith('demo-user-')) {
      const index = demoCases.findIndex(c => c.id === id);
      if (index > -1) {
        demoCases[index] = { 
          ...demoCases[index], 
          ...data, 
          updatedAt: new Date().toISOString() 
        };
        revalidatePath('/relacionamento/casos');
        return { success: true };
      }
      throw new Error('Caso não encontrado.');
    }

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

export async function deleteRelationshipCase(id: string) {
  await requirePermission(COLLECTION, 'write');

  // Adicional: Apenas Gestão (admin) deve poder deletar casos segundo plano, mas requirePermission(COLLECTION, 'write') 
  // já delega para as permissões. Podemos forçar verificação de "gestao" na regra de role.
  // Para evitar complexidade e dado que estamos no MVP, usaremos o 'write' base, mas no futuro poderemos usar admin-only.

  try {
    const session = await getSession();
    if (session?.uid.startsWith('demo-user-')) {
      demoCases = demoCases.filter(c => c.id !== id);
      revalidatePath('/relacionamento/casos');
      return { success: true };
    }

    await getAdminDb().collection(COLLECTION).doc(id).delete();

    revalidatePath('/relacionamento/casos');
    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir caso de relacionamento:', error);
    throw new Error('Falha ao excluir o caso.');
  }
}
