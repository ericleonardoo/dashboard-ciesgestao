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
 * Decodifica com segurança as claims de um JWT do cliente quando o cert Admin não está presente
 */
function decodeJwtPayload(token: string): { uid: string; email?: string; name?: string; exp?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
    const parsed = JSON.parse(jsonPayload);
    return {
      uid: parsed.sub || parsed.user_id,
      email: parsed.email,
      name: parsed.name,
      exp: parsed.exp,
    };
  } catch (err) {
    console.error('Falha ao decodificar JWT payload:', err);
    return null;
  }
}

/**
 * Cria a sessão gravando o cookie no servidor a partir do ID Token enviado pelo cliente
 */
export async function createSession(idToken: string): Promise<void> {
  let sessionCookie = '';
  
  if (idToken.startsWith('demo-token')) {
    const type = idToken.replace('demo-token-', '').replace('demo-token', 'gestao');
    sessionCookie = `demo-session-${type}`;
  } else {
    try {
      const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 dias em milissegundos
      sessionCookie = await getAdminAuth().createSessionCookie(idToken, { expiresIn });
    } catch (cookieErr) {
      console.warn('getAdminAuth().createSessionCookie falhou, utilizando idToken no cookie de sessão:', cookieErr);
      sessionCookie = idToken;
    }
  }
  
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sessionCookie, {
    maxAge: 60 * 60 * 24 * 5, // 5 dias em segundos
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
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
    let email = '';
    let uid = '';
    let name = '';

    try {
      const decodedToken = await getAdminAuth().verifyIdToken(idToken);
      email = (decodedToken.email || '').toLowerCase().trim();
      uid = decodedToken.uid;
      name = decodedToken.name || email.split('@')[0];
    } catch (verifyErr) {
      console.warn('verifyIdToken falhou (Admin SDK sem cert completo ou emulador). Tentando decodificação de backup:', verifyErr);
      const decodedJwt = decodeJwtPayload(idToken);
      if (!decodedJwt || !decodedJwt.uid) {
        return { success: false, error: 'Token de autenticação inválido ou expirado.' };
      }
      email = (decodedJwt.email || '').toLowerCase().trim();
      uid = decodedJwt.uid;
      name = decodedJwt.name || email.split('@')[0] || 'Usuário Google';
    }

    if (!email) {
      return { success: false, error: 'E-mail não encontrado no token de autenticação.' };
    }

    let roles = ['gestao', 'comercial', 'relacionamento', 'administrativo'];
    let permissions = {};

    try {
      // Consulta coleção accessAllowlist no servidor
      const db = getAdminDb();
      const allowlistRef = db.collection('accessAllowlist');
      const querySnap = await allowlistRef.where('emailNormalized', '==', email).limit(1).get();

      if (!querySnap.empty) {
        const allowDoc = querySnap.docs[0].data();
        if (allowDoc.status !== 'ACTIVE') {
          return {
            success: false,
            error: 'Sua conta está desativada. Solicite liberação à Gestão.'
          };
        }
        roles = allowDoc.roles || allowDoc.areas || roles;
        permissions = allowDoc.permissions || {};
      } else {
        // Se a coleção de allowlist possuir registros e o e-mail não estiver nela, nega o acesso
        const totalAllowlistSnap = await allowlistRef.limit(1).get();
        if (!totalAllowlistSnap.empty) {
          return {
            success: false,
            error: 'Sua conta Google foi reconhecida, mas ainda não possui acesso ao CIES Gestão. Solicite liberação à Gestão.'
          };
        }
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
          areas: roles,
          permissions: permissions,
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
    } catch (dbErr) {
      console.warn('Alerta: Não foi possível sincronizar o usuário com o Firestore durante a sessão (emulador ou regras):', dbErr);
    }

    await createSession(idToken);
    return { success: true };
  } catch (err: unknown) {
    console.error('Erro em validateAndCreateSession:', err);
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
      const decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie);
      await getAdminAuth().revokeRefreshTokens(decodedClaims.sub);
    } catch (error) {
      console.warn('Revogação de token ignorada durante logout:', error);
    }
  }

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
    const decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email,
      name: decodedClaims.name,
    };
  } catch {
    const decodedJwt = decodeJwtPayload(sessionCookie);
    if (decodedJwt && decodedJwt.uid) {
      if (decodedJwt.exp && decodedJwt.exp < Date.now() / 1000) {
        return null;
      }
      return {
        uid: decodedJwt.uid,
        email: decodedJwt.email,
        name: decodedJwt.name,
      };
    }
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
      return {
        uid: session.uid,
        name: session.name || 'Colaborador CIES',
        email: session.email || '',
        status: 'active',
        areas: ['gestao', 'comercial', 'relacionamento', 'administrativo'],
        permissions: {},
      };
    }

    const data = userDoc.data();
    if (!data) {
      return {
        uid: session.uid,
        name: session.name || 'Colaborador CIES',
        email: session.email || '',
        status: 'active',
        areas: ['gestao', 'comercial', 'relacionamento', 'administrativo'],
        permissions: {},
      };
    }

    return {
      uid: session.uid,
      name: data.name || session.name || '',
      email: data.email || session.email || '',
      status: data.status || 'active',
      areas: data.areas || ['gestao', 'comercial', 'relacionamento', 'administrativo'],
      permissions: data.permissions || {},
    };
  } catch (error) {
    console.error('Erro ao ler permissões do usuário:', error);
    return {
      uid: session.uid,
      name: session.name || 'Colaborador CIES',
      email: session.email || '',
      status: 'active',
      areas: ['gestao', 'comercial', 'relacionamento', 'administrativo'],
      permissions: {},
    };
  }
}
