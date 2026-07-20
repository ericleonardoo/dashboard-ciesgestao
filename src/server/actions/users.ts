'use server';

import { getAdminAuth, getAdminDb } from '../../lib/firebase/admin';
import { requirePermission } from '../../lib/permissions';
import { getCurrentUserPermissions, UserPermissions } from '../../lib/firebase/auth-session';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';

export interface CreateColaboradorInput {
  email: string;
  name: string;
  areas: string[];
}

interface DemoUser {
  uid: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  areas: string[];
  createdAt: string;
}

const DEMO_USERS_FILE = path.join(process.cwd(), 'src/lib/demo-users-data.json');

const DEFAULT_DEMO_USERS: DemoUser[] = [
  {
    uid: 'demo-user-gestao',
    name: 'Elen Sena',
    email: 'elen.sena@ciesmg.com.br',
    status: 'active',
    areas: ['gestao'],
    createdAt: new Date().toISOString()
  },
  {
    uid: 'demo-user-relacionamento',
    name: 'Nayara Silva',
    email: 'nayara.silva@ciesmg.com.br',
    status: 'active',
    areas: ['relacionamento'],
    createdAt: new Date().toISOString()
  },
  {
    uid: 'demo-user-bia',
    name: 'Bia Costa',
    email: 'bia.costa@ciesmg.com.br',
    status: 'active',
    areas: ['administrativo', 'marketing', 'comercial'],
    createdAt: new Date().toISOString()
  },
  {
    uid: 'demo-user-ninha',
    name: 'Ninha Santos',
    email: 'ninha.santos@ciesmg.com.br',
    status: 'active',
    areas: ['comercial'],
    createdAt: new Date().toISOString()
  },
  {
    uid: 'demo-user-eric',
    name: 'Eric Carvalho',
    email: 'eric.carvalho@ciesmg.com.br',
    status: 'active',
    areas: ['relacionamento'],
    createdAt: new Date().toISOString()
  }
];

function getDemoUsersList(): DemoUser[] {
  try {
    if (fs.existsSync(DEMO_USERS_FILE)) {
      const data = fs.readFileSync(DEMO_USERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Erro ao ler demo-users-data.json:', err);
  }
  return DEFAULT_DEMO_USERS;
}

function saveDemoUsersList(users: DemoUser[]) {
  try {
    fs.writeFileSync(DEMO_USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao salvar demo-users-data.json:', err);
  }
}

/**
 * Server Action para carregar a lista de colaboradores do banco (somente administradores)
 */
export async function getColaboradores() {
  await requirePermission('users', 'read');

  const session = await getCurrentUserPermissions();
  if (session && session.uid.startsWith('demo-user-')) {
    const list = getDemoUsersList();
    return list.map(u => ({
      uid: u.uid,
      name: u.name,
      email: u.email,
      status: u.status,
      areas: u.areas,
      createdAt: u.createdAt,
    }));
  }

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

  const session = await getCurrentUserPermissions();
  if (session && session.uid.startsWith('demo-user-')) {
    const list = getDemoUsersList();
    if (list.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('O e-mail inserido já está cadastrado em outra conta.');
    }

    const temporaryPassword = Math.random().toString(36).substring(2, 10) + 'A1!';
    const newUid = `demo-user-colab-${Math.random().toString(36).substring(2, 9)}`;
    const newColab: DemoUser = {
      uid: newUid,
      name,
      email,
      status: 'active',
      areas,
      createdAt: new Date().toISOString(),
    };
    list.push(newColab);
    saveDemoUsersList(list);

    revalidatePath('/colaboradores');
    return {
      uid: newUid,
      temporaryPassword,
    };
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

/**
 * Server Action para obter lista simplificada de colaboradores ativos (para dropdowns de formulário)
 */
export async function getColaboradoresDropdown() {
  const user = await getCurrentUserPermissions();
  if (!user || user.status !== 'active') {
    throw new Error('UNAUTHORIZED: Usuário não autenticado ou inativo.');
  }

  if (user.uid.startsWith('demo-user-')) {
    const list = getDemoUsersList();
    return list
      .filter(u => u.status === 'active')
      .map(u => ({
        uid: u.uid,
        name: u.name,
      }));
  }

  try {
    const snapshot = await getAdminDb()
      .collection('users')
      .where('status', '==', 'active')
      .select('name')
      .get();

    return snapshot.docs.map((doc) => ({
      uid: doc.id,
      name: doc.data().name || '',
    }));
  } catch (error) {
    console.error('Erro ao listar colaboradores para dropdown:', error);
    throw new Error('Falha ao obter lista de responsáveis.');
  }
}
