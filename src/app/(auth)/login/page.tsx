'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cies_demo_mode');
      }
      
      // 1. Efetua o login via Firebase Client SDK
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // 2. Obtém o ID Token JWT do usuário autenticado
      const idToken = await userCredential.user.getIdToken();
      
      // 3. Envia o ID Token para o servidor para criar o cookie seguro de sessão
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao registrar sessão no servidor.');
      }

      // 4. Redireciona o usuário para o Dashboard
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Falha na autenticação:', err);
      const firebaseError = err as { code?: string; message?: string };
      // Tradução de erros comuns do Firebase Auth para o usuário final
      let userFriendlyError = 'Ocorreu um erro ao efetuar o login. Verifique sua conexão e tente novamente.';
      if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/invalid-credential') {
        userFriendlyError = 'E-mail ou senha incorretos. Por favor, tente novamente.';
      } else if (firebaseError.code === 'auth/invalid-email') {
        userFriendlyError = 'O formato do e-mail inserido é inválido.';
      } else if (firebaseError.code === 'auth/too-many-requests') {
        userFriendlyError = 'Múltiplas tentativas falhas. A conta foi temporariamente bloqueada. Tente mais tarde.';
      } else if (firebaseError.message) {
        userFriendlyError = firebaseError.message;
      }
      setError(userFriendlyError);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async (role: 'gestao' | 'relacionamento' | 'administrativo') => {
    setLoading(true);
    setError(null);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('cies_demo_mode', 'true');
        const { initDemoStore } = await import('@/lib/demo-store');
        initDemoStore();
      }

      const idToken = `demo-token-${role}`;

      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error('Falha ao registrar sessão de demonstração local.');
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Falha ao entrar no modo demo:', err);
      setError('Não foi possível inicializar o modo de demonstração local.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow effects */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 bg-violet-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 bg-indigo-600/10 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full space-y-8 bg-card border border-border p-8 rounded-2xl shadow-xl z-10">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground tracking-tight bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent">
            CIES Gestão
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Entre com suas credenciais individuais de colaborador
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-lg flex items-center space-x-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-4">
            <div>
              <label htmlFor="email-address" className="text-sm font-medium text-muted-foreground block mb-2">
                E-mail Corporativo
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-border bg-background placeholder-muted-foreground text-foreground focus:outline-none focus:ring-violet-500 focus:border-violet-500 text-sm"
                placeholder="nome.sobrenome@ciesmg.com.br"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="text-sm font-medium text-muted-foreground block mb-2">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-border bg-background placeholder-muted-foreground text-foreground focus:outline-none focus:ring-violet-500 focus:border-violet-500 text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-bold rounded-lg text-primary-foreground bg-primary hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
                  <span>Entrando...</span>
                </span>
              ) : (
                'Acessar Painel'
              )}
            </button>

            <div className="relative flex py-2 items-center justify-center">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink mx-4 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">ou homologação</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={() => handleDemoAccess('gestao')}
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-border text-xs font-bold rounded-lg text-foreground bg-secondary hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50"
              >
                Acessar como Gestor (Acesso Total)
              </button>

              <button
                type="button"
                onClick={() => handleDemoAccess('relacionamento')}
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-border text-xs font-bold rounded-lg text-foreground bg-secondary hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50"
              >
                Acessar como Relacionamento
              </button>

              <button
                type="button"
                onClick={() => handleDemoAccess('administrativo')}
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-border text-xs font-bold rounded-lg text-foreground bg-secondary hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50"
              >
                Acessar como Administrativo
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
