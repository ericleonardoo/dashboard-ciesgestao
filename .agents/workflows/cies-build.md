---
description: Executa o pipeline mestre de construção do CIES Gestão a partir do HYPER_PROMPT
---

# /cies-build

Execute o projeto em modo autônomo controlado.

## Inicialização obrigatória

1. Leia integralmente `AGENTS.md`.
2. Leia integralmente `CONTEXT.md`.
3. Leia integralmente `HYPER_PROMPT.md`.
4. Leia `.agents/rules/cies-project.md`.
5. Leia `docs/ai/PROJECT_STATE.md` e `docs/ai/SESSION_HANDOFF.md`, se existirem.
6. Execute `git status` e identifique a branch.
7. Liste as skills disponíveis e registre a disponibilidade real.

## Execução

- Siga todas as fases do `HYPER_PROMPT.md`, na ordem definida.
- Use três a cinco skills relevantes por fase; não carregue bundles inteiros.
- Use planejamento persistente em `docs/ai/`.
- Use subagentes apenas para tarefas independentes, com fronteiras de arquivos explícitas.
- Corrija falhas encontradas durante validação.
- Continue automaticamente entre fases quando os requisitos forem confirmados ou houver default reversível documentado.
- Pare apenas nos gates humanos definidos no HYPER_PROMPT.

## Restrições

Não faça deploy, push, merge, uso de dados reais, alteração de produção, alteração destrutiva no Firebase/Firestore ou exposição de secrets.

## Encerramento

Atualize `PROJECT_STATE.md`, `TASK_BOARD.md`, `VERIFICATION_EVIDENCE.md` e `SESSION_HANDOFF.md`. Entregue o relatório no formato exigido pelo HYPER_PROMPT.
