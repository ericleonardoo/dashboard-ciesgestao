# CIES Gestão — Sistema Interno de Gestão CIES

Este repositório contém a aplicação web do **CIES Gestão**, uma camada estratégica de inteligência e controle de fluxo operacional da CIES.

## Stack Tecnológica

- **Framework:** Next.js (App Router, React 19, TypeScript strict)
- **Visual/UX:** Tailwind CSS e shadcn/ui
- **Banco de Dados:** Cloud Firestore Native Mode
- **Autenticação:** Firebase Authentication (com Cookies de sessão SSR)
- **Local Dev & Testes:** Firebase Local Emulator Suite

---

## Estrutura do Workspace

- `AGENTS.md` - Regras obrigatórias de desenvolvimento para agentes de IA e humanos.
- `CONTEXT.md` - Definição do escopo, regras de negócio e glossário de domínio.
- `HYPER_PROMPT.md` - Pipeline de fases e critérios de aceitação do projeto.
- `.agents/` - Regras locais e workflows executáveis.
- `docs/` - Especificações de negócio, ADRs estruturais e logs de auditoria.
- `src/` - Código-fonte da aplicação Next.js.
  - `src/app/` - Roteamento físico (App Router).
  - `src/features/` - Funcionalidades divididas por módulos verticais.
  - `src/lib/` - Utilitários puros e inicialização de SDKs (Firebase client/admin).
  - `src/server/` - Serviços, repositórios e ações exclusivas de servidor.

---

## Setup Local e Desenvolvimento

### 1. Pré-requisitos
- Node.js v20 ou superior.
- Java Development Kit (JDK) v11 ou superior (exigido pelo Firebase Emulator Suite).
- Firebase CLI instalado globalmente:
  ```bash
  npm install -g firebase-tools
  ```

### 2. Configurar Variáveis de Ambiente
Copie o arquivo `.env.example` e crie um arquivo `.env` na raiz do projeto:
```bash
cp .env.example .env
```
Ajuste as variáveis públicas e privadas para corresponderem aos seus identificadores de teste do Firebase Console.

### 3. Iniciar o Firebase Local Emulator Suite
Em um terminal, inicie os emuladores locais (Firestore e Auth):
```bash
npm run emulators
```
A **Emulator Suite UI** estará acessível no navegador pelo endereço: [http://localhost:4000](http://localhost:4000).

### 4. Iniciar o Servidor Next.js
Em outro terminal, execute o servidor de desenvolvimento:
```bash
npm run dev
```
Acesse a aplicação no navegador em: [http://localhost:3000](http://localhost:3000).

---

## Testes e Validação local

O projeto conta com scripts automáticos para garantir a qualidade de entrega de cada funcionalidade:

- **Checagem de tipos (Typecheck):**
  ```bash
  npm run typecheck
  ```
- **Linting de código:**
  ```bash
  npm run lint
  ```
- **Testes de Regras de Segurança do Firestore:**
  ```bash
  npm run test:rules
  ```
- **Execução Geral de Testes:**
  ```bash
  npm run test
  ```
- **Validação Completa (Lint + Typecheck + Testes + Build de produção):**
  ```bash
  npm run verify
  ```
