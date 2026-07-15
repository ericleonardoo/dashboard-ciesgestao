'use client';

import React from 'react';
import { Lock } from 'lucide-react';
import Link from 'next/link';

interface RestrictedAccessProps {
  title?: string;
  message?: string;
}

export default function RestrictedAccess({ 
  title = 'Acesso Restrito', 
  message = 'Seu cargo não possui permissão para acessar ou modificar este módulo.' 
}: RestrictedAccessProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <Lock className="w-10 h-10 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        {message}
      </p>
      <Link 
        href="/"
        className="px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
      >
        Voltar ao Início
      </Link>
    </div>
  );
}
