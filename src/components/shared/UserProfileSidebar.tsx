import React, { useEffect, useState } from 'react';
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import { signOut } from "firebase/auth";
import { getCurrentProfile } from "@/server/actions/users";
import { UserPermissions } from "@/lib/firebase/auth-session";

export default function UserProfileSidebar({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserPermissions | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getCurrentProfile();
        setProfile(data);
      } catch (err) {
        console.error("Falha ao obter perfil da barra de usuário:", err);
      }
    }
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await fetch('/api/auth/session', {
        method: 'DELETE',
      });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error("Erro ao tentar deslogar:", error);
    }
  };

  const getRoleLabel = () => {
    if (!profile) return 'Carregando...';
    const areas = profile.areas || [];
    const roles: string[] = [];
    if (areas.includes('gestao')) roles.push('Gestão (Admin)');
    if (areas.includes('relacionamento')) roles.push('Relacionamento');
    if (areas.includes('administrativo')) roles.push('Administrativo');
    return `Cargo: ${roles.join(', ') || 'Colaborador'}`;
  };

  return (
    <div className={`flex items-center w-full ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
      {!isCollapsed && (
        <div className="ml-3 truncate">
          <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
            {profile ? profile.name : 'Carregando...'}
          </p>
          <p className="text-xs font-medium text-muted-foreground truncate">
            {getRoleLabel()}
          </p>
        </div>
      )}
      <button 
        onClick={handleLogout}
        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-300 flex-shrink-0"
        title="Sair do sistema"
      >
        <LogOut className="h-5 w-5" />
      </button>
    </div>
  );
}
