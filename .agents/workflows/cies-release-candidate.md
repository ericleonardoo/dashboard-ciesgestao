---
description: Valida o CIES Gestão como release candidate sem realizar deploy ou merge
---

# /cies-release-candidate

Prepare uma release candidate local e auditável.

## Gate completo

1. Leia todo o contexto e critérios de aceitação.
2. Confirme branch e working tree.
3. Revise scripts de evolução/backfill, Rules, índices e possibilidade de rollback.
4. Revise Firebase Security Rules, testes no Emulator Suite, IAM e autorização de cada chamada Admin SDK.
5. Revise variáveis, `.env.example`, App Hosting secrets e ausência de service-account JSON.
6. Confirme que seeds e fixtures são sintéticos.
7. Execute instalação limpa conforme lockfile.
8. Execute lint.
9. Execute typecheck.
10. Execute testes unitários, integrados e Security Rules no Emulator Suite.
11. Execute E2E.
12. Execute build de produção.
13. Execute smoke test local.
14. Revise acessibilidade das jornadas críticas.
15. Revise dependências e secrets.
16. Reconcilie todos os critérios de aceitação.
17. Use `/acceptance-orchestrator` e `/verification-before-completion` se disponíveis.

## Entregáveis

Crie:

- `docs/releases/RELEASE_CANDIDATE.md`;
- `docs/releases/ROLLBACK_PLAN.md`;
- `docs/releases/KNOWN_ISSUES.md`;
- `docs/releases/DEPLOYMENT_CHECKLIST.md`.

Não faça deploy, push ou merge. Finalize com verdict explícito: `READY`, `CONDITIONALLY READY` ou `NOT READY`.
