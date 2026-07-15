'use client';

import React, { useEffect, useState } from 'react';
import { getCurrentProfile } from '@/server/actions/users';
import { UserPermissions } from '@/lib/firebase/auth-session';
import RestrictedAccess from '@/components/shared/RestrictedAccess';
import { UserPlus } from 'lucide-react';
import { TableSkeleton } from '@/components/shared/Skeleton';
// import { getLeads } from '@/server/actions/leads'; // Mocked later

export default function LeadsPage() {
  const [currentUser, setCurrentUser] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentProfile().then(user => {
      setCurrentUser(user);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <TableSkeleton />
      </div>
    );
  }

  if (!currentUser || (!currentUser.areas.includes('comercial') && !currentUser.areas.includes('marketing') && !currentUser.areas.includes('relacionamento') && !currentUser.areas.includes('gestao'))) {
    return <RestrictedAccess title="Acesso Restrito: Comercial" message="Área exclusiva para Comercial e Marketing." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-primary" />
            Leads Comerciais
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie contatos, pipelines e novos alunos interessados.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-12 text-center text-muted-foreground">
          <p>Módulo de Leads em Desenvolvimento (Estrutura Criada).</p>
        </div>
      </div>
    </div>
  );
}
