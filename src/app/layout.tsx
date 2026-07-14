/**
 * -----------------------------------------------------------------------------
 * LAYOUT PRINCIPAL DO SISTEMA (ROOT LAYOUT)
 * -----------------------------------------------------------------------------
 * Arquivo: src/app/layout.tsx
 * 
 * Este arquivo define o "Esqueleto" visual de TODAS as páginas do sistema.
 * Tudo que você coloca aqui (como o Menu Lateral, a Fonte do texto e a cor de fundo)
 * vai aparecer em absolutamente todas as rotas do site automaticamente.
 */

import type { Metadata } from "next";

// Importa a fonte Premium (Outfit) direto do Google Fonts para não depender de downloads lentos
import { Outfit } from "next/font/google";

import AppLayout from "@/components/shared/AppLayout";
import "./globals.css";

const fontPremium = Outfit({
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
    <html lang="pt-BR" className={`${fontPremium.variable} h-full antialiased`}>
      <body className="h-full bg-background font-sans text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
