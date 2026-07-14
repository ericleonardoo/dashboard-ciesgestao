# Project State — CIES Gestão

## 1. Identificação Geral
- **Fase Atual:** Fase 10 - Auditoria e Release (Auditoria Firebase e Testes Finais)
- **Status:** Planejamento da auditoria final de segurança do Firebase (`firestore.rules`, App Check, IAM), testes de ponta a ponta e preparação para homologação.
- **Última Verificação Executada:** Execução completa do script `npm run verify` com sucesso (2026-07-14).

## 2. Resumo do que Existe
- **Documentos Mestres e Regras:**
  - `AGENTS.md` (Regras de desenvolvimento)
  - `CONTEXT.md` (Contexto de domínio)
  - `HYPER_PROMPT.md` (Contrato mestre de execução)
  - `.agents/rules/cies-project.md` (Regras persistentes do workspace)
- **Workflows:**
  - 8 workflows locais configurados em `.agents/workflows/`
- **Código-Fonte e Infraestrutura (Fases 3 a 9 Concluídas):**
  - Next.js (App Router, TypeScript strict, Tailwind CSS v4, Layout lateral shell).
  - Componente cliente do menu de navegação lateral (`SidebarNav.tsx`) aplicando destaque dinâmico da rota ativa no layout geral.
  - Firebase Local Emulator Suite (Firestore, Auth, UI de emulação).
  - Regras de segurança locais (`firestore.rules` com RBAC e deny-by-default) e testes smoke.
  - Inicialização segura do Firebase Client e Admin SDK, com suporte a lazy getters.
  - Controle de Sessão SSR por Cookies Seguros (`HttpOnly` via `__session` para compatibilidade Firebase CDN) em `auth-session.ts` e `/api/auth/session`.
  - Middleware de proteção de rotas privadas (`src/middleware.ts`).
  - Helpers de permissão RBAC (`src/lib/permissions/index.ts`) e interceptação de ações de servidor (`requirePermission`).
  - Interface do usuário para Login (`src/app/(auth)/login/page.tsx`) e gerenciamento de Colaboradores (`src/app/colaboradores/page.tsx` e `CreateColaboradorForm`).
  - Esquema Zod de validação e normalização de planilhas (`src/lib/validation/enrollment-schema.ts`), incluindo higienização de CPF/Telefone e moeda em centavos inteiros.
  - Motor de cálculo de duplicidade HMAC (`src/server/services/duplicate-detector.ts`) gerando assinaturas seguras baseadas em `CPF + Curso + Inst. + Mês` e checagem batched no Firestore.
  - Leitor XLSX (`src/server/services/import-parser.ts`) tolerando colunas fora de ordem e reportando erros sintáticos por linha exata.
  - Server Actions para validação e staging de planilhas e confirmação transacional atômica em lotes de 500 registros (`src/server/actions/imports.ts`).
  - Interface UI Wizard para upload, revisão em tabela staging com badges e estatísticas e confirmação final (`src/app/importacoes/page.tsx`) com transição de loading em Skeletons na tabela durante a gravação.
  - Lógica central de regras de negócio de domínio (matrícula válida e BVS automática) em `src/lib/validation/enrollment-rules.ts`.
  - Server Actions de Dashboard consolidando faturamento e ranking de vendedores por mês de referência (`src/server/actions/dashboard.ts`).
  - Interface gerencial do Dashboard de faturamento, matrículas, distribuição por instituição parceira e ranking de vendas do período selecionado (`src/app/page.tsx`).
  - Provedor de índice composto do Firestore para consultas cruzadas em `firestore.indexes.json` (`referenceMonth` + `releaseStatus` + `createdAt`).
  - Higienizador e protetor contra XSS em links de planilhas (`src/lib/validation/url-sanitizer.ts`) garantindo redirects limpos e fallbacks de WhatsApp.
  - Server Actions de Relacionamento (`src/server/actions/relacionamento.ts`) para ler fila de boas-vindas pendentes e alterar status de BVS com auditoria de colaborador logado.
  - Interface cliente dinâmica da fila de atendimento do Relacionamento (`src/app/relacionamento/page.tsx`) em duas abas com tabela de carregamento animado com Skeletons e reatividade instantânea.
  - Server Action para leitura e alteração controlada de campos da matrícula com regras RBAC e log de auditoria em `src/server/actions/enrollments.ts`.
  - Interface gerencial centralizada de matrículas com busca, filtros de status/instituição, tabela paginada com máscaras de privacidade de PII e carregamento com Skeletons, gaveta de detalhes com logs de alteração e modais de confirmação de alteração auditada (`src/app/matriculas/page.tsx`).
  - Componentes reutilizáveis de esqueletos de carregamento animados em `src/components/shared/Skeleton.tsx` (`KpiCardSkeleton`, `TableSkeleton`, `Skeleton`).
  - Suporte a acessibilidade de teclado nativo com anéis de foco coloridos destacados (`focus:ring-2 focus:ring-primary focus:outline-none`) em todos os selects, inputs de busca, e gavetas de controle.
  - Atributos `aria-label` para leitores de tela em elementos de controle baseados apenas em ícones.
  - Suite de 3 testes unitários para a validação dos componentes Skeletons em `src/test/ux.test.ts` (45 testes verdes no total do projeto).
  - **Modo Sandbox Offline de Demonstração:** Botão de login anônimo simulando o cookie `__session` de forma local (`src/lib/demo-store.ts`), com redirecionamento de faturamento, matrículas e filas para o `LocalStorage` do cliente para homologação local segura sem dependência ativa de banco de dados.
  - **Página de Metas & KPIs:** Interface gerencial em `/metas` para monitorar progresso do faturamento consolidado de matrículas válidas, volume total de vendas e as metas individuais dos vendedores com gráficos de barras.

## 3. Arquitetura Adotada
- **Stack:** Next.js (App Router), TypeScript (Strict), Tailwind CSS, shadcn/ui.
- **Backend:** Firebase Authentication + Cloud Firestore Native Mode + Firebase Admin SDK.
- **Ambiente Local:** Firebase Local Emulator Suite (Firestore porta 8080, Auth porta 9099, UI porta 4000).
- **Hospedagem:** Firebase App Hosting (proposto).

## 4. Módulos e Status de Desenvolvimento

| Módulo/Funcionalidade | Status | Observações |
|---|---|---|
| Memória e Planejamento (Fase 0) | **Concluído** | Arquivos de estado e tarefas criados |
| Especificações do Produto (Fase 1) | **Concluído** | V1 Spec, Matriz de Permissões e Critérios criados |
| ADRs e Design de Banco (Fase 2) | **Concluído** | 6 ADRs estruturais e modelos conceituais criados |
| Bootstrap Técnico (Fase 3) | **Concluído** | Next.js, Emuladores, CI e Teste de regras online |
| Autenticação e RBAC (Fase 4) | **Concluído** | Login, Cookies SSR, UI de Colaboradores e testes unitários |
| Motor de Importação (Fase 5) | **Concluído** | Leitor XLSX, normalização, HMAC, Wizard Staging e testes unitários |
| Dashboard e KPIs (Fase 6) | **Concluído** | Agregações, ranking, semáforos BRL e testes unitários |
| Relacionamento e Boas-Vindas (Fase 7) | **Concluído** | Fila de pendências BVS, redirect seguro e testes unitários |
| Tabela de Matrículas e Edição (Fase 8) | **Concluído** | Busca, filtros, máscaras PII, logs auditados e testes unitários |
| Polimento e UX (Fase 9) | **Concluído** | skeletons animados, foco a11y, aria-label e testes unitários |
| Auditoria e Release (Fase 10) | **Concluído** | `/cies-firebase-audit` concluída, sandbox local ativa e build gerado |

## 5. Comandos Válidos
- Iniciar Next.js local:
  ```bash
  npm run dev
  ```
- Iniciar emuladores locais do Firebase:
  ```bash
  npm run emulators
  ```
- Executar testes de regras do Firestore:
  ```bash
  npm run test:rules
  ```
- Executar testes unitários (Vitest):
  ```bash
  npm run test
  ```
- Validação Geral de Qualidade (CI Local):
  ```bash
  npm run verify
  ```

## 6. Problemas Conhecidos
- Nenhum. Todos os testes, lints, typechecks e build de produção estão verdes.

## 7. Próxima Verificação
- Planejamento e execução de auditoria de segurança Firebase local e simulação de release na Fase 10.
