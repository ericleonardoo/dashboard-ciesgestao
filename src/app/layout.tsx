import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SidebarNav from "@/components/shared/SidebarNav";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "CIES Gestão — Painel de Controle",
  description: "Sistema interno de gestão, KPIs e acompanhamento estratégico da CIES.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased dark`}>
      <body className="h-full bg-background font-sans text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
        <div className="flex h-full min-h-screen">
          {/* Navegação Lateral Shell (V1) */}
          <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-border bg-card/65 backdrop-blur-xl z-20">
            <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent">
                  CIES Gestão
                </span>
              </div>
              <SidebarNav />
              <div className="flex-shrink-0 flex border-t border-border p-4 bg-background/20">
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-foreground">Eric Carvalho</p>
                    <p className="text-xs font-medium text-muted-foreground">Gestão (Admin)</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Área Principal */}
          <div className="md:pl-64 flex flex-col flex-1 w-full">
            <header className="sticky top-0 z-10 md:hidden flex items-center justify-between h-16 bg-card border-b border-border px-4 backdrop-blur-md bg-opacity-80">
              <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent">
                CIES Gestão
              </span>
            </header>
            <main className="flex-1 overflow-y-auto bg-background focus:outline-none p-6 md:p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
