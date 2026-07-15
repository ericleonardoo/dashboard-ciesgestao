import { cookies } from 'next/headers';
import { getAdminAuth, getAdminDb } from './admin';

if (typeof window !== 'undefined') {
  throw new Error('auth-session can only be imported in server-side modules.');
}

const COOKIE_NAME = '__session'; // Obrigatório para compatibilidade com Firebase CDN/App Hosting

export interface UserSession {
  uid: string;
  email?: string;
  name?: string;
}

export interface UserPermissions {
  uid: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  areas: string[];
  permissions: Record<string, string[]>;
}

/**
 * Cria a sessão gravando o cookie no servidor a partir do ID Token enviado pelo cliente
 */
export async function createSession(idToken: string): Promise<void> {
  let sessionCookie = '';
  
  if (idToken === 'demo-token' || idToken === 'demo-token-gestao') {
    sessionCookie = 'demo-session-gestao';
  } else if (idToken === 'demo-token-relacionamento') {
    sessionCookie = 'demo-session-relacionamento';
  } else if (idToken === 'demo-token-administrativo') {
    sessionCookie = 'demo-session-administrativo';
  } else {
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 dias em milissegundos
    sessionCookie = await getAdminAuth().createSessionCookie(idToken, { expiresIn });
  }
  
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sessionCookie, {
    maxAge: 60 * 60 * 24 * 5, // 5 dias em segundos
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
}

/**
 * Destrói a sessão, limpando o cookie e revogando os tokens de autenticação
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME)?.value;

  if (sessionCookie && !sessionCookie.startsWith('demo-session-')) {
    try {
      // Verifica e decodifica o cookie para obter o UID
      const decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie);
      // Revoga todos os tokens ativos do usuário
      await getAdminAuth().revokeRefreshTokens(decodedClaims.sub);
    } catch (error) {
      // Ignora falhas se o cookie já era inválido/expirado
      console.warn('Revogação de token falhou durante o logout:', error);
    }
  }

  // Remove o cookie da resposta
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Valida a sessão ativa lendo o cookie e decodificando as claims do Firebase
 */
export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return null;
  }

  if (sessionCookie === 'demo-session-gestao') {
    return {
      uid: 'demo-user-gestao',
      email: 'gestao@ciesmg.com.br',
      name: 'Demonstração (Gestão)',
    };
  }

  if (sessionCookie === 'demo-session-relacionamento') {
    return {
      uid: 'demo-user-relacionamento',
      email: 'relacionamento@ciesmg.com.br',
      name: 'Demonstração (Relacionamento)',
    };
  }

  if (sessionCookie === 'demo-session-administrativo') {
    return {
      uid: 'demo-user-administrativo',
      email: 'admin@ciesmg.com.br',
      name: 'Demonstração (Administrativo)',
    };
  }

  try {
    // Valida o cookie forçando verificação de revogação de tokens
    const decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    
    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email,
      name: decodedClaims.name,
    };
  } catch {
    // Se o cookie for expirado ou inválido, retorna null
    return null;
  }
}

/**
 * Carrega os dados de perfil e permissões do banco para o usuário logado
 */
export async function getCurrentUserPermissions(): Promise<UserPermissions | null> {
  const session = await getSession();
  if (!session) {
    return null;
  }

  if (session.uid === 'demo-user-gestao') {
    return {
      uid: 'demo-user-gestao',
      name: 'Demonstração (Gestão)',
      email: 'gestao@ciesmg.com.br',
      status: 'active',
      areas: ['gestao'],
      permissions: {},
    };
  }

  if (session.uid === 'demo-user-relacionamento') {
    return {
      uid: 'demo-user-relacionamento',
      name: 'Demonstração (Relacionamento)',
      email: 'relacionamento@ciesmg.com.br',
      status: 'active',
      areas: ['relacionamento'],
      permissions: {},
    };
  }

  if (session.uid === 'demo-user-administrativo') {
    return {
      uid: 'demo-user-administrativo',
      name: 'Demonstração (Administrativo)',
      email: 'admin@ciesmg.com.br',
      status: 'active',
      areas: ['administrativo'],
      permissions: {},
    };
  }

  try {
    const userDoc = await getAdminDb().collection('users').doc(session.uid).get();
    if (!userDoc.exists) {
      return null;
    }

    const data = userDoc.data();
    if (!data) {
      return null;
    }

    return {
      uid: session.uid,
      name: data.name || '',
      email: data.email || '',
      status: data.status || 'inactive',
      areas: data.areas || [],
      permissions: data.permissions || {},
    };
  } catch (error) {
    console.error('Erro ao ler permissões do usuário:', error);
    return null;
  }
}
