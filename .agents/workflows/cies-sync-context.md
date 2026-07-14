---
description: Sincroniza documentação e memória persistente do CIES Gestão com o código real
---

# /cies-sync-context

1. Leia os documentos mestres e o estado atual.
2. Inspecione estrutura, package.json, firebase.json, Rules, índices, scripts de backfill, rotas, features, testes e CI.
3. Compare código real com:
   - `docs/ai/PROJECT_STATE.md`;
   - `docs/ai/TASK_BOARD.md`;
   - ADRs;
   - especificações;
   - README;
   - `.env.example`.
4. Atualize somente informações desatualizadas.
5. Preserve histórico e decisões anteriores.
6. Não transforme proposta em confirmação.
7. Registre divergências e débitos técnicos.
8. Atualize `SESSION_HANDOFF.md`.
9. Não altere código de produto, salvo correção documental trivial necessária para consistência.
