---
description: Regras persistentes do workspace CIES Gestão
---

# CIES Gestão — Regra persistente

Em toda conversa neste workspace:

1. Leia `AGENTS.md`, `CONTEXT.md` e `HYPER_PROMPT.md` antes de planejar ou editar.
2. Leia `docs/ai/PROJECT_STATE.md` e `docs/ai/SESSION_HANDOFF.md` quando existirem.
3. Execute `git status` e identifique a branch antes de alterar arquivos.
4. Preserve requisitos marcados como CONFIRMADO.
5. Marque defaults reversíveis como PROPOSTO e dúvidas não críticas como PENDENTE.
6. Nunca use dados reais de alunos, secrets ou arquivos de produção.
7. Nunca faça deploy, push, merge, alteração destrutiva em Firebase/Firestore/Auth/IAM ou uso de credenciais sem autorização explícita.
8. Autorização deve existir em Firebase Security Rules para o Client SDK e explicitamente no servidor para toda operação Admin SDK, não apenas na interface.
9. Use apenas as skills relevantes para a fase atual; verifique o nome antes de invocar.
10. Não afirme conclusão sem evidência de lint, typecheck, testes e build aplicáveis.
11. Atualize a memória em `docs/ai/` antes de encerrar ou perder contexto.
12. Responda em português do Brasil; código e identificadores em inglês técnico consistente.
