'use server';

import { getAdminAuth, getAdminDb } from '../../lib/firebase/admin';
import { requirePermission } from '../../lib/permissions';
import { getCurrentUserPermissions, UserPermissions } from '../../lib/firebase/auth-session';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

export interface CreateColaboradorInput {
  email: string;
  name: string;
  areas: string[];
}

/**
 * Server Action para carregar a lista de colaboradores do banco (somente administradores)
 */
export async function getColaboradores() {
  await requirePermission('users', 'read');

  try {
    const usersSnapshot = await getAdminDb().collection('users').orderBy('name', 'asc').get();
    
    return usersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        uid: doc.id,
        name: data.name || '',
        email: data.email || '',
        status: data.status || 'inactive',
        areas: data.areas || [],
        createdAt: data.createdAt ? (data.createdAt.toDate() as Date).toISOString() : null,
      };
    });
  } catch (error) {
    console.error('Erro ao listar colaboradores no servidor:', error);
    throw new Error('Falha ao listar colaboradores no banco.');
  }
}

/**
 * Server Action para criar um novo colaborador via Admin SDK e persistir perfil no Firestore
 */
export async function createColaborador(input: CreateColaboradorInput) {
  // Garante que o solicitante seja do papel Gestao/Admin
  await requirePermission('users', 'write');

  const { email, name, areas } = input;

  if (!email || !name || areas.length === 0) {
    throw new Error('Todos os campos obrigatórios devem ser preenchidos.');
  }

  // Gera uma senha aleatória temporária para a criação do usuário no Firebase Auth
  const temporaryPassword = Math.random().toString(36).substring(2, 10) + 'A1!';

  try {
    // 1. Cria a conta no Firebase Authentication
    const userRecord = await getAdminAuth().createUser({
      email,
      password: temporaryPassword,
      displayName: name,
      emailVerified: true,
    });

    // 2. Cria o documento de perfil correspondente no Cloud Firestore
    await getAdminDb().collection('users').doc(userRecord.uid).set({
      name,
      email,
      status: 'active',
      areas,
      permissions: {},
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Revalida o cache da página de colaboradores
    revalidatePath('/colaboradores');

    return {
      uid: userRecord.uid,
      temporaryPassword, // Devolvemos para exibição temporária na tela (Admin anota e entrega ao usuário)
    };
  } catch (error) {
    console.error('Erro ao criar colaborador no servidor:', error);
    const firebaseError = error as { code?: string; message?: string };
    if (firebaseError.code === 'auth/email-already-exists') {
      throw new Error('O e-mail inserido já está cadastrado em outra conta.');
    }
    throw new Error('Falha ao criar conta de colaborador. Detalhes: ' + (firebaseError.message || String(error)));
  }
}

/**
 * Server Action para obter o perfil do colaborador autenticado da sessão
 */
export async function getCurrentProfile(): Promise<UserPermissions | null> {
  try {
    return await getCurrentUserPermissions();
  } catch {
    return null;
  }
}
