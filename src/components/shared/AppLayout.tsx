'use client';

import React, { useState } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import SidebarNav from "@/components/shared/SidebarNav";
import UserProfileSidebar from "@/components/shared/UserProfileSidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Estado que controla se a barra lateral está aberta ou fechada.
  // Começamos com ela aberta.
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-full min-h-screen relative overflow-hidden bg-background">

      {/* Botão flutuante removido, a barra vai encolher no próprio lugar */}

      {/* ============================================================== */}
      {/* BARRA LATERAL (SIDEBAR) */}
      {/* ============================================================== */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-gray-400 bg-card shadow-md transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto overflow-x-hidden">
          
          {/* Cabeçalho da Barra Lateral (Logo + Botão de Fechar/Abrir) */}
          <div className={`flex items-center flex-shrink-0 mb-6 transition-all ${isSidebarOpen ? 'justify-between px-6' : 'justify-center px-0'}`}>
            {isSidebarOpen && (
              <span className="text-xl font-extrabold tracking-tight text-foreground whitespace-nowrap animate-fade-in">
                CIES Gestão
              </span>
            )}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-muted-foreground hover:text-foreground transition-all p-1.5 rounded-md hover:bg-secondary hover:shadow-sm flex-shrink-0"
              title={isSidebarOpen ? "Esconder menu" : "Abrir menu"}
            >
              {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
            </button>
          </div>
          
          <SidebarNav isCollapsed={!isSidebarOpen} />
          
          <div className={`flex-shrink-0 flex border-t border-border p-4 bg-secondary/30 backdrop-blur-sm mt-auto ${!isSidebarOpen ? 'justify-center px-2' : ''}`}>
            <UserProfileSidebar isCollapsed={!isSidebarOpen} />
          </div>
        </div>
      </aside>

      {/* OVERLAY PARA CELULAR: Quando aberto no celular, escurece o fundo pra focar no menu */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/20 md:hidden backdrop-blur-sm transition-opacity animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ============================================================== */}
      {/* ÁREA PRINCIPAL ONDE O CONTEÚDO (Ex: Dashboard) APARECE       */}
      {/* ============================================================== */}
      <div 
        className={`flex flex-col flex-1 w-full transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'md:pl-64' : 'md:pl-20 pl-0'
        }`}
      >
        {/* CABEÇALHO APENAS PARA CELULAR */}
        <header className="sticky top-0 z-10 md:hidden flex items-center justify-between h-16 bg-card border-b border-border px-4 shadow-sm">
          <div className="flex items-center">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="mr-3 p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <PanelLeftOpen className="w-5 h-5" />
              </button>
            )}
            <span className="text-lg font-extrabold text-foreground">
              CIES Gestão
            </span>
          </div>
        </header>

        {/* MIOLO (Onde os Recharts e as Tabelas são renderizados) */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-transparent focus:outline-none p-6 md:p-8">
          {children}
        </main>
      </div>

    </div>
  );
}
