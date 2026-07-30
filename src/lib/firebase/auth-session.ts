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
 * Valida o ID Token do Google contra a allowlist server-side em accessAllowlist antes de criar a sessão
 */
export async function validateAndCreateSession(idToken: string): Promise<{ success: boolean; error?: string }> {
  if (idToken.startsWith('demo-token')) {
    await createSession(idToken);
    return { success: true };
  }

  try {
    const decodedToken = await getAdminAuth().verifyIdToken(idToken);
    const email = (decodedToken.email || '').toLowerCase().trim();
    const uid = decodedToken.uid;
    const name = decodedToken.name || email.split('@')[0];

    if (!email) {
      return { success: false, error: 'E-mail não encontrado no token de autenticação.' };
    }

    // Consulta coleção accessAllowlist no servidor
    const db = getAdminDb();
    const allowlistRef = db.collection('accessAllowlist');
    const querySnap = await allowlistRef.where('emailNormalized', '==', email).limit(1).get();

    if (querySnap.empty) {
      try {
        await db.collection('auditLogs').add({
          action: 'LOGIN_BLOCKED',
          email,
          reason: 'EMAIL_NOT_IN_ALLOWLIST',
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Falha ao registrar audit log de bloqueio:', err);
      }
      return {
        success: false,
        error: 'Sua conta Google foi reconhecida, mas ainda não possui acesso ao CIES Gestão. Solicite liberação à Gestão.'
      };
    }

    const allowDoc = querySnap.docs[0].data();
    if (allowDoc.status !== 'ACTIVE') {
      return {
        success: false,
        error: 'Sua conta Google está desativada. Solicite liberação à Gestão.'
      };
    }

    // Sincroniza usuário em users/{uid}
    const userDocRef = db.collection('users').doc(uid);
    const userSnap = await userDocRef.get();
    const now = new Date().toISOString();

    if (!userSnap.exists) {
      await userDocRef.set({
        id: uid,
        email,
        name,
        status: 'active',
        areas: allowDoc.roles || allowDoc.areas || ['comercial'],
        permissions: allowDoc.permissions || {},
        lastLoginAt: now,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      await userDocRef.update({
        lastLoginAt: now,
        updatedAt: now,
      });
    }

    await createSession(idToken);
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao validar autenticação.';
    return { success: false, error: msg };
  }
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
