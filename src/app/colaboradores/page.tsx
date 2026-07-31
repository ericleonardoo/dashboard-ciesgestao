import React from 'react';
import { getColaboradores } from '@/server/actions/users';
import CreateColaboradorForm from '@/components/colaboradores/CreateColaboradorForm';
import { getCurrentUserPermissions } from '@/lib/firebase/auth-session';
import RestrictedAccess from '@/components/shared/RestrictedAccess';

export const dynamic = 'force-dynamic';

export default async function ColaboradoresPage() {
  const profile = await getCurrentUserPermissions();
  const hasAccess = profile && profile.areas.includes('gestao');

  if (!hasAccess) {
    const currentRole = profile ? profile.areas[0] || 'colaborador' : 'colaborador';
    return <RestrictedAccess allowedRoles={['gestao']} currentRole={currentRole} />;
  }

  let colaboradores: Awaited<ReturnType<typeof getColaboradores>> = [];
  try {
    colaboradores = await getColaboradores();
  } catch (err) {
    console.error('Falha ao obter colaboradores:', err);
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Colaboradores & Permissões
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Gerenciamento de contas de acesso, papéis e permissões no sistema CIES Gestão.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tabela de Colaboradores (Grid 2 colunas) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm overflow-hidden flex flex-col space-y-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Equipe Cadastrada</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Lista de usuários ativos e seus escopos de atuação.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm text-left">
              <thead>
                <tr className="text-muted-foreground font-semibold border-b border-border">
                  <th className="py-3 px-4">Nome</th>
                  <th className="py-3 px-4">E-mail</th>
                  <th className="py-3 px-4">Áreas de Atuação</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {colaboradores.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      Nenhum colaborador encontrado.
                    </td>
                  </tr>
                ) : (
                  colaboradores.map((user: { uid: string; name: string; email: string; status: string; areas: string[]; createdAt: string | null }) => (
                    <tr key={user.uid} className="hover:bg-secondary/40 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-foreground">{user.name}</td>
                      <td className="py-3.5 px-4 text-muted-foreground">{user.email}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {user.areas.map((area: string) => (
                            <span
                              key={area}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary border border-primary/20 capitalize"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                            user.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-destructive/10 text-destructive border-destructive/20'
                          }`}
                        >
                          {user.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Formulário lateral (Grid 1 coluna) */}
        <div>
          <CreateColaboradorForm />
        </div>
      </div>
    </div>
  );
}
