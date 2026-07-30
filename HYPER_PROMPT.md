# HYPER_PROMPT.md — CIES Gestão

> Contrato mestre de execução para o Google Antigravity.
>
> **Versão:** 3.0 — CRM Comercial + Matrículas + Google Auth  
> **Data:** 29/07/2026  
> **Responsável humano:** Eric  
> **Stakeholder:** Elen  
> **Modo:** execução autônoma controlada  
> **Idioma do produto:** Português do Brasil  
> **Idioma do código:** inglês técnico

## 0. Instrução de partida

Leia integralmente:

1. `AGENTS.md`;
2. `CONTEXT.md`;
3. `HYPER_PROMPT.md`;
4. código, testes e documentação existentes;
5. documentação oficial atual de Next.js, Firebase e Vercel quando uma decisão técnica depender de comportamento atual.

Depois, construa o sistema completo em fases verificáveis.

Não apenas planeje. Implemente, execute, teste, corrija e documente.

Não faça:

- deploy de produção;
- push;
- merge;
- exclusão destrutiva;
- uso de dados reais;
- mudança de regra CONFIRMADA;
- criação de recursos pagos;
- alteração de projeto Firebase remoto;

sem autorização humana explícita.

## 1. Identidade do agente

Você é o orquestrador técnico principal do projeto **CIES Gestão**.

Atue como uma equipe coordenada de:

- produto;
- UX;
- arquitetura;
- full-stack;
- autenticação e segurança;
- dados/importação;
- analytics;
- QA;
- DevOps.

Seu objetivo é entregar uma aplicação empresarial interna funcional, visual, simples, segura, auditável e testável.

Não exponha raciocínio privado detalhado. Registre decisões objetivas, evidências, riscos e próximos passos.

## 2. Resultado esperado

Ao final, o repositório deve conter:

- aplicação Next.js funcional;
- login Google com acesso restrito;
- shell visual;
- RBAC;
- CRM B2C;
- CRM B2B;
- empresas e contatos;
- parcerias;
- atividades;
- metas;
- matrículas;
- importação da planilha;
- dashboards;
- auditoria;
- dados sintéticos;
- Rules e índices;
- testes;
- CI;
- documentação;
- configuração Vercel;
- handoff.

A aplicação deve abrir localmente e permitir demonstrar as jornadas principais com Firebase Emulator Suite ou ambiente de desenvolvimento seguro.

## 3. Fontes de verdade

Ordem:

1. instrução humana mais recente;
2. `HYPER_PROMPT.md`;
3. `CONTEXT.md`;
4. `AGENTS.md`;
5. ADRs/especificações;
6. código/testes;
7. documentação oficial.

Classifique decisões:

- CONFIRMADO;
- PROPOSTO;
- PENDENTE;
- FORA DO ESCOPO.

## 4. Autonomia permitida

Você pode:

- criar e editar arquivos no repositório;
- inicializar projeto;
- instalar dependências justificadas;
- criar Firebase config local;
- criar Rules e índices;
- criar dados sintéticos;
- executar emuladores;
- executar servidor local;
- criar testes;
- criar documentação;
- corrigir falhas;
- usar subagentes com fronteiras claras;
- usar defaults reversíveis marcados como PROPOSTOS;
- avançar entre fases quando gates passarem.

## 5. Gates humanos

Pare somente quando precisar:

- credenciais;
- acesso a serviço externo;
- criar projeto pago;
- escolher região definitiva;
- publicar/deploy;
- push/merge;
- usar dados reais;
- excluir dados;
- alterar regra confirmada;
- decidir permissão empresarial crítica sem default seguro;
- resolver conflito real de requisito.

Questões não bloqueadoras devem ir para `docs/ai/OPEN_QUESTIONS.md`.

## 6. Ações proibidas

Nunca:

- aceite qualquer conta Google;
- disponibilize cadastro público;
- coloque service account no cliente;
- confie somente em Security Rules para Admin SDK;
- use PII em fixtures;
- use CPF como document ID;
- use float para dinheiro;
- descarte linha silenciosamente;
- altere Vendedor/Valor sem permissão;
- faça cálculo principal no navegador baixando coleção inteira;
- crie dashboard decorativo;
- esconda erro;
- declare funcional sem verificar;
- execute comando destrutivo;
- trabalhe diretamente em `main`;
- sobrescreva trabalho humano não relacionado.

## 7. Memória persistente

Crie ou atualize:

```text
docs/ai/
  PROJECT_STATE.md
  TASK_BOARD.md
  DECISION_LOG.md
  OPEN_QUESTIONS.md
  VERIFICATION_EVIDENCE.md
  SESSION_HANDOFF.md
  DATA_DICTIONARY.md
  KPI_CATALOG.md
```

### PROJECT_STATE

- fase;
- módulos;
- arquitetura;
- comandos;
- problemas;
- última verificação.

### TASK_BOARD

Estados:

```text
BACKLOG
READY
IN_PROGRESS
BLOCKED
REVIEW
DONE
```

Cada tarefa:

- ID;
- título;
- owner;
- branch;
- arquivos;
- dependências;
- aceitação;
- validação;
- status.

### DECISION_LOG

- data;
- decisão;
- classificação;
- motivo;
- impacto;
- fonte;
- reversibilidade.

### VERIFICATION_EVIDENCE

- comando;
- resultado;
- data;
- escopo;
- falha;
- correção.

### SESSION_HANDOFF

- objetivo;
- entregue;
- arquivos;
- Git;
- testes;
- bloqueios;
- próximo comando.

### KPI_CATALOG

Cada KPI:

- id;
- nome;
- objetivo;
- fórmula;
- numerador;
- denominador;
- elegibilidade;
- fonte;
- granularidade;
- dimensões;
- filtros;
- tratamento de zero;
- proprietário;
- status.

## 8. Estratégia de branches

Não trabalhar em `main`.

Sugestão:

```text
chore/project-bootstrap
feat/google-auth-rbac
feat/design-system
feat/b2c-pipeline
feat/b2b-companies
feat/partnerships
feat/sales-activities
feat/goals
feat/enrollment-import
feat/dashboard-metrics
feat/reports-action-plans
test/release-candidate
```

Evite agentes editando os mesmos arquivos estruturais simultaneamente.

## 9. Arquitetura-alvo

### Aplicação

- Next.js App Router;
- TypeScript strict;
- Server Components por padrão;
- Tailwind;
- shadcn/ui ou componentes acessíveis equivalentes;
- Server Actions/Route Handlers para mutações;
- validação por schemas;
- monólito modular;
- Vercel.

### Firebase

- Firebase Authentication;
- Google provider;
- Cloud Firestore;
- Admin SDK server-only;
- Security Rules;
- Emulator Suite;
- índices versionados;
- App Check preparado para produção;
- Storage somente se necessário.

### Dados

Coleções:

```text
accessAllowlist
users
employees
sellerAliases
students
enrollments
importBatches
leads
companies
companyContacts
partnerships
salesActivities
goals
campaigns
relationshipCases
actionPlans
auditLogs
metricSnapshots
appSettings
```

### Requisitos de acesso

- acesso negado por padrão;
- usuário pode ter várias áreas;
- permissão por ação;
- consultor externo limitado à própria carteira;
- Gestão com visão total;
- autorização em toda ação server-side;
- Rules testadas.

## 10. Design system

Crie tokens em CSS variables.

Paleta PROPOSTA:

- navy estrutural;
- blue primário;
- neutral background;
- white surface;
- green success;
- amber warning;
- red danger;
- slate text.

Crie componentes:

```text
AppShell
Sidebar
Topbar
PageHeader
GlobalFilterBar
PeriodPicker
KpiCard
GoalProgress
FunnelChart
TrendChart
RankingTable
DataTable
StatusBadge
FilterChip
SearchInput
EntityDrawer
ConfirmDialog
FormField
EmptyState
ErrorState
Skeleton
ActivityTimeline
NextStepAlert
PermissionNotice
```

Diretrizes:

- sem gradientes aleatórios;
- sem gráficos 3D;
- sem animação excessiva;
- sem excesso de cards;
- tabelas utilizáveis;
- foco visível;
- teclado;
- contraste;
- loading;
- vazio;
- erro;
- sucesso;
- mobile utilizável.

## 11. FASE 0 — Preflight

Execute:

1. ler fontes;
2. `git status`;
3. branch;
4. inventário;
5. package manager;
6. código existente;
7. dependências;
8. ambiente;
9. skills;
10. estado de Firebase;
11. criar `docs/ai/`;
12. registrar plano.

Gate:

- nenhuma mudança humana sobrescrita;
- estado documentado;
- tarefas criadas;
- riscos conhecidos.

## 12. FASE 1 — Especificação

Crie:

```text
docs/specifications/product-v1.md
docs/specifications/user-journeys.md
docs/specifications/permissions-matrix.md
docs/specifications/b2c-pipeline.md
docs/specifications/b2b-pipeline.md
docs/specifications/enrollment-import.md
docs/specifications/dashboard-layout.md
docs/specifications/acceptance-criteria.md
```

Incluir:

- personas;
- jornadas;
- campos;
- status;
- regras;
- permissões;
- erros;
- critérios;
- pendências.

Não copiar todo o contexto. Transformar em especificação implementável.

Gate:

- nenhuma regra crítica ambígua;
- defaults marcados;
- jornada completa por módulo;
- aceitação mensurável.

## 13. FASE 2 — Arquitetura e ADRs

Crie:

```text
docs/decisions/0001-modular-nextjs-architecture.md
docs/decisions/0002-firebase-firestore.md
docs/decisions/0003-google-auth-session-allowlist.md
docs/decisions/0004-rbac-and-ownership.md
docs/decisions/0005-firestore-model-and-indexes.md
docs/decisions/0006-money.md
docs/decisions/0007-duplicate-identity.md
docs/decisions/0008-spreadsheet-import.md
docs/decisions/0009-kpi-calculation.md
docs/decisions/0010-vercel-deployment.md
docs/decisions/0011-audit-and-pii.md
docs/architecture/system-overview.md
docs/architecture/data-model.md
docs/architecture/security-model.md
docs/architecture/query-index-plan.md
```

Crie diagramas Mermaid:

- contexto;
- autenticação;
- fluxo B2C;
- fluxo B2B;
- importação;
- atualização de KPI.

Gate:

- fronteira Client/Admin explícita;
- queries definidas;
- índices previstos;
- autorização clara;
- estratégia de custo;
- estratégia de sessão;
- threat model leve.

## 14. FASE 3 — Bootstrap

Inicialize ou ajuste:

- Next.js;
- TypeScript strict;
- Tailwind;
- componentes;
- lint;
- typecheck;
- testes;
- E2E;
- Firebase CLI;
- Emulator Suite;
- Rules;
- índices;
- `.env.example`;
- CI;
- layout base;
- design tokens;
- seeds sintéticos.

Scripts esperados:

```json
{
  "dev": "...",
  "build": "...",
  "lint": "...",
  "typecheck": "...",
  "test": "...",
  "test:rules": "...",
  "test:e2e": "...",
  "emulators": "...",
  "verify": "..."
}
```

Gate:

```text
install PASS
lint PASS
typecheck PASS
unit smoke PASS
rules smoke PASS
build PASS
```

## 15. FASE 4 — Login Google, sessão e RBAC

Implemente login Google funcional.

### Cliente

- `GoogleAuthProvider`;
- popup;
- redirect fallback;
- loading;
- erros;
- envio de ID token.

### Servidor

- endpoint de sessão;
- CSRF;
- verificar ID token;
- verificar `email_verified`;
- normalizar e-mail;
- consultar allowlist server-only;
- negar conta não autorizada;
- validar colaborador ativo;
- criar/atualizar `users/{uid}`;
- criar cookie de sessão;
- verificar cookie;
- logout;
- revogação;
- helpers de autorização.

Helpers:

```text
requireSession
requireActiveUser
requirePermission
requireOwnershipOrPermission
createAuditLog
```

### Admin

Criar tela de acessos:

- adicionar e-mail;
- áreas;
- permissões;
- ativo/inativo;
- revogar acesso;
- auditoria.

### Testes

- autorizado;
- não autorizado;
- desativado;
- e-mail não verificado;
- sessão expirada;
- rota direta;
- autoelevação;
- ownership;
- Gestão.

Gate:

- nenhuma rota protegida depende apenas do middleware/proxy;
- ações sensíveis revalidam no servidor;
- cliente não lê allowlist;
- Rules negam acesso indevido.

## 16. FASE 5 — Shell visual

Crie:

- login;
- sidebar;
- topbar;
- navegação por permissão;
- dashboard skeleton;
- Minha Área;
- breadcrumbs quando úteis;
- filtros globais;
- estados;
- perfil e logout.

Não criar páginas genéricas vazias. Cada rota implementada deve ter função real ou estado “em preparação” explicitamente temporário apenas durante desenvolvimento.

Valide:

- desktop;
- notebook;
- tablet;
- mobile;
- teclado;
- foco.

## 17. FASE 6 — Leads B2C

Implemente:

- lista;
- kanban opcional apenas se útil;
- cadastro;
- edição;
- busca;
- filtros;
- proprietário;
- status;
- último/próximo contato;
- origem;
- interesse;
- motivo de perda;
- alertas de follow-up;
- conversão;
- timeline;
- auditoria.

Jornada:

```text
criar lead
→ atribuir
→ registrar contato
→ qualificar
→ proposta
→ follow-up
→ matricular
→ vincular matrícula
```

Regras:

- owner obrigatório;
- perda exige motivo;
- próximo passo visível;
- consultor vê carteira;
- Gestão redistribui;
- dados mascarados conforme necessidade.

Testes:

- permissões;
- filtros;
- follow-up;
- status;
- conversão;
- duplicidade de telefone;
- redistribuição.

Gate:

- uma jornada B2C completa passa em E2E.

## 18. FASE 7 — Empresas, contatos e B2B

Implemente:

- empresas;
- contatos;
- decisor;
- carteira;
- status;
- próximo passo;
- reunião;
- proposta;
- histórico;
- motivo de não interesse;
- duplicidade;
- filtros;
- auditoria.

Jornada:

```text
prospectar empresa
→ contato
→ identificar decisor
→ marcar reunião
→ realizar reunião
→ enviar proposta
→ negociar
→ aprovar parceria
```

Testes:

- empresa sem CNPJ;
- empresa com CNPJ;
- duplicidade;
- ownership;
- reunião;
- proposta;
- próximo passo;
- sem interesse.

Gate:

- jornada B2B completa passa.

## 19. FASE 8 — Parcerias

Implemente:

- converter oportunidade B2B em parceria;
- benefício;
- responsável;
- status;
- ativação;
- leads vinculados;
- matrículas vinculadas;
- receita;
- última ação;
- inatividade;
- tabela de performance.

Jornada:

```text
parceria aprovada
→ ativar
→ divulgar
→ receber lead
→ converter
→ atribuir resultado à parceria
```

Gate:

- lead e matrícula vinculados aparecem na performance da parceria.

## 20. FASE 9 — Atividades

Implemente timeline unificada.

Eventos automáticos:

- lead criado;
- mudança de status;
- contato;
- reunião;
- proposta;
- parceria;
- conversão;
- matrícula.

Permitir atividade manual rápida.

Criar visão:

- minhas atividades;
- equipe;
- por período;
- por tipo;
- pendentes;
- próximos passos.

Evitar contador manual desconectado.

Gate:

- atividade pode ser rastreada até a entidade.

## 21. FASE 10 — Metas

Implemente:

- metas por período;
- empresa/equipe/consultor;
- métrica;
- alvo;
- progresso calculado;
- histórico;
- permissões;
- status.

Métricas:

- leads;
- contatos;
- reuniões;
- propostas;
- parcerias;
- matrículas;
- faturamento.

Não permitir realizado manual quando calculável.

Gate:

- meta e realizado reconciliam com dados.

## 22. FASE 11 — Matrículas e importação

Implemente:

- parser;
- staging;
- cabeçalhos;
- normalização;
- moeda;
- CPF;
- telefone;
- tri-state;
- instituição;
- pagamento;
- curso;
- vendedor;
- duplicidade;
- prévia;
- conflitos;
- confirmação;
- histórico;
- edição;
- auditoria;
- reversão segura.

Casos:

- arquivo válido;
- ausente;
- ordem diferente;
- SIM/NÃO/vazio;
- mesmo CPF em curso diferente;
- duplicado exato;
- vendedor desconhecido;
- reimportação;
- linha inválida;
- lote parcial;
- permissão insuficiente.

Gate:

- fixture sintética demonstra ponta a ponta.

## 23. FASE 12 — Relacionamento

Implemente:

- lista de matrículas;
- Subiu;
- BVS;
- boas-vindas pendentes;
- Redirect;
- ações rápidas;
- filtros;
- histórico;
- Minha Área do Relacionamento.

Jornada:

```text
Subiu = SIM
→ BVS pendente
→ abrir WhatsApp
→ marcar BVS = SIM
→ sair da pendência
→ atualizar KPI
```

Gate:

- E2E verde.

## 24. FASE 13 — Dashboard e analytics

### Camada central

Crie funções server-side de métricas. Não duplicar fórmula em componentes.

### Dashboard executivo

Entregar:

- período;
- matrículas;
- meta;
- faturamento;
- conversão;
- parcerias;
- BVS;
- tendência;
- B2C;
- B2B;
- ranking;
- alertas.

### Dashboard comercial

- funil;
- conversão;
- follow-ups;
- atividades;
- metas;
- origens;
- perdas;
- consultores.

### Dashboard B2B

- etapas;
- reuniões;
- propostas;
- parcerias;
- sem próximo passo;
- parcerias sem ação;
- resultado por empresa.

### Dashboard operacional

- matrícula;
- importação;
- Subiu;
- BVS;
- faturamento;
- inconsistências.

### Filtros

- período;
- consultor;
- instituição;
- curso;
- modalidade;
- origem;
- empresa;
- status.

### Regras

- uma fonte de fórmula;
- zero seguro;
- filtros coerentes;
- cards, gráficos e tabelas reconciliam;
- pt-BR;
- alternativa textual;
- não baixar coleção inteira.

Testes:

- fórmula;
- período;
- filtro;
- escopo;
- dinheiro;
- reconciliação;
- dados vazios.

Gate:

- KPI Catalog completo;
- testes verdes;
- números reconciliados.

## 25. FASE 14 — Campanhas, 5W2H e relatórios

Depois do núcleo:

### Campanhas

- canal;
- período;
- custo;
- leads;
- matrículas;
- conversão.

### 5W2H

- What;
- Why;
- Where;
- When;
- Who;
- How;
- How much;
- KPI;
- status;
- resultado.

### Relatórios

- visão mensal;
- matrículas;
- faturamento;
- B2C;
- B2B;
- consultor;
- instituição;
- parceria;
- BVS/Subiu;
- meta.

Exportação somente se não comprometer o núcleo.

## 26. FASE 15 — QA, segurança e polimento

Execute revisão completa:

- código;
- autorização;
- Rules;
- PII;
- upload;
- logs;
- CSRF;
- XSS;
- rate limiting;
- headers;
- dependências;
- acessibilidade;
- responsividade;
- performance;
- índices;
- custo;
- testes;
- build;
- critérios de aceitação.

Comandos:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:rules
npm run test:e2e
npm run build
npm run verify
```

Corrija falhas e repita.

Não esconda falhas.

## 27. FASE 16 — Preparação Vercel

Sem fazer deploy não autorizado:

- criar `vercel.json` apenas se necessário;
- documentar variáveis;
- separar client/server env;
- preparar preview;
- verificar compatibilidade de Admin SDK;
- documentar domínio;
- documentar Firebase authorized domains;
- documentar callback/redirect;
- documentar secrets;
- documentar checklist.

Gate:

- build local de produção;
- documentação de deploy;
- nenhum secret commitado.

## 28. Variáveis esperadas

Criar `.env.example`, sem valores reais:

```text
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

SESSION_COOKIE_NAME=
SESSION_COOKIE_MAX_AGE=
AUTH_EMAIL_HMAC_SECRET=
CPF_HMAC_SECRET=
CNPJ_HMAC_SECRET=
APP_URL=
```

Preferir credenciais gerenciadas/ADC quando o ambiente suportar. Documentar a estratégia.

## 29. Fixtures sintéticas

Criar:

- Gestão;
- Relacionamento;
- Administrativo;
- Comercial;
- Marketing;
- 3 consultores externos fictícios;
- leads em todas as etapas;
- empresas;
- reuniões;
- propostas;
- parcerias;
- metas;
- matrículas;
- BVS/Subiu;
- campanhas;
- atividades.

Nenhum dado real.

## 30. Critérios E2E obrigatórios

### Auth

```text
Google autorizado → dashboard
Google não autorizado → bloqueio
logout → login
```

### B2C

```text
criar → contatar → proposta → matricular
```

### B2B

```text
empresa → decisor → reunião → proposta → parceria
```

### Parceria

```text
parceria → lead → matrícula → indicador
```

### Matrícula

```text
importar → revisar → confirmar → editar
```

### Relacionamento

```text
Subiu → BVS pendente → BVS enviada
```

### Meta

```text
criar meta → gerar realizado → dashboard
```

### Segurança

```text
consultor A não altera carteira de B
Relacionamento não altera Vendedor
usuário comum não administra acesso
requisição direta não contorna UI
```

## 31. Definition of Done

Só marque tarefa DONE quando:

- critério identificado;
- código implementado;
- autorização server-side;
- validação;
- estados;
- testes;
- lint;
- typecheck;
- build;
- docs;
- sem PII;
- sem secrets;
- auditoria;
- evidência;
- handoff.

Só marque sistema funcional quando as jornadas críticas estiverem demonstradas.

## 32. Entrega final do agente

```markdown
# Resultado da execução

## Estado
Concluído | Parcial | Bloqueado

## Visão do produto entregue
- ...

## Jornadas funcionais
- ...

## Arquivos principais
- ...

## Firestore, Rules e índices
- ...

## Login Google e permissões
- ...

## Dashboard e KPIs
- ...

## Verificações
- comando — PASS/FAIL

## Evidências
- ...

## Decisões propostas
- ...

## Pendências humanas
- ...

## Riscos
- ...

## Como executar
- ...

## Próximo passo exato
- ...
```

Nunca use “100% concluído” quando houver gate falhando ou configuração externa pendente.

## 33. Instrução final

Agora:

1. entre em modo autônomo controlado;
2. execute a Fase 0;
3. crie memória persistente;
4. especifique;
5. arquitete;
6. implemente todas as fases do núcleo;
7. teste;
8. corrija;
9. documente;
10. prepare Vercel sem deploy não autorizado;
11. pare apenas em gate humano real;
12. mantenha `SESSION_HANDOFF.md` atualizado.

Construa o sistema para a operação real da CIES, não para uma demonstração artificial.
