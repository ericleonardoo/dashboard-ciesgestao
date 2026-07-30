'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cies_demo_mode');
      }
      const provider = new GoogleAuthProvider();
      let userCredential;
      try {
        userCredential = await signInWithPopup(auth, provider);
      } catch (popupErr) {
        console.warn('Popup do Google bloqueado ou falhou, fallback para redirect:', popupErr);
        await signInWithRedirect(auth, provider);
        return;
      }

      const idToken = await userCredential.user.getIdToken();
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Acesso restrito. Solicite liberação à Gestão.');
      }

      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      console.error('Falha no login Google:', err);
      const msg = err instanceof Error ? err.message : 'Ocorreu um erro no login com Google.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cies_demo_mode');
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      
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

      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Falha na autenticação:', err);
      const firebaseError = err as { code?: string; message?: string };
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
      <div className="absolute top-1/4 left-1/4 h-72 w-72 bg-violet-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 bg-indigo-600/10 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full space-y-8 bg-card border border-border p-8 rounded-2xl shadow-xl z-10">
        <div>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-foreground tracking-tight bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent">
            CIES Gestão
          </h2>
          <p className="mt-2 text-center text-xs text-muted-foreground font-medium">
            Sistema interno de gestão comercial, matrículas e inteligência operacional
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-lg flex items-center space-x-2 animate-in fade-in">
            <span>⚠️</span>
            <span className="font-medium">{error}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Botão Entrar com Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-slate-50 text-slate-800 font-bold py-3 px-4 rounded-xl border border-slate-300 shadow-sm transition-all hover:shadow-md disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span className="text-sm">Entrar com Google</span>
          </button>

          <p className="text-[11px] text-center text-slate-500 font-medium leading-relaxed">
            Acesso exclusivo para e-mails cadastrados previamente na allowlist da Gestão.
          </p>

          <div className="relative flex py-2 items-center justify-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-4 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">ou login com e-mail</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email-address" className="text-xs font-bold text-slate-600 block mb-1 uppercase tracking-wider">
                E-mail
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-border bg-background placeholder-muted-foreground text-foreground focus:outline-none focus:ring-violet-500 focus:border-violet-500 text-sm"
                placeholder="nome@ciesmg.com.br"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="text-xs font-bold text-slate-600 block mb-1 uppercase tracking-wider">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-border bg-background placeholder-muted-foreground text-foreground focus:outline-none focus:ring-violet-500 focus:border-violet-500 text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-bold rounded-lg text-primary-foreground bg-primary hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Carregando...' : 'Entrar com E-mail'}
            </button>
          </form>

          <div className="relative flex py-2 items-center justify-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-4 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">homologação local</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => handleDemoAccess('gestao')}
              disabled={loading}
              className="w-full flex justify-center py-2 px-3 border border-border text-xs font-bold rounded-lg text-foreground bg-secondary hover:bg-secondary/80 transition-all disabled:opacity-50"
            >
              Modo Demo: Gestão (Acesso Total)
            </button>

            <button
              type="button"
              onClick={() => handleDemoAccess('relacionamento')}
              disabled={loading}
              className="w-full flex justify-center py-2 px-3 border border-border text-xs font-bold rounded-lg text-foreground bg-secondary hover:bg-secondary/80 transition-all disabled:opacity-50"
            >
              Modo Demo: Relacionamento
            </button>

            <button
              type="button"
              onClick={() => handleDemoAccess('administrativo')}
              disabled={loading}
              className="w-full flex justify-center py-2 px-3 border border-border text-xs font-bold rounded-lg text-foreground bg-secondary hover:bg-secondary/80 transition-all disabled:opacity-50"
            >
              Modo Demo: Administrativo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
