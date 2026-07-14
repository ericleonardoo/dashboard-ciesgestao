"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import { signOut } from "firebase/auth";

export default function UserProfileSidebar({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const router = useRouter();

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

  return (
    <div className={`flex items-center w-full ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
      {!isCollapsed && (
        <div className="ml-3 truncate">
          <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">Eric Carvalho</p>
          <p className="text-xs font-medium text-muted-foreground truncate">Gestão (Admin)</p>
        </div>
      )}
      <button 
        onClick={handleLogout}
        className={`p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-300 flex-shrink-0 ${isCollapsed ? '' : ''}`}
        title="Sair do sistema"
      >
        <LogOut className="h-5 w-5" />
      </button>
    </div>
  );
}
