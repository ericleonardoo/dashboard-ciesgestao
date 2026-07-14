'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  name: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', href: '/' },
  { name: 'Matrículas', href: '/matriculas' },
  { name: 'Importações', href: '/importacoes' },
  { name: 'Relacionamento', href: '/relacionamento' },
  { name: 'Metas & KPIs', href: '/metas' },
  { name: 'Colaboradores', href: '/colaboradores' },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-8 flex-1 px-2 space-y-1">
      {NAV_ITEMS.map((item) => {
        // Rota está ativa se for correspondência exata ou prefixo (para sub-páginas)
        const isActive =
          item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
