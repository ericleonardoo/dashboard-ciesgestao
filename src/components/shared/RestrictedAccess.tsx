'use client';

import React from 'react';
import { Lock, ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface RestrictedAccessProps {
  title?: string;
  message?: string;
  allowedRoles?: string[];
  currentRole?: string;
}

export default function RestrictedAccess({ 
  title, 
  message, 
  allowedRoles, 
  currentRole 
}: RestrictedAccessProps) {
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'gestao': return 'Gestão (Admin)';
      case 'relacionamento': return 'Relacionamento';
      case 'administrativo': return 'Administrativo';
      case 'comercial': return 'Comercial';
      case 'marketing': return 'Marketing';
      default: return role || 'Colaborador';
    }
  };

  // Se foram passadas allowedRoles e currentRole, exibe a interface detalhada baseada em cargos
  if (allowedRoles && currentRole) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center animate-fade-in">
        <div className="bg-destructive/10 p-4 rounded-full border border-destructive/20 shadow-inner mb-6 relative">
          <ShieldAlert className="h-16 w-16 text-destructive animate-pulse" />
          <div className="absolute inset-0 bg-destructive/10 rounded-full blur-xl -z-10"></div>
        </div>

        <h1 className="text-2xl font-extrabold text-foreground tracking-tight sm:text-3xl">
          Acesso Restrito
        </h1>
        
        <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
          Seu cargo atual é <span className="font-extrabold text-foreground bg-secondary px-2.5 py-1 rounded-md">{getRoleLabel(currentRole)}</span>, 
          que não possui permissão para acessar esta funcionalidade.
        </p>

        <div className="mt-6 bg-card border border-border p-4 rounded-xl max-w-sm mx-auto shadow-sm">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
            Cargos Autorizados:
          </span>
          <div className="flex flex-wrap gap-2 justify-center">
            {allowedRoles.map((role) => (
              <span 
                key={role} 
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
              >
                {getRoleLabel(role)}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Fallback para a versão simples de title + message (usada no CRM e outras áreas)
  const displayTitle = title || 'Acesso Restrito';
  const displayMessage = message || 'Seu cargo não possui permissão para acessar ou modificar este módulo.';

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-fade-in">
      <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <Lock className="w-10 h-10 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">{displayTitle}</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        {displayMessage}
      </p>
      <Link 
        href="/"
        className="inline-flex items-center px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-md"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar ao Início
      </Link>
    </div>
  );
}
