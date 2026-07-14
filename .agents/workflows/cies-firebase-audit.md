---
description: Audita Firebase Auth, Firestore, Security Rules, índices, Emulator Suite, IAM e custos do CIES Gestão
---

# /cies-firebase-audit

Realize uma auditoria defensiva e baseada em evidências da integração Firebase.

## Sequência

1. Leia `AGENTS.md`, `CONTEXT.md`, `HYPER_PROMPT.md`, ADRs e o diff atual.
2. Ative `/source-driven-development`, `/firebase`, `/auth-implementation-patterns`, `/backend-security-coder` e `/cc-skill-security-review`, se disponíveis.
3. Verifique separação entre Firebase client SDK e Admin SDK.
4. Confirme que módulos Admin são `server-only` e que nenhuma credencial administrativa vai ao bundle.
5. Revise criação, renovação, expiração e revogação do cookie de sessão.
6. Revise `firestore.rules` com deny-by-default, proteção contra autoelevação e restrição de campos sensíveis.
7. Execute testes de Rules com Emulator Suite e `@firebase/rules-unit-testing`.
8. Revise todas as chamadas Admin SDK e confirme autenticação, autorização e validação explícitas.
9. Revise `firestore.indexes.json`, queries, paginação e possíveis leituras excessivas.
10. Confirme que dashboards não carregam collections inteiras no cliente.
11. Revise fingerprint HMAC de duplicidade e ausência de CPF em IDs/logs/URLs.
12. Revise Storage e Functions somente se existirem.
13. Verifique App Check, IAM, budgets, backups e ambientes como gates de produção.
14. Execute lint, typecheck, testes e build aplicáveis.

## Saída

Crie `docs/reviews/firebase-audit-<data-ou-branch>.md` com:

- verdict `PASS`, `CONDITIONAL` ou `FAIL`;
- achados por severidade;
- evidências e comandos;
- regras/queries afetadas;
- riscos de segurança e custo;
- correções feitas;
- pendências humanas.

Não faça deploy, mudança de IAM, ativação de billing ou alteração de produção.
