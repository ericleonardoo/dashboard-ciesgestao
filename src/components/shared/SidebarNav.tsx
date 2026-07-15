'use client';

/**
 * -----------------------------------------------------------------------------
 * COMPONENTE DE NAVEGAÇÃO LATERAL (MENU SIDEBAR)
 * -----------------------------------------------------------------------------
 * Arquivo: src/components/shared/SidebarNav.tsx
 * 
 * Este arquivo cria os botões do menu que ficam no lado esquerdo da tela
 * (Dashboard, Matrículas, Importações, etc).
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCurrentProfile } from '@/server/actions/users';
import { UserPermissions } from '@/lib/firebase/auth-session';
import { 
  LayoutDashboard, 
  GraduationCap, 
  FileUp, 
  Users, 
  Target, 
  Briefcase,
  Megaphone,
  Handshake,
  ListTodo,
  Headset,
  UserPlus
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Leads (Comercial)', href: '/leads', icon: UserPlus },
  { name: 'Matrículas', href: '/matriculas', icon: GraduationCap },
  { name: 'Importações', href: '/importacoes', icon: FileUp },
  { name: 'Marketing', href: '/marketing', icon: Megaphone },
  { name: 'Convênios', href: '/convenios', icon: Handshake },
  { name: 'Planos 5W2H', href: '/planos-acao', icon: ListTodo },
  { name: 'Relacionamento', href: '/relacionamento', icon: Users },
  { name: 'Casos Críticos', href: '/relacionamento/casos', icon: Headset },
  { name: 'Metas & KPIs', href: '/metas', icon: Target },
  { name: 'Colaboradores', href: '/colaboradores', icon: Briefcase },
];

export default function SidebarNav({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getCurrentProfile();
        setProfile(data);
      } catch (err) {
        console.error('Falha ao obter perfil para menu:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <nav className={`mt-8 flex-1 space-y-3 ${isCollapsed ? 'px-0' : 'px-4'}`}>
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className={`bg-secondary/40 animate-pulse rounded-xl ${
              isCollapsed ? 'w-11 h-11' : 'h-10 w-full'
            }`}
          />
        ))}
      </nav>
    );
  }

  const visibleItems = NAV_ITEMS.filter((item) => {
    // Dashboard e Matrículas aparecem para todos
    if (item.href === '/' || item.href === '/matriculas') {
      return true;
    }

    if (!profile) {
      return false;
    }

    const areas = profile.areas || [];

    // Se for Gestão, vê tudo
    if (areas.includes('gestao')) {
      return true;
    }

    if (item.href === '/importacoes') {
      return areas.includes('administrativo');
    }
    if (item.href === '/relacionamento') {
      return areas.includes('relacionamento');
    }
    if (item.href === '/metas' || item.href === '/colaboradores') {
      return false;
    }

    return false;
  });

  return (
    <nav className={`mt-8 flex-1 space-y-1.5 ${isCollapsed ? 'flex flex-col items-center px-0' : 'px-2'}`}>
      {visibleItems.map((item) => {
        const isActive =
          item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group flex items-center text-sm transition-all duration-300 ${
              isCollapsed 
                ? 'justify-center w-11 h-11 rounded-xl' 
                : 'px-4 py-2.5 rounded-xl w-full'
            } ${
              isActive
                ? 'bg-[#E5E0D8] text-foreground font-extrabold shadow-sm'
                : `text-muted-foreground font-medium hover:bg-[#E5E0D8]/50 hover:text-foreground ${!isCollapsed ? 'hover:translate-x-1' : ''}`
            }`}
            title={isCollapsed ? item.name : undefined}
          >
            <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'} ${!isCollapsed ? 'mr-3' : ''}`} />
            {!isCollapsed && <span className="truncate">{item.name}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
