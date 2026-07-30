'use server';

import { getAdminDb } from '@/lib/firebase/admin';
import { getSession } from '@/lib/firebase/auth-session';
import { campaignSchema, Campaign } from '@/lib/validation/campaign-schema';
import { z } from 'zod';

const COLLECTION_NAME = 'campaigns';

// Armazenamento em memória apenas para a demonstração (evita erros sem banco configurado)
let demoCampaigns: Campaign[] = [
  {
    id: 'demo-initial-1',
    name: 'Campanha Instagram Ads',
    channel: 'Instagram',
    startDate: '2026-07-01',
    costCents: 50000, // R$ 500,00
    leadsCount: 120,
    enrollmentsCount: 15,
    status: 'Ativa'
  }
];

export async function getCampaigns(filters?: { period?: string; channel?: string }) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Não autenticado' };
    }

    if (session.uid.startsWith('demo-user-')) {
      let result = [...demoCampaigns];
      if (filters?.channel && filters.channel !== 'TODOS') {
        result = result.filter(c => c.channel === filters.channel);
      }
      if (filters?.period) {
        result = result.filter(c => c.startDate.startsWith(filters.period!));
      }
      result.sort((a, b) => b.startDate.localeCompare(a.startDate));
      return { success: true, data: result };
    }

    const db = getAdminDb();
    let query: FirebaseFirestore.Query = db.collection(COLLECTION_NAME);

    if (filters?.channel && filters.channel !== 'TODOS') {
      query = query.where('channel', '==', filters.channel);
    }

    // Ordenar por data de início (mais recentes primeiro)
    query = query.orderBy('startDate', 'desc');

    const snapshot = await query.get();
    let campaigns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Campaign[];

    // Filtro em memória pelo período (Mês/Ano) - startDate no formato YYYY-MM-DD
    if (filters?.period) {
      campaigns = campaigns.filter(c => c.startDate.startsWith(filters.period!));
    }

    return { success: true, data: campaigns };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Erro interno.';
    console.error('Erro em campanhas:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: errMessage };
  }
}

export async function createCampaign(data: unknown) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Não autenticado' };
    }

    const parsed = campaignSchema.parse(data);
    
    if (session.uid.startsWith('demo-user-')) {
      const newCampaign = { 
        ...parsed, 
        id: 'demo-' + Date.now(), 
        createdAt: new Date().toISOString() 
      } as Campaign;
      demoCampaigns.push(newCampaign);
      return { success: true, data: newCampaign };
    }

    const db = getAdminDb();
    
    const now = new Date().toISOString();
    const docRef = db.collection(COLLECTION_NAME).doc();
    
    const campaignData = {
      ...parsed,
      id: docRef.id,
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(campaignData);
    
    return { success: true, data: campaignData };
  } catch (error: unknown) {
    console.error('Erro ao criar campanha:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    const errMessage = error instanceof Error ? error.message : 'Erro interno.';
    return { success: false, error: errMessage };
  }
}

export async function updateCampaign(id: string, data: unknown) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Não autenticado' };
    }

    const parsed = campaignSchema.partial().parse(data);

    if (session.uid.startsWith('demo-user-')) {
      const index = demoCampaigns.findIndex(c => c.id === id);
      if (index > -1) {
        demoCampaigns[index] = { ...demoCampaigns[index], ...parsed } as Campaign;
      }
      return { success: true };
    }

    const db = getAdminDb();
    const docRef = db.collection(COLLECTION_NAME).doc(id);

    const updateData = {
      ...parsed,
      updatedAt: new Date().toISOString(),
    };

    await docRef.update(updateData);
    
    return { success: true };
  } catch (error: unknown) {
    console.error('Erro ao atualizar campanha:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    const errMessage = error instanceof Error ? error.message : 'Erro interno.';
    return { success: false, error: errMessage };
  }
}

export async function deleteCampaign(id: string) {
  try {
    const session = await getSession();
    // Somente gestores ou pessoas com permissão de exclusão deveriam poder apagar, mas o auth unificado lida com isso se integrado, ou checamos a role.
    if (!session) {
      return { success: false, error: 'Não autenticado' };
    }

    if (session.uid.startsWith('demo-user-')) {
      demoCampaigns = demoCampaigns.filter(c => c.id !== id);
      return { success: true };
    }

    const db = getAdminDb();
    await db.collection(COLLECTION_NAME).doc(id).delete();
    
    return { success: true };
  } catch (error: unknown) {
    console.error('Erro ao deletar campanha:', error);
    const errMessage = error instanceof Error ? error.message : 'Erro interno.';
    return { success: false, error: errMessage };
  }
}
