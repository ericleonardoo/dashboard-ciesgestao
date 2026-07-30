import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyB2Mfe0AIPXKK6YeaGdC8B4kvn-YbIHO5g',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'ciesgestaodashboard.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'ciesgestaodashboard',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'ciesgestaodashboard.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '563990213840',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:563990213840:web:93ed9c7cd3f5cf031f1ad5',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-JZ8VL42WSV',
};

// Inicializa a aplicação Firebase garantindo instância única
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

// Conexão com emuladores locais apenas quando explicitamente solcitado por variável de ambiente
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  // Conectar ao emulador de autenticação
  if (typeof window !== 'undefined') {
    // Evita reconexão dupla se rodar no client HMR
    const authEmulatorConnected = (auth as unknown as { _emulatorConnected?: boolean })._emulatorConnected;
    if (!authEmulatorConnected) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      (auth as unknown as { _emulatorConnected?: boolean })._emulatorConnected = true;
    }
  }

  // Conectar ao emulador de firestore
  const dbEmulatorConnected = (db as unknown as { _emulatorConnected?: boolean })._emulatorConnected;
  if (!dbEmulatorConnected) {
    connectFirestoreEmulator(db, 'localhost', 8080);
    (db as unknown as { _emulatorConnected?: boolean })._emulatorConnected = true;
  }
}

export { app, auth, db };
