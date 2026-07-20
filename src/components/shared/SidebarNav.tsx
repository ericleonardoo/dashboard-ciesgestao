import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

  // Encontra o item mais específico que bate com a rota atual para evitar dois botões ativos
  const activeHref = NAV_ITEMS.filter(item => 
    item.href === '/' ? pathname === '/' : (pathname === item.href || pathname.startsWith(`${item.href}/`))
  ).sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav className={`mt-8 flex-1 space-y-1.5 ${isCollapsed ? 'flex flex-col items-center px-0' : 'px-2'}`}>
      {NAV_ITEMS.map((item) => {
        const isActive = item.href === activeHref;

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
