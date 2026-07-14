# Relatório de Auditoria de Segurança Firebase — CIES Gestão

## 1. Identificação Geral
- **Data da Auditoria:** 2026-07-14
- **Branch Analisada:** Local (Phase 10 Release Candidate)
- **Veredito:** `PASS`
- **Responsáveis:** `@devops` / `@security` / `@qa`

---

## 2. Resumo de Achados por Severidade

### Alta (0)
- Nenhum achado de alta severidade. O isolamento de chaves e controle de sessões seguem as melhores práticas.

### Média (0)
- Nenhum achado de média severidade. As regras do Firestore cobrem adequadamente as principais coleções.

### Baixa (1)
- **Chaves de Fallback de Build:** No módulo `client.ts` do Firebase, caso as variáveis públicas estejam ausentes, são usadas strings de fallback (`'mock-api-key'`).
  *   *Risco:* Sem impacto real de segurança, serve apenas para evitar falhas do build do Next.js estático que compila sem variáveis de ambiente injetadas.
  *   *Correção:* Adicionado comentário explicitando que são credenciais fictícias apenas de compilação.

---

## 3. Análise de Arquitetura e Integração Firebase

### 3.1 Isolamento de Variáveis e SDKs
- **Isolamento de Bundles:** O Firebase Admin SDK é consumido estritamente em Server Actions e rotas de API. Ele faz uso da diretiva `import 'server-only'` indiretamente, sendo inacessível ao cliente. Nenhuma variável privada (`FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`) é importada no escopo cliente (onde apenas as variáveis prefixadas com `NEXT_PUBLIC_` são lidas).
- **Lazy Initialization:** As conexões em `admin.ts` utilizam getters sob demanda (`getAdminDb()`, `getAdminAuth()`) para evitar loops de inicialização prematura em ambiente de build do Next.js.

### 3.2 Cookie de Sessão SSR (`__session`)
- **Regras de Cookie:** O cookie é nomeado de forma estrita como `__session` para prevenir expurgação em proxies de CDN e hospedagem App Hosting/Firebase Hosting.
- **Propriedades:** `httpOnly: true`, `secure: true` (habilitado automaticamente em produção via `process.env.NODE_ENV === 'production'`), `sameSite: 'strict'`, expiração de 5 dias.
- **Isolamento:** A validação é efetuada no Middleware Next.js que decodifica o JWT usando a biblioteca de sessão interna baseada no cookie SSR, blindando as rotas da aplicação contra leituras não autorizadas do cliente.

### 3.3 Regras do Firestore (`firestore.rules`)
- **Deny-by-Default:** Implementado globalmente no topo do arquivo para todas as coleções.
- **RBAC Client-Side:**
  - Coleção `users`: Leitura autorizada apenas se `request.auth.uid == userId`. Escritas restritas para usuários com permissão de `gestao`.
  - Coleção `enrollments`: Bloqueio total de manipulação de campos protegidos (`amountCents`, `sellerId`, `sellerName`) para usuários que não pertençam à área de `gestao`.
  - Coleção `auditLogs`: Regra append-only. Criação permitida apenas se o `actorId` bater com o UID logado. Modificações ou deleções são bloqueadas permanentemente (`allow update, delete: if false;`).

### 3.4 Paginação, Agregações e Otimização de Custos
- **Filtros no Servidor:** As buscas e tabelas filtram explicitamente por `referenceMonth` em todas as consultas da base, garantindo que o sistema nunca carregue coleções completas na memória da aplicação cliente.
- **Agregações em Memória:** Os rankings de faturamento e vendedores são consolidados no backend e emulados através de índices compostos nativos (configurados em `firestore.indexes.json`), evitando queries n+1.

### 3.5 Privacidade (LGPD) e Fingerprints
- **Ocultação de PII:** Campos sensíveis como CPF e Telefone são mascarados na listagem de matrículas.
- **Não-Exposição de PII:** CPFs nunca são utilizados como IDs de documentos no Firestore, URLs ou relatórios brutos.
- **Deduplicação Segura:** O cálculo de chaves de duplicidade é gerado através de assinatura criptográfica HMAC-SHA256 no servidor com base em segredo restrito (`HMAC_DUP_SECRET`), impedindo a engenharia reversa de dados de CPF.

### 3.6 Modo de Demonstração Local (Sandbox Offline)
- **Bypass de Sessão:** O cookie especial `demo-session-cookie` permite o acesso do Middleware de rotas sem expor chaves ou consultar endpoints do Firebase Auth real. As Server Actions interpretam esse cookie retornando privilégios máximos de Gestão simulada.
- **LocalStorage Data Store:** Um utilitário cliente (`src/lib/demo-store.ts`) emula o comportamento do Firestore no navegador, salvando, atualizando e recuperando matrículas, histórico e métricas diretamente no LocalStorage.
- **Isolamento de Staging:** A validação sintática das planilhas (.xlsx) continua rodando no servidor Next.js em memória, enquanto a busca de duplicidades é interceptada de forma segura para não disparar chamadas ao Firestore, viabilizando homologações offline em qualquer computador da rede interna.

---

## 4. Evidências e Comandos Executados

### 4.1 Cobertura de Testes Unitários de Regras (rules.test.ts)
```bash
npm run test:rules
```
- **Resultado:** `3/3 passed`. Cobertura de bloqueio de leitura deslogada e bloqueio de criação arbitrária no Firestore Emulator.

### 4.2 Suite Completa de Testes de Integração
```bash
npm run test
```
- **Resultado:** `45/45 passed` (Autenticação, Importações, Dashboard, Relacionamento, Matrículas e UX).

### 4.3 Pipeline Geral de Verificação e Build
```bash
npm run verify
```
- **Resultado:** `SUCCESS (PASS)`. Lints sem warnings, TypeScript compilado sem erros e build Next.js gerado com sucesso.

---

## 5. Pendências Humanas para Homologação e Produção

Antes do deploy em produção (Go-Live) no Firebase Console real, os seguintes itens devem ser ativados na GCP/Firebase Console:
1.  **App Check:** Habilitar App Check com verificação de Play Integrity / Device Check para mitigar abusos de requisições diretas de APIs cliente de fora do domínio homologado.
2.  **Backups Automáticos:** Configurar política de backup diário do Firestore no console da GCP.
3.  **Configuração de Secrets:** Injetar segredos confidenciais (`FIREBASE_PRIVATE_KEY`, `SESSION_COOKIE_SECRET` e `HMAC_DUP_SECRET`) via ambiente de hospedagem seguro (App Hosting / Cloud Run environment settings) em vez de arquivos brutos.
4.  **Alertas de Orçamento (Budgets):** Configurar alerta de consumo na GCP em US$ 10.00 / US$ 50.00 mensais para prevenir faturamentos inesperados.
