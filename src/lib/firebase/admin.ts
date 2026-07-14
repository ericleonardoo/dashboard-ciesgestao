import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

if (typeof window !== 'undefined') {
  throw new Error('firebase-admin can only be imported in server-side modules.');
}

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

function initializeAdmin() {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  // Se o emulador do Firestore estiver rodando, podemos inicializar sem chaves privadas reais
  const isEmulator = !!process.env.FIRESTORE_EMULATOR_HOST || !!process.env.FIREBASE_AUTH_EMULATOR_HOST;

  if (isEmulator) {
    return initializeApp({
      projectId: projectId || 'cies-gestao-dev',
    });
  }

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin SDK environment variables: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.'
    );
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
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
