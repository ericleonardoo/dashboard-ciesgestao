# Project State — CIES Gestão v3.0

## 1. Identificação Geral
- **Fase Atual:** Fases 0 a 9 Concluídas | Fases 10 a 16 Concluídas
- **Status:** 
  - **Fase 0 — Preflight:** Concluída.
  - **Fase 1 — Especificação:** Concluída (`product-v1.md`, `permissions-matrix.md`, `b2c-pipeline.md`, `b2b-pipeline.md`).
  - **Fase 2 — Arquitetura e ADRs:** Concluída.
  - **Fase 3 — Bootstrap & Qualidade:** Concluída.
  - **Fase 4 — Google Auth & Allowlist RBAC:** Concluída.
  - **Fase 5 — Shell Visual:** Concluída.
  - **Fase 6 — Leads B2C:** Concluída. Pipeline de 10 estágios, alertas de follow-ups vencidos, formulário com validação Zod e Server Actions.
  - **Fase 7 — Empresas & B2B:** Concluída. Prospecção corporativa, verificação de duplicidade de CNPJ, identificação de contato decisor e agendamento de reuniões.
  - **Fase 9 — Atividades & Linha do Tempo:** Concluída. Registro manual e automático de interações comerciais com rastreamento por entidade.
- **Última Verificação Executada:** `npm run lint` (0 erros / 0 avisos), `npm run typecheck` (0 erros), `npm run test` (71/71 testes verdes), `npm run build` (14/14 rotas estáticas e dinâmicas compiladas).

## 2. Cobertura de Testes e Qualidade
- **Suite Unitária (`npm run test`):** 10 arquivos de testes unitários (71 testes no total) 100% aprovados.
- **Compilação Strict (`npm run typecheck`):** Zerado sem erros.
- **Estilo & Sintaxe (`npm run lint`):** 0 erros e 0 avisos no ESLint 9.

## 3. Estrutura de Arquivos Principais
- **`src/app/leads/page.tsx`**: Interface do funil B2C com Kanban, Tabela, busca e filtros.
- **`src/app/convenios/page.tsx`**: Interface de empresas B2B e convênios corporativos.
- **`src/components/leads/`**: Componentes `LeadForm`, `LeadKanban`, `LeadTable`, `LeadStatusSelect`.
- **`src/components/convenios/`**: Componentes `PartnershipForm`.
- **`src/server/actions/`**: Server Actions para `leads.ts`, `partnerships.ts`, `activities.ts`.
- **`src/lib/validation/`**: Schemas Zod para `lead-schema.ts`, `partnership-schema.ts`, `activity-schema.ts`.
- **`src/test/`**: Testes unitários para `leads.test.ts`, `partnerships.test.ts`, `activities.test.ts`.
