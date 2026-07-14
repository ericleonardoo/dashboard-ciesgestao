---
description: Retoma o CIES Gestão exatamente do último estado persistido e verificado
---

# /cies-resume

1. Leia `AGENTS.md`, `CONTEXT.md`, `HYPER_PROMPT.md` e a regra do workspace.
2. Leia, nesta ordem:
   - `docs/ai/PROJECT_STATE.md`
   - `docs/ai/TASK_BOARD.md`
   - `docs/ai/DECISION_LOG.md`
   - `docs/ai/OPEN_QUESTIONS.md`
   - `docs/ai/VERIFICATION_EVIDENCE.md`
   - `docs/ai/SESSION_HANDOFF.md`
3. Execute `git status`, identifique a branch e inspecione o diff.
4. Não confie apenas no handoff: verifique o código real.
5. Repita a última verificação relevante registrada.
6. Localize a primeira tarefa `IN PROGRESS`, depois `READY`.
7. Continue a fase correspondente do HYPER_PROMPT.
8. Preserve mudanças humanas feitas após o último handoff.
9. Ao encerrar, atualize toda a memória persistente.

Se o estado documentado divergir do repositório, o repositório e os testes têm precedência; corrija os documentos.
