# ADR 0001: Arquitetura da Aplicação (Next.js Monólito Modular)

- **Status:** **CONFIRMADO**
- **Data:** 2026-07-13
- **Autor:** @architect

## Contexto
O sistema CIES Gestão precisa ser desenvolvido com uma estrutura que permita rápida implementação, alta performance e facilidade de manutenção por uma equipe de dois desenvolvedores (Eric e seu primo). O sistema precisa integrar a interface web moderna com um backend confiável conectado à plataforma Firebase.

## Decisão
Adotaremos a arquitetura de **Monólito Modular** usando o **Next.js com App Router** e **TypeScript** em modo estrito.

1.  **Server Components por Padrão (RSC):** Componentes serão React Server Components para garantir busca de dados eficiente no lado do servidor, melhorando performance e reduzindo bundles desnecessários no cliente.
2.  **Client Components de forma Seletiva:** Componentes interativos, que manipulam estado local (React Hook Form) ou que dependem do SDK cliente do Firebase (ex: fluxo de login) usarão a diretiva `'use client'`.
3.  **Estrutura de Pastas por Feature:** Organizaremos o código técnico separando a estrutura visual e os fluxos em domínios de negócio na pasta `src/features/` (ex: `features/enrollments/`, `features/imports/`, `features/dashboard/`).
4.  **Backend e Banco:** O processamento e regras serão centralizados em funções `server-only` (Server Actions e Route Handlers) rodando no servidor Next.js, consumindo o banco de dados Cloud Firestore por meio do Firebase Admin SDK de maneira segura.

## Consequências
- **Positivas:**
  - Facilidade de desenvolvimento compartilhado no repositório.
  - Deployment simples e centralizado no Firebase App Hosting.
  - Segurança aprimorada, mantendo chaves privadas de infraestrutura exclusivamente no servidor.
- **Negativas / Riscos:**
  - Risco de acoplamento indesejado entre features se as fronteiras de módulos não forem respeitadas. Mitigaremos mantendo as regras de negócio expostas em serviços (`server/services/`) e repositórios tipados de forma isolada.
