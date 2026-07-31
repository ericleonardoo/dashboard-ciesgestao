import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

if (typeof window !== 'undefined') {
  throw new Error('firebase-admin can only be imported in server-side modules.');
}

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

function getFormattedPrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  let clean = key.trim();
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
    clean = clean.slice(1, -1);
  }
  return clean.replace(/\\n/g, '\n');
}

const privateKey = getFormattedPrivateKey(rawPrivateKey);

function initializeAdmin() {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  // Se o emulador do Firestore estiver rodando, podemos inicializar sem chaves privadas reais
  const isEmulator = !!process.env.FIRESTORE_EMULATOR_HOST || !!process.env.FIREBASE_AUTH_EMULATOR_HOST;

  if (isEmulator) {
    return initializeApp({
      projectId: projectId || 'ciesgestaodashboard',
    });
  }

  // Tenta inicializar com credenciais completas se fornecidas no ambiente
  if (projectId && clientEmail && privateKey) {
    try {
      return initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } catch (certErr) {
      console.warn('Aviso: Falha ao carregar cert do Firebase Admin, utilizando fallback de projectId:', certErr);
    }
  }

  // Fallback seguro: inicializa com projectId para não travar o servidor em erro 500
  return initializeApp({
    projectId: projectId || 'ciesgestaodashboard',
  });
}

let cachedApp: ReturnType<typeof initializeApp> | null = null;
let cachedAuth: ReturnType<typeof getAuth> | null = null;
let cachedDb: ReturnType<typeof getFirestore> | null = null;

export function getAdminApp() {
  if (!cachedApp) {
    cachedApp = initializeAdmin();
  }
  return cachedApp;
}

export function getAdminAuth() {
  if (!cachedAuth) {
    cachedAuth = getAuth(getAdminApp());
  }
  return cachedAuth;
}

export function getAdminDb() {
  if (!cachedDb) {
    cachedDb = getFirestore(getAdminApp());
  }
  return cachedDb;
}
