import { describe, it, beforeAll, afterAll, beforeEach, expect } from 'vitest';
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';

let testEnv: RulesTestEnvironment;

describe('Firestore Security Rules', () => {
  beforeAll(async () => {
    // Inicializa o ambiente de teste apontando para o emulador do firestore local
    testEnv = await initializeTestEnvironment({
      projectId: 'cies-gestao-test-project',
      firestore: {
        host: 'localhost',
        port: 8080,
        rules: readFileSync(resolve(__dirname, '../../firestore.rules'), 'utf8'),
      },
    });
  });

  beforeEach(async () => {
    // Limpa a base de dados do emulador antes de cada teste
    await testEnv.clearFirestore();
  });

  afterAll(async () => {
    // Finaliza o ambiente de teste
    await testEnv.cleanup();
  });

  it('deve bloquear qualquer leitura por padrao para usuario nao autenticado', async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const docRef = unauthedDb.collection('users').doc('any-user');
    
    // Esperamos que a leitura falhe com erro de permissao
    await expect(docRef.get()).rejects.toThrow();
  });

  it('deve permitir que o usuario autenticado leia seu proprio perfil', async () => {
    const userId = 'user-123';
    
    // Cria um contexto autenticado com uid 'user-123'
    const authedDb = testEnv.authenticatedContext(userId).firestore();
    
    // Para testar a leitura de forma valida, primeiro escrevemos com privilégio administrativo
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await adminDb.collection('users').doc(userId).set({
        name: 'Eric Carvalho',
        email: 'eric.carvalho@ciesmg.com.br',
        areas: ['relacionamento'],
      });
    });

    const docRef = authedDb.collection('users').doc(userId);
    const snap = await docRef.get();
    expect(snap.exists).toBe(true);
    expect(snap.data()?.name).toBe('Eric Carvalho');
  });

  it('deve bloquear o usuario de ler o perfil de outro usuario', async () => {
    const userId = 'user-123';
    const targetUserId = 'user-456';
    
    const authedDb = testEnv.authenticatedContext(userId).firestore();
    
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await adminDb.collection('users').doc(targetUserId).set({
        name: 'Elen Sena',
        email: 'elen.sena@ciesmg.com.br',
        areas: ['gestao'],
      });
    });

    const docRef = authedDb.collection('users').doc(targetUserId);
    await expect(docRef.get()).rejects.toThrow();
  });
});
