# Task Board — CIES Gestão v3.0

## Tarefas da Fase 0 (Preflight)
- [x] **TASK-001**: Leitura integral dos documentos mestres (`AGENTS.md`, `CONTEXT.md`, `HYPER_PROMPT.md`) | Owner: @orchestrator | Status: DONE
- [x] **TASK-002**: Execução de `git status` e criação do branch `chore/project-bootstrap` | Owner: @devops | Status: DONE
- [x] **TASK-003**: Inventário do projeto, dependências, scripts e verificação `tsc/eslint` | Owner: @architect | Status: DONE
- [x] **TASK-004**: Criação e atualização da estrutura de memória persistente `docs/ai/` | Owner: @orchestrator | Status: DONE

## Tarefas da Fase 1 (Especificação)
- [x] **TASK-010**: Criar/Atualizar `docs/specifications/product-v1.md`, `b2c-pipeline.md`, `b2b-pipeline.md` | Owner: @product | Status: DONE
- [x] **TASK-011**: Atualizar matriz de permissões RBAC em `docs/specifications/permissions-matrix.md` | Owner: @product | Status: DONE

## Tarefas da Fase 2 (Arquitetura e ADRs)
- [x] **TASK-020**: Atualizar ADR 0003 em `docs/decisions/` para Google Auth + Allowlist + Cookie HttpOnly | Owner: @architect | Status: DONE

## Tarefas da Fase 3 (Bootstrap & Qualidade)
- [x] **TASK-030**: Corrigir todos os erros de lint do ESLint (zerar 24 avisos/erros) | Owner: @fullstack | Status: DONE
- [x] **TASK-031**: Executar suite de 62 testes unitários (`npm run test`) e garantir 100% verde | Owner: @qa | Status: DONE
- [x] **TASK-032**: Executar build completo de produção Next.js 16.2 (`npm run build`) | Owner: @devops | Status: DONE

## Tarefas da Fase 4 (Google Auth, Sessão & RBAC)
- [x] **TASK-040**: Implementar `validateAndCreateSession` em `auth-session.ts` validando `accessAllowlist` no servidor via Admin SDK | Owner: @auth-security | Status: DONE
- [x] **TASK-041**: Atualizar endpoint `/api/auth/session/route.ts` para negar requisições fora da allowlist com HTTP 403 | Owner: @auth-security | Status: DONE
- [x] **TASK-042**: Adicionar botão "Entrar com Google" no cliente em `src/app/(auth)/login/page.tsx` com tratamento de popup/redirect e aviso de permissão | Owner: @ux | Status: DONE
- [x] **TASK-043**: Adicionar testes unitários para a regra de isolamento de carteira do consultor em `auth.test.ts` | Owner: @qa | Status: DONE
