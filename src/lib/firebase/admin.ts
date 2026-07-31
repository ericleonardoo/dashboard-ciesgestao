/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Firebase Admin SDK initialization — server-only.
 * 
 * Uses dynamic require() to avoid Turbopack/Webpack bundling firebase-admin
 * and its ESM-only transitive dependencies (jose, jwks-rsa, etc.) which cause
 * ERR_REQUIRE_ESM on Vercel serverless functions.
 */

if (typeof window !== 'undefined') {
  throw new Error('firebase-admin can only be imported in server-side modules.');
}

// Lazy-loaded module references
let _initializeApp: typeof import('firebase-admin/app').initializeApp;
let _getApps: typeof import('firebase-admin/app').getApps;
let _cert: typeof import('firebase-admin/app').cert;
let _getAuth: typeof import('firebase-admin/auth').getAuth;
let _getFirestore: typeof import('firebase-admin/firestore').getFirestore;

function loadModules() {
  if (!_initializeApp) {
    // Dynamic require to bypass bundler — these packages are in serverExternalPackages
    const appModule = require('firebase-admin/app');
    _initializeApp = appModule.initializeApp;
    _getApps = appModule.getApps;
    _cert = appModule.cert;

    const authModule = require('firebase-admin/auth');
    _getAuth = authModule.getAuth;

    const firestoreModule = require('firebase-admin/firestore');
    _getFirestore = firestoreModule.getFirestore;
  }
}

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

function getFormattedPrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  // Remove aspas extras que alguns provedores de hosting adicionam
  let clean = key.trim();
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
    clean = clean.slice(1, -1);
  }
  // Converte literal \n em quebras de linha reais
  return clean.replace(/\\n/g, '\n');
}

const privateKey = getFormattedPrivateKey(rawPrivateKey);

function initializeAdmin() {
  loadModules();
  
  const apps = _getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  // Se o emulador do Firestore estiver rodando, podemos inicializar sem chaves privadas reais
  const isEmulator = !!process.env.FIRESTORE_EMULATOR_HOST || !!process.env.FIREBASE_AUTH_EMULATOR_HOST;

  if (isEmulator) {
    console.info('[Firebase Admin] Inicializando em modo emulador (sem credenciais).');
    return _initializeApp({
      projectId: projectId || 'ciesgestaodashboard',
    });
  }

  // Produção: requer credenciais completas
  if (projectId && clientEmail && privateKey) {
    console.info('[Firebase Admin] Inicializando com credenciais de Service Account.');
    return _initializeApp({
      credential: _cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  // Fallback: sem credenciais completas — funciona para Firestore mas não para Auth.verifyIdToken
  console.warn(
    '[Firebase Admin] AVISO: Inicializando sem credenciais completas. ' +
    'verifyIdToken e createSessionCookie não funcionarão corretamente. ' +
    'Defina FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY na Vercel.'
  );
  return _initializeApp({
    projectId: projectId || 'ciesgestaodashboard',
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedApp: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedAuth: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedDb: any = null;

export function getAdminApp() {
  if (!cachedApp) {
    cachedApp = initializeAdmin();
  }
  return cachedApp;
}

export function getAdminAuth() {
  if (!cachedAuth) {
    loadModules();
    cachedAuth = _getAuth(getAdminApp());
  }
  return cachedAuth;
}

export function getAdminDb() {
  if (!cachedDb) {
    loadModules();
    cachedDb = _getFirestore(getAdminApp());
  }
  return cachedDb;
}
