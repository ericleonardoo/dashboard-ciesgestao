# Firebase Architecture Baseline — CIES Gestão

Este arquivo resume as decisões técnicas que o agente deve validar na documentação oficial antes de implementar.

## Plataforma

- Next.js App Router + TypeScript strict.
- Firebase Authentication para usuários internos.
- Cloud Firestore como banco documental.
- Firebase Admin SDK apenas no servidor.
- Firebase Local Emulator Suite no desenvolvimento e CI.
- Firebase App Hosting como hospedagem-alvo proposta.

## Sessão

- Login pelo Firebase Web SDK.
- Troca do ID token por cookie de sessão seguro em endpoint server-side.
- Verificação do cookie pelo Admin SDK em páginas, actions e endpoints protegidos.
- Revogação e usuário desativado precisam ser considerados.
- Cadastro público desabilitado; criação de colaboradores é ação administrativa.

## Autorização

- Client SDK: Firebase Security Rules.
- Admin SDK: verificação explícita de sessão + permissão + validação, pois Rules são ignoradas.
- Permissões granulares em `users/{uid}`.
- Custom claims somente para atributos pequenos e estáveis.
- Nenhum usuário edita suas próprias funções/permissões.

## Firestore

- Collections orientadas às queries reais.
- IDs sem PII.
- Dinheiro em centavos inteiros.
- Datas com Firestore Timestamp/serverTimestamp.
- Tri-state: `yes`, `no`, `unset`.
- `referenceMonth`: `YYYY-MM`.
- Fingerprint de duplicidade por HMAC server-side.
- Composite indexes versionados.
- Paginação por cursor.
- Sem arrays/documentos ilimitados.
- Dashboards usam aggregation queries ou snapshots, nunca download integral.

## Importação

- Parsing server-side.
- Arquivo efêmero por padrão.
- Validação de cabeçalhos e linhas antes da escrita.
- Staging/revisão no Firestore Emulator em testes.
- Escritas idempotentes com transações, batches ou BulkWriter conforme volume.
- Nenhuma linha é descartada silenciosamente.

## Segurança de produção

- Rules testadas automaticamente.
- App Check onde aplicável.
- IAM mínimo.
- Secrets no Secret Manager/App Hosting.
- Alertas de orçamento e monitoramento de uso.
- Backup/export e restauração documentados.
- Projetos/aliases separados para ambientes.

## Arquivos esperados

```text
firebase.json
.firebaserc.example
firestore.rules
firestore.indexes.json
storage.rules          # somente se Storage for usado
apphosting.yaml        # quando App Hosting for configurado
```
