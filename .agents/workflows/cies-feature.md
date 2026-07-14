---
description: Planeja, implementa, testa e documenta uma funcionalidade do CIES Gestão
---

# /cies-feature <funcionalidade>

Implemente a funcionalidade informada como uma fatia vertical completa.

## Processo

1. Leia os documentos mestres e o estado atual.
2. Confirme se a funcionalidade está no escopo e identifique regras CONFIRMADAS.
3. Pesquise documentação oficial para qualquer API ou biblioteca instável.
4. Crie uma especificação curta em `docs/specifications/features/` contendo:
   - objetivo;
   - usuários;
   - regras;
   - permissões;
   - casos limite;
   - critérios de aceitação;
   - plano de testes.
5. Identifique collections/documentos, schemaVersion/backfill, Security Rules, índices, autorização Admin SDK, UI, auditoria e testes necessários.
6. Use skills relevantes, no máximo cinco por subetapa.
7. Implemente com testes.
8. Execute lint, typecheck, testes afetados e build quando aplicável.
9. Faça autorrevisão de segurança, acessibilidade e regressão.
10. Atualize documentação, estado e handoff.

Não faça push, merge ou deploy.
