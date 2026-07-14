# Notas de substituição — Firebase Edition

Esta edição substitui integralmente a arquitetura anterior do pacote.

## Arquivos que devem ser substituídos juntos

- `AGENTS.md`
- `CONTEXT.md`
- `HYPER_PROMPT.md`
- `.agents/rules/cies-project.md`
- `.agents/workflows/*`
- `docs/ai/SKILL_BUNDLE_CIES.md`
- `docs/ai/FIREBASE_ARCHITECTURE_BASELINE.md`

## Mudanças centrais

- Firebase Authentication no lugar da estratégia anterior de autenticação.
- Cloud Firestore como banco documental.
- Firebase Security Rules para acessos via SDK cliente.
- Autorização explícita para cada operação via Firebase Admin SDK.
- Firebase Local Emulator Suite como base de testes locais e CI.
- Índices versionados em `firestore.indexes.json`.
- Evolução de dados por `schemaVersion` e backfills idempotentes.
- Firebase App Hosting como hospedagem-alvo proposta.
- Workflow dedicado `/cies-firebase-audit`.

Não misture os arquivos desta edição com instruções técnicas da edição anterior.
