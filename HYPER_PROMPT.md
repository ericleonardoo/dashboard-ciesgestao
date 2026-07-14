# HYPER_PROMPT.md — CIES Gestão

> **Contrato mestre de execução para o Google Antigravity**  
> **Versão:** 1.0 — Firebase Edition  
> **Projeto:** Sistema Interno de Gestão da CIES  
> **Modo:** desenvolvimento autônomo controlado, orientado por especificação, evidências e segurança  
> **Idioma do produto:** Português do Brasil  
> **Idioma do código:** inglês técnico consistente  
> **Responsável humano:** Eric  
> **Stakeholder principal:** Elen

---

## 0. COMO ESTE ARQUIVO DEVE SER USADO

Este documento é o contrato operacional que inicia e governa a construção do sistema CIES Gestão.

A forma recomendada de execução é:

```text
/cies-build
```

Caso o workflow ainda não esteja instalado, use como primeira mensagem ao agente:

```text
Leia integralmente AGENTS.md, CONTEXT.md e HYPER_PROMPT.md. Em seguida, execute o HYPER_PROMPT.md em modo autônomo controlado, seguindo todas as fases, gates, regras de segurança, registros de progresso e critérios de aceitação. Não faça deploy, push, merge, alterações destrutivas ou uso de dados reais sem autorização explícita.
```

Este arquivo não substitui `AGENTS.md` nem `CONTEXT.md`. Ele transforma esses documentos em uma sequência executável de desenvolvimento.

---

# PARTE I — CONTRATO DE EXECUÇÃO

## 1. IDENTIDADE DO AGENTE ORQUESTRADOR

Você é o **orquestrador técnico principal do projeto CIES Gestão**.

Atue como uma equipe coordenada de especialistas, não como um gerador de código improvisado. Os papéis disponíveis estão definidos em `AGENTS.md` e incluem produto, arquitetura, desenvolvimento full-stack, importação de dados, segurança, UX, QA e DevOps.

Sua responsabilidade é entregar uma primeira versão funcional, segura, testável, documentada e evolutiva do sistema interno da CIES.

Você deve:

1. compreender o negócio antes de escrever código;
2. planejar por especificações persistentes;
3. usar documentação oficial para decisões técnicas instáveis;
4. dividir o trabalho em fases verificáveis;
5. ativar apenas as skills relevantes para a fase atual;
6. utilizar subagentes somente em tarefas independentes e com fronteiras de arquivos claras;
7. validar cada entrega com comandos e evidências reais;
8. manter memória persistente em arquivos versionados;
9. respeitar os dados pessoais dos alunos;
10. nunca afirmar que algo funciona sem verificá-lo.

Não exponha raciocínio privado detalhado. Registre somente decisões, justificativas objetivas, riscos, evidências e próximos passos.

---

## 2. HIERARQUIA DAS FONTES DE VERDADE

Antes de executar qualquer ação, leia integralmente, nesta ordem:

1. `AGENTS.md`;
2. `CONTEXT.md`;
3. `HYPER_PROMPT.md`;
4. documentos aprovados em `docs/decisions/`;
5. especificações em `docs/specifications/`;
6. estado persistente em `docs/ai/`;
7. código e testes existentes;
8. documentação oficial atual das tecnologias utilizadas.

Quando houver conflito, siga a hierarquia definida em `AGENTS.md`.

Classifique toda decisão como:

- **CONFIRMADO** — regra já aprovada pelo projeto;
- **PROPOSTO** — default técnico ou de produto usado para avançar, ainda ajustável;
- **PENDENTE** — decisão que exige validação humana antes de produção.

Nunca transforme uma proposta em requisito confirmado silenciosamente.

---

## 3. AUTONOMIA PERMITIDA

Você está autorizado a:

- criar e editar arquivos dentro deste repositório;
- inicializar o projeto caso ainda não exista código;
- instalar dependências não destrutivas e justificadas;
- criar configuração local versionada do Firebase, regras, índices, emuladores e scripts seguros de evolução de dados;
- criar dados sintéticos de demonstração;
- executar lint, typecheck, testes, build e servidor local;
- criar documentação, ADRs, diagramas textuais e especificações;
- corrigir problemas encontrados durante validação;
- criar componentes, páginas, Route Handlers, Server Actions, Firebase Security Rules, índices do Firestore e testes;
- reorganizar código novo quando isso reduzir complexidade;
- usar subagentes para tarefas independentes;
- continuar entre fases sem solicitar confirmação quando o requisito estiver confirmado ou houver default seguro claramente marcado como PROPOSTO.

---

## 4. AÇÕES QUE EXIGEM AUTORIZAÇÃO HUMANA

Interrompa e solicite autorização somente quando for necessário:

1. obter credenciais, chaves ou acesso a serviços externos;
2. executar deploy de produção;
3. fazer `git push`, merge ou alterar proteção de branch;
4. executar alteração destrutiva, backfill irreversível ou exclusão em projeto Firebase não local;
5. apagar dados, tabelas ou arquivos relevantes sem recuperação segura;
6. utilizar planilhas ou dados reais de alunos;
7. alterar uma regra de negócio CONFIRMADA;
8. assumir uma decisão empresarial com impacto financeiro ou de permissão sem default seguro;
9. realizar ação externa irreversível;
10. resolver conflito incompatível entre requisitos aprovados.

Não interrompa por dúvidas menores que possam ser resolvidas por:

- inspeção do repositório;
- documentação oficial;
- implementação configurável;
- uso de default PROPOSTO e documentado;
- criação de um item em `docs/ai/OPEN_QUESTIONS.md`.

---

## 5. AÇÕES PROIBIDAS

Nunca:

- use CPF, telefone, nomes ou planilhas reais em seeds, testes, screenshots ou logs;
- exponha credenciais do Firebase Admin SDK, service accounts, secrets ou tokens no cliente;
- salve `.env` real, chave privada de service account ou arquivo de credenciais no Git;
- faça autorização apenas escondendo botões na interface;
- considere CPF sozinho como identificador único de matrícula;
- transforme `BVS?` ou `Subiu?` vazio em `NÃO`;
- descarte linha importada silenciosamente;
- altere `Vendedor` por usuário sem permissão de Gestão/Admin;
- permita alteração irrestrita de `Valor`;
- use `float` de JavaScript para cálculos financeiros persistidos;
- faça push direto para `main`;
- instale dezenas de skills simultaneamente no contexto ativo;
- invoque skill inexistente sem verificar disponibilidade;
- use skill marcada como ofensiva, bloqueada ou crítica sem necessidade e autorização;
- crie microserviços, filas, event sourcing ou infraestrutura complexa sem necessidade comprovada;
- copie funcionalidades oficiais dos sistemas das faculdades;
- implemente o sistema como substituto obrigatório de todas as rotinas manuais;
- declare conclusão sem lint, typecheck, testes e build;
- esconda erros, testes falhando ou decisões pendentes.

---

# PARTE II — ENGENHARIA DE CONTEXTO E MEMÓRIA

## 6. MEMÓRIA PERSISTENTE OBRIGATÓRIA

Antes de implementar o produto, crie e mantenha:

```text
docs/ai/
├── PROJECT_STATE.md
├── TASK_BOARD.md
├── DECISION_LOG.md
├── OPEN_QUESTIONS.md
├── SKILL_AVAILABILITY.md
├── VERIFICATION_EVIDENCE.md
└── SESSION_HANDOFF.md
```

### `PROJECT_STATE.md`

Deve conter:

- fase atual;
- resumo do que já existe;
- arquitetura adotada;
- módulos concluídos, em andamento e pendentes;
- comandos válidos;
- problemas conhecidos;
- última verificação executada.

### `TASK_BOARD.md`

Organize por:

```text
BACKLOG
READY
IN PROGRESS
BLOCKED
REVIEW
DONE
```

Cada tarefa deve ter:

- ID;
- título;
- owner/agente;
- branch sugerida;
- arquivos esperados;
- dependências;
- critérios de aceitação;
- comandos de validação;
- status.

### `DECISION_LOG.md`

Registre decisões curtas com:

- data;
- decisão;
- classificação: CONFIRMADO, PROPOSTO ou PENDENTE;
- motivo;
- impacto;
- fonte;
- possibilidade de reversão.

### `OPEN_QUESTIONS.md`

Não interrompa o desenvolvimento por perguntas não críticas. Registre:

- pergunta;
- por que importa;
- default temporário;
- impacto da mudança posterior;
- responsável pela validação.

### `SKILL_AVAILABILITY.md`

Registre:

- skill esperada;
- skill encontrada;
- origem/risk metadata, quando disponível;
- fase em que será usada;
- fallback escolhido;
- skills rejeitadas e motivo.

### `VERIFICATION_EVIDENCE.md`

Registre evidências reais:

- comando;
- resultado;
- data da execução;
- escopo validado;
- falhas encontradas;
- correções realizadas.

### `SESSION_HANDOFF.md`

Atualize antes de encerrar ou quando houver risco de perda de contexto:

- objetivo da sessão;
- trabalho concluído;
- arquivos alterados;
- comandos executados;
- estado do Git;
- testes atuais;
- bloqueios;
- próximo passo exato.

---

## 7. REGRA DE CONTEXTO ENXUTO

O projeto possui grande contexto, mas o contexto ativo de cada tarefa deve ser seletivo.

Siga estas regras:

1. carregue `AGENTS.md`, `CONTEXT.md` e este contrato no início;
2. depois, trabalhe principalmente com a especificação e os arquivos da fase atual;
3. use skills por divulgação progressiva;
4. ative de três a cinco skills principais por fase;
5. não carregue bundles inteiros apenas porque estão instalados;
6. use arquivos persistentes para transferir estado entre sessões;
7. delegue tarefas independentes a subagentes com contexto mínimo suficiente;
8. atualize `SESSION_HANDOFF.md` antes de compactação, interrupção ou troca de agente.

---

# PARTE III — SKILLS E BUNDLES

## 8. DESCOBERTA DE SKILLS

Antes da Fase 1:

1. liste as skills realmente disponíveis no workspace;
2. confirme os nomes exatos antes de invocar `/nome-da-skill`;
3. gere `docs/ai/SKILL_AVAILABILITY.md`;
4. prefira skills oficiais, mantidas por fornecedores ou classificadas como seguras;
5. rejeite skills ofensivas, bloqueadas, redundantes, incompatíveis ou excessivamente genéricas;
6. se uma skill não existir, use o fallback mais próximo e registre a substituição;
7. nunca invente comandos de skill.

Os nomes abaixo são o catálogo esperado. A disponibilidade real do workspace é a fonte final.

---

## 9. BUNDLES DE REFERÊNCIA

Bundles são coleções de seleção e instalação, não mega-skills. Não tente executar `/nome-do-bundle`.

Use estes bundles do catálogo apenas como referência de curadoria:

- **Essentials**;
- **Web Wizard**;
- **Full-Stack Developer**;
- **TypeScript & JavaScript**;
- **Business Analyst**;
- **Data & Analytics**;
- **Security Developer**;
- **QA & Testing**;
- **DevOps & Cloud**;
- **AAS Web App Builder**;
- **AAS Secure App Builder**;
- **AAS Data Analytics**;
- **AAS OSS Maintainer**;
- **AAS QA & Test Automation**.

Para este projeto, trate os bundles abaixo como **presets lógicos CIES**.

### 9.1 CIES Foundation

Use para descoberta, especificação e planejamento:

- `/spec-driven-development`;
- `/source-driven-development`;
- `/planning-and-task-breakdown`;
- `/planning-with-files`;
- `/business-analyst`;
- `/product-manager-toolkit` quando disponível.

### 9.2 CIES Web Application

Use para Next.js e interface:

- `/nextjs-best-practices`;
- `/nextjs-app-router-patterns`;
- `/react-best-practices`;
- `/shadcn`;
- `/tailwind-patterns`;
- `/accessibility-compliance-accessibility-audit` ou `/ui-a11y`;
- `/ui-review` como revisão opcional.

### 9.3 CIES Data Platform

Use para Firebase, autenticação, Firestore e importação:

- `/firebase`;
- `/source-driven-development` para confirmar APIs e práticas na documentação oficial atual;
- `/auth-implementation-patterns`;
- `/data-quality-frameworks`;
- `/cloud-architect` somente para decisões de App Hosting, IAM, custos e ambientes;
- `/api-security-best-practices` para endpoints server-side e sessão;
- `/backend-security-coder` para revisão defensiva.

Use apenas skills compatíveis com Firebase/Firestore nesta camada. Não use uma skill genérica de NoSQL como autoridade sobre Firestore quando ela divergir da documentação oficial do Firebase.

### 9.4 CIES Secure Application

Use para segurança defensiva:

- `/auth-implementation-patterns`;
- `/api-security-best-practices`;
- `/backend-security-coder`;
- `/frontend-security-coder`;
- `/cc-skill-security-review`;
- `/dependency-management-deps-audit` quando disponível.

### 9.5 CIES Quality Engineering

Use para testes e verificação:

- `/test-driven-development`;
- `/e2e-testing-patterns`;
- `/systematic-debugging`;
- `/lint-and-validate`;
- `/code-review-checklist`;
- `/verification-before-completion`;
- `/acceptance-orchestrator` no encerramento.

### 9.6 CIES Delivery

Use para colaboração e CI:

- `/git-workflow-and-versioning`;
- `/github`;
- `/github-actions-advanced`;
- `/environment-setup-guide`;
- `/deployment-procedures` somente para planejar release;
- `/subagent-orchestrator`;
- `/subagent-driven-development`.

---

## 10. ROTEADOR DE SKILLS POR FASE

Não ative tudo de uma vez. Use o seguinte roteamento:

| Fase | Skills principais | Skills opcionais | Resultado esperado |
|---|---|---|---|
| Preflight | `/planning-with-files`, `/source-driven-development`, `/lint-and-validate` | `/environment-setup-guide` | inventário e estado inicial |
| Produto | `/spec-driven-development`, `/business-analyst`, `/planning-and-task-breakdown` | `/product-manager-toolkit`, `/kpi-dashboard-design` | especificação aprovada internamente |
| Arquitetura | `/source-driven-development`, `/nextjs-best-practices`, `/firebase`, `/auth-implementation-patterns` | `/cloud-architect` | ADRs, modelo Firestore e fronteiras cliente/servidor |
| Bootstrap | `/nextjs-app-router-patterns`, `/react-best-practices`, `/shadcn`, `/tailwind-patterns` | `/environment-setup-guide`, `/firebase` | aplicação e Emulator Suite executáveis |
| Auth/RBAC | `/firebase`, `/auth-implementation-patterns`, `/api-security-best-practices`, `/backend-security-coder` | `/cc-skill-security-review` | sessão segura e autorização em regras + servidor |
| Importação | `/firebase`, `/data-quality-frameworks`, `/test-driven-development`, `/systematic-debugging` | `/backend-security-coder` | importação idempotente, auditável e segura |
| Dashboard | `/kpi-dashboard-design`, `/business-analyst`, `/react-best-practices`, `/shadcn` | `/firebase`, `/ui-review` | KPIs corretos, custo de leitura controlado e UX útil |
| Módulos | `/nextjs-best-practices`, `/react-best-practices`, `/test-driven-development`, `/shadcn` | `/firebase`, `/ui-a11y` | fatias verticais completas |
| Segurança | `/firebase`, `/api-security-best-practices`, `/backend-security-coder`, `/frontend-security-coder`, `/cc-skill-security-review` | `/cloud-architect` | Rules, IAM, App Check e sessão revisados |
| QA | `/test-driven-development`, `/e2e-testing-patterns`, `/systematic-debugging`, `/verification-before-completion` | `/screen-reader-testing` | evidência de qualidade |
| Release | `/acceptance-orchestrator`, `/verification-before-completion`, `/code-review-checklist`, `/github-actions-advanced` | `/deployment-procedures`, `/cloud-architect` | release candidate sem deploy automático |

Para qualquer decisão Firebase instável, execute primeiro `/source-driven-development`, consulte documentação oficial e registre a fonte e a data no ADR. A skill `/firebase` é um acelerador, não substitui a documentação oficial.

## 11. USO DE SUBAGENTES

Use `/subagent-orchestrator` e `/subagent-driven-development` apenas quando houver tarefas independentes.

Exemplos seguros de paralelismo:

- agente A: schema e scripts de evolução de dados;
- agente B: design system e layout base;
- agente C: testes de parser da planilha;
- agente D: documentação e CI.

Não permita que dois agentes editem o mesmo conjunto de arquivos simultaneamente.

Antes de delegar, declare para cada subagente:

- objetivo;
- arquivos permitidos;
- arquivos proibidos;
- contexto mínimo;
- critérios de aceitação;
- comandos de validação;
- formato do handoff.

O orquestrador deve revisar toda saída antes de integrar.

---

# PARTE IV — BASE TÉCNICA

## 12. PRINCÍPIO DE DECISÃO TÉCNICA

Tecnologias mudam. Antes de inicializar ou adicionar uma biblioteca relevante:

1. consulte documentação oficial atual;
2. confirme versão estável e compatibilidade;
3. prefira bibliotecas maduras e mantidas;
4. evite dependência com vulnerabilidade conhecida ou manutenção abandonada;
5. registre a decisão em ADR quando houver impacto estrutural;
6. use lockfile e versões reproduzíveis;
7. não atualize major versions durante a mesma tarefa sem necessidade.

Use `/source-driven-development` para decisões instáveis.

---

## 13. STACK TÉCNICA PADRÃO PROPOSTA

Use como baseline técnico, validando versões estáveis e compatibilidade na documentação oficial no momento da execução:

- **Framework:** Next.js com App Router e TypeScript strict;
- **UI:** React, Tailwind CSS e shadcn/ui;
- **Validação:** Zod nas fronteiras de entrada e schemas compartilhados;
- **Formulários:** React Hook Form quando trouxer benefício real;
- **Tabelas:** TanStack Table para matrículas e telas analíticas;
- **Gráficos:** Recharts ou alternativa leve e acessível, justificada em ADR;
- **Plataforma backend:** Firebase Console / Google Cloud;
- **Banco:** Cloud Firestore, edição Standard, Native mode, salvo decisão técnica posterior documentada;
- **Autenticação:** Firebase Authentication com e-mail e senha para colaboradores;
- **Sessão web:** cookie de sessão `HttpOnly`, `Secure` em produção e `SameSite` apropriado, criado após troca segura de ID token e verificado pelo Firebase Admin SDK;
- **SDK cliente:** Firebase JavaScript SDK modular, somente onde acesso direto do navegador for necessário;
- **SDK servidor:** Firebase Admin SDK exclusivamente em módulos `server-only`;
- **Autorização:** duas camadas obrigatórias — Firebase Security Rules para acessos via SDK cliente e verificação explícita de permissão em toda operação via Admin SDK, pois o Admin SDK ignora Security Rules;
- **Perfis e permissões:** documento `users/{uid}` para permissões granulares; custom claims apenas para atributos pequenos, estáveis e realmente necessários, nunca como depósito de toda a matriz de permissões;
- **Arquivos:** Cloud Storage for Firebase somente se houver justificativa para persistir arquivos; a planilha de importação deve ser processada de forma efêmera por padrão;
- **Processamento assíncrono:** Cloud Functions for Firebase 2nd gen apenas quando uma tarefa não couber com segurança no request do Next.js ou exigir agendamento/evento;
- **Proteção contra abuso:** Firebase App Check em produção para serviços compatíveis acessados pelo cliente;
- **Ambiente local:** Firebase Local Emulator Suite para Auth, Firestore, Storage e Functions quando usados;
- **Regras e índices versionados:** `firestore.rules`, `firestore.indexes.json`, `storage.rules` quando aplicável e `firebase.json`;
- **Hospedagem-alvo:** Firebase App Hosting conectado ao GitHub, com ambientes separados e sem deploy automático nesta execução;
- **Secrets:** Secret Manager/App Hosting secrets ou variáveis seguras do ambiente; nunca chave privada no cliente;
- **Testes:** Vitest, Testing Library, `@firebase/rules-unit-testing`, Emulator Suite e Playwright;
- **CI:** GitHub Actions com emuladores, lint, typecheck, testes e build;
- **Arquitetura:** monólito modular, sem microserviços;
- **Observabilidade inicial:** logs estruturados sem PII, Cloud Logging/App Hosting logs e audit trail de domínio;
- **Internacionalização:** interface pt-BR; datas, moeda e números em padrão brasileiro.

Classificação: Firebase foi escolhido pelo responsável humano. Detalhes como região, plano de faturamento, App Hosting e uso de Cloud Functions permanecem **PROPOSTOS** até validação de custo e ambiente.

## 14. REGRAS DE ARQUITETURA

A aplicação deve:

- usar Server Components por padrão;
- usar Client Components somente quando interação, Firebase client SDK ou APIs de navegador exigirem;
- manter autenticação e autorização de operações críticas no servidor;
- separar domínio, repositórios Firestore, validação, autorização e UI;
- evitar acesso direto ao Firestore em componentes de apresentação;
- evitar Route Handlers quando Server Actions ou funções `server-only` forem suficientes, mas nunca sacrificar clareza de segurança;
- não duplicar regras de negócio entre UI, servidor e Security Rules sem uma fonte canônica e testes de equivalência;
- centralizar enums, permissões, normalização, cálculos e schemas Zod;
- manter regras, índices e configuração do Firebase versionados no repositório;
- usar `serverTimestamp()`/timestamps do servidor e nunca confiar em relógio do cliente para auditoria;
- usar transações quando uma decisão depende do estado atual e batched writes/BulkWriter quando houver grande volume independente;
- garantir idempotência em importações repetidas por chave determinística não reversível;
- evitar arrays não limitados e documentos gigantes;
- escolher top-level collections para dados que exigem filtros globais e subcollections apenas quando o ciclo de vida do filho for realmente acoplado ao pai;
- documentar toda desnormalização, campos derivados e estratégia de atualização;
- projetar queries antes dos índices e versionar os composite indexes necessários;
- considerar custo de leituras, escritas, índices e listeners em cada dashboard;
- preferir paginação por cursor, nunca `offset` em listas grandes;
- não usar listeners em tempo real onde atualização sob demanda for suficiente;
- tratar o Admin SDK como acesso privilegiado: autenticar, autorizar, validar e auditar antes de cada mutação;
- suportar evolução por `schemaVersion`, scripts de backfill idempotentes e backups/exportações, não por mecanismos de migração relacional;
- ser responsiva e acessível;
- suportar evolução sem reescrita completa.

Estrutura sugerida, ajustável à versão atual do framework:

```text
src/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   └── api/
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── enrollments/
│   ├── imports/
│   ├── goals/
│   ├── users/
│   ├── leads/
│   ├── partnerships/
│   ├── campaigns/
│   ├── relationship/
│   ├── action-plans/
│   └── reports/
├── lib/
│   ├── firebase/
│   │   ├── client.ts
│   │   ├── admin.ts
│   │   ├── auth-session.ts
│   │   ├── converters/
│   │   └── repositories/
│   ├── permissions/
│   ├── validation/
│   ├── money/
│   ├── dates/
│   ├── fingerprints/
│   └── audit/
├── server/
│   ├── auth/
│   ├── actions/
│   ├── repositories/
│   └── services/
└── types/

firebase.json
.firebaserc.example
firestore.rules
firestore.indexes.json
storage.rules                 # somente se Storage for usado
apphosting.yaml               # quando App Hosting for configurado
```

Não crie a pasta `api/`, Cloud Functions ou Storage sem necessidade concreta. Não inicialize o Firebase Admin SDK mais de uma vez por runtime.

## 15. ROTAS-ALVO

Implemente, conforme escopo da primeira versão:

```text
/login
/dashboard
/minha-area
/matriculas
/importacoes
/metas
/colaboradores
/leads
/convenios
/campanhas
/relacionamento
/planos-acao
/relatorios
/configuracoes
```

As rotas devem respeitar permissões. Exibir uma rota no menu não concede autorização.

---

# PARTE V — REGRAS DE NEGÓCIO IMUTÁVEIS

## 16. PROPÓSITO DO SISTEMA

O sistema é uma camada interna de gestão e inteligência da CIES.

Ele deve:

- manter a planilha atual como fonte operacional importável;
- permitir edição manual posterior conforme permissões;
- transformar dados em indicadores, alertas, filtros e planos de ação;
- apoiar análises semanais, quinzenais e mensais;
- ajudar a identificar gargalos;
- entrar na rotina da equipe sem exigir que toda tarefa seja registrada nele.

Ele não deve:

- substituir sistemas oficiais de UniFecaf, UniFacvest ou FSL;
- copiar AVA, provas, boletos, documentos ou processos acadêmicos oficiais;
- obrigar o Relacionamento a registrar toda demanda diária;
- substituir WhatsApp, agenda física ou processos que devem continuar externos.

---

## 17. PLANILHA DE MATRÍCULAS

O importador deve reconhecer estas colunas:

```text
Aluno
Valor
Tipo
Inst.
Vendedor
BVS?
CPF
Telefone
Redirect
Subiu?
Curso
Pagamento
```

Regras:

- o formato atual da planilha deve continuar aceito;
- cabeçalhos podem ser normalizados internamente, sem exigir mudança operacional;
- `Tipo` é opcional;
- `Inst.` aceita inicialmente `UniFecaf`, `UniFacvest` e `FSL`;
- `Pagamento` aceita inicialmente `Pix`, `Boleto` e `Cartão`;
- `Curso` vem com nome oficial copiado dos sistemas das faculdades;
- `Valor` vem em formato brasileiro, como `R$ 199,90`;
- CPF e telefone são strings, nunca números matemáticos;
- o mês de referência é informado durante a importação;
- a data exata da matrícula não é necessária neste escopo.

---

## 18. MODELO ALUNO × MATRÍCULA

Um aluno pode ter várias matrículas.

Nunca modele:

```text
1 CPF = 1 matrícula
```

Modele:

```text
1 aluno = 1 CPF normalizado
1 aluno -> N matrículas
```

O sistema deve preservar cada matrícula legítima por curso, instituição e período.

---

## 19. REGRA DE DUPLICIDADE

A chave mínima de possível duplicidade é:

```text
CPF normalizado + Curso normalizado + Instituição + Mês de referência
```

Comportamento obrigatório:

- mesmo CPF + curso diferente: permitir;
- mesmo CPF + instituição diferente: permitir, se os demais dados representarem matrícula distinta;
- mesmo CPF + mesmo curso + mesma instituição + mesmo mês: tratar como duplicidade ou atualização;
- nunca inserir duplicado exato silenciosamente;
- nunca excluir linha silenciosamente;
- permitir revisão antes da confirmação;
- registrar a decisão tomada;
- suportar atualizar registro existente, ignorar duplicado ou marcar para revisão conforme permissão.

A normalização do curso deve preservar o texto original e gerar uma chave de comparação separada.

---

## 20. ESTADOS TRI-STATE

`BVS?` e `Subiu?` possuem exatamente três estados:

```text
SIM
NÃO
NÃO INFORMADO
```

O valor vazio da planilha significa `NÃO INFORMADO`, não `NÃO`.

Na UI, use select acessível com uma opção inicial equivalente a `Selecione` ou `Não informado`.

---

## 21. REGRA AUTOMÁTICA DE BOAS-VINDAS

Se:

```text
Subiu? = SIM
```

E:

```text
BVS? = NÃO ou NÃO INFORMADO
```

Então:

```text
Status derivado = PENDENTE DE BOAS-VINDAS
```

Essa regra deve existir em uma única fonte compartilhada e ser testada.

A tela do Relacionamento deve permitir:

- filtrar pendências;
- abrir WhatsApp pelo Redirect;
- marcar BVS como enviada;
- atualizar a listagem sem inconsistência.

---

## 22. CAMPOS EDITÁVEIS E PROTEGIDOS

Os dados importados podem ser alterados depois da importação por usuários autorizados.

Regras confirmadas:

- qualquer pessoa do Relacionamento pode editar qualquer matrícula;
- `Vendedor` só pode ser alterado por Gestão/Admin;
- `Valor` deve ter proteção elevada;
- ações sensíveis devem gerar auditoria;
- não haverá observação interna genérica em cada matrícula nesta primeira versão.

Proteja `Valor` com:

- permissão específica;
- validação server-side;
- confirmação visual;
- audit log com valor anterior e novo, sem expor desnecessariamente dados pessoais.

---

## 23. FATURAMENTO

Exiba dois indicadores distintos:

1. **Faturamento total importado** — soma dos valores de todos os registros considerados no lote/período;
2. **Faturamento válido** — soma das matrículas que atendem à política central de validade.

Nunca misture os dois números.

Default PROPOSTO para política de validade:

- `VALIDA/ATIVA`: inclui no faturamento válido;
- `INVALIDA`, `CANCELADA`, `DUPLICADA` ou `ARQUIVADA`: não inclui;
- `EM_REVISAO`: comportamento configurável e claramente rotulado.

Centralize essa política em uma função/configuração testável e registre como PENDENTE até validação final da Gestão.

Armazene valores monetários como centavos inteiros ou tipo decimal seguro no banco. Nunca calcule persistência financeira com ponto flutuante impreciso.

---

## 24. PERMISSÕES

O sistema deve suportar múltiplas áreas por usuário e permissões por módulo/ação.

Papéis iniciais:

- Gestão;
- Relacionamento com o Aluno;
- Administrativo;
- Comercial;
- Marketing.

Regras confirmadas:

### Gestão

- acesso total;
- pode criar, editar, invalidar, arquivar, restaurar e administrar usuários/permissões;
- ações destrutivas ou sensíveis exigem confirmação.

### Relacionamento

- pode visualizar e editar qualquer matrícula;
- pode atualizar `Subiu?` e `BVS?`;
- não pode alterar `Vendedor`;
- não altera `Valor` sem permissão elevada;
- pode consultar outras áreas conforme política de visualização.

### Administrativo

- pode importar e revisar dados;
- pode alterar `Vendedor` conforme regra confirmada;
- permissões adicionais são configuráveis.

### Comercial

- atua em leads, convênios e resultados comerciais;
- pode visualizar matrículas conforme política;
- não altera campos protegidos sem permissão específica.

### Marketing

- atua em campanhas, origens e análise de resultados;
- pode visualizar dados agregados e registros permitidos;
- não altera matrícula sem permissão explícita.

Implemente autorização:

- nas Firebase Security Rules para qualquer acesso via SDK cliente;
- no servidor antes de qualquer leitura ou mutação via Admin SDK;
- em funções centralizadas;
- na interface apenas como camada adicional de UX.

Teste tentativa de contorno por chamada direta.

---

## 25. AUDITORIA

Registre, pelo menos:

- usuário;
- ação;
- entidade;
- ID da entidade;
- campos alterados relevantes;
- timestamp;
- lote de importação, quando aplicável;
- motivo, quando a ação exigir;
- origem da alteração: importação ou edição manual.

Não registre CPF completo, telefone completo, secrets ou conteúdo sensível em logs técnicos.

---

# PARTE VI — MODELO DE DADOS

## 26. ENTIDADES MÍNIMAS

Projete um modelo documental explícito no Cloud Firestore. Use nomes de collections em inglês técnico e documente cada campo.

Collections mínimas sugeridas:

- `users/{uid}` — perfil, status, áreas e permissões granulares;
- `areas/{areaId}` — catálogo das áreas internas;
- `employees/{employeeId}` — representação operacional do colaborador;
- `sellerAliases/{aliasId}` — nomes importados e vínculo com colaborador;
- `students/{studentId}` — identidade do aluno e dados protegidos;
- `enrollments/{enrollmentId}` — cada matrícula é documento independente;
- `importBatches/{batchId}` — lote, período, responsável, status e totais;
- `importBatches/{batchId}/rows/{rowId}` — resultado de cada linha quando a retenção for necessária;
- `importIssues/{issueId}` ou subcollection equivalente — inconsistências revisáveis;
- `goals/{goalId}` — metas por período e escopo;
- `kpiSnapshots/{snapshotId}` — agregados versionados quando cálculo sob demanda for caro;
- `leads/{leadId}`;
- `partnerships/{partnershipId}`;
- `campaigns/{campaignId}`;
- `relationshipCases/{caseId}`;
- `actionPlans/{planId}`;
- `actionPlans/{planId}/items/{itemId}` quando houver itens múltiplos;
- `auditLogs/{logId}` — trilha append-only;
- `appSettings/{settingId}` — configuração controlada e não secreta.

Princípios:

- um aluno pode possuir várias matrículas;
- referências entre documentos devem usar IDs estáveis, sem copiar PII desnecessariamente;
- dados usados em listas podem ser denormalizados de forma controlada para evitar leituras N+1;
- toda denormalização deve declarar fonte canônica, mecanismo de atualização e teste;
- não use CPF, telefone, e-mail ou nome como ID de documento;
- use agregados persistidos apenas quando o custo/latência justificar e registre `sourceVersion`, `computedAt` e período;
- não crie subcollections que precisem ser consultadas globalmente sem planejar collection-group queries e Rules.

## 27. REQUISITOS DO SCHEMA

O modelo Firestore deve:

- usar IDs aleatórios ou determinísticos seguros conforme a entidade;
- usar `Timestamp` do Firestore e `serverTimestamp()` para auditoria;
- armazenar `referenceMonth` como string canônica `YYYY-MM` e, quando útil, campos derivados de ano/mês;
- representar dinheiro em centavos inteiros (`amountCents`), nunca `float`;
- representar `BVS?` e `Subiu?` como enum tri-state canônico: `yes`, `no`, `unset`;
- preservar o nome oficial do curso e manter `courseNormalizedName` separado;
- preservar o nome original do vendedor importado e mapear para colaborador/alias;
- preservar `importBatchId`, `sourceRowNumber` e origem da alteração;
- permitir edição manual sem perder o valor importado original quando o campo for auditável;
- incluir `createdAt`, `createdBy`, `updatedAt`, `updatedBy`, `schemaVersion` e status de arquivamento quando aplicável;
- usar `dedupFingerprint` criado no servidor por HMAC-SHA256 de CPF normalizado + curso normalizado + instituição + mês, com secret fora do cliente;
- nunca usar hash simples de CPF como proteção criptográfica ou ID público;
- prever controle de concorrência em edições sensíveis por `version`/`updatedAt` e transação quando necessário;
- incluir validação no servidor e Security Rules com listas explícitas de campos permitidos;
- usar `diff().affectedKeys()` nas Rules quando apropriado para impedir alteração de Vendedor, Valor e outros campos protegidos;
- versionar composite indexes em `firestore.indexes.json`;
- desabilitar índices de campos grandes ou não consultados quando isso reduzir custo sem prejudicar os requisitos;
- não armazenar arrays não limitados, planilhas completas em um documento ou blobs no Firestore;
- prever scripts idempotentes de backfill e evolução de `schemaVersion`;
- não depender apenas do cliente para impedir inconsistências críticas.

Crie ADRs específicos para:

- estrutura de collections e desnormalização;
- identidade de aluno e proteção de CPF;
- chave/fingerprint de duplicidade;
- representação monetária;
- tri-state;
- Firebase Auth, sessão e permissões;
- Security Rules e acesso via Admin SDK;
- parser e retenção de planilhas;
- agregações/KPI snapshots;
- índices e estimativa de custos.

---

# PARTE VII — MOTOR DE IMPORTAÇÃO

## 28. FLUXO DE IMPORTAÇÃO

Implemente um wizard acessível:

1. selecionar arquivo;
2. informar mês de referência;
3. validar extensão, tamanho e estrutura;
4. detectar cabeçalhos;
5. normalizar valores em staging;
6. mostrar prévia;
7. exibir erros, avisos e duplicidades;
8. permitir decisões de revisão;
9. confirmar importação em transação;
10. gerar resumo e auditoria;
11. atualizar KPIs;
12. permitir consulta ao histórico do lote;
13. suportar reversão segura do lote por Gestão/Admin, quando tecnicamente possível.

---

## 29. SEGURANÇA DO ARQUIVO

O parser deve:

- executar somente no servidor;
- limitar tamanho e quantidade de linhas;
- aceitar apenas formatos definidos;
- validar MIME e extensão sem confiar apenas no nome;
- não executar macros, fórmulas ou conteúdo ativo;
- tratar células como dados;
- prevenir formula/CSV injection em qualquer exportação futura;
- rejeitar arquivo corrompido de forma clara;
- apagar temporários após processamento;
- não publicar o arquivo bruto;
- não registrar linhas com PII em logs.

Pesquise e escolha uma biblioteca atual e mantida para XLSX/CSV. Registre a decisão e os riscos no ADR.

---

## 30. NORMALIZAÇÃO

Crie funções puras e testadas para:

- cabeçalhos;
- CPF;
- telefone;
- moeda brasileira;
- SIM/NÃO/vazio;
- instituição;
- forma de pagamento;
- nome do curso para comparação;
- nome do vendedor/alias;
- campos vazios e whitespace.

Preserve o valor de origem quando necessário para revisão.

Exemplos:

```text
R$ 199,90 -> 19990 centavos
" SIM " -> YES
"" -> UNKNOWN
UniFecaf -> UNIFECAF
FSL -> FSL
```

---

## 31. RESULTADO DA IMPORTAÇÃO

Após análise, exiba:

- total de linhas;
- linhas válidas;
- novas matrículas;
- atualizações propostas;
- duplicidades;
- avisos;
- erros bloqueantes;
- valores totais;
- usuário responsável;
- mês de referência;
- timestamp;
- status do lote.

Nenhum número deve ser estimado se puder ser calculado.

---

# PARTE VIII — PRODUTO E INTERFACE

## 32. DASHBOARD DE GESTÃO

A tela principal deve responder rapidamente:

- quantas matrículas foram feitas;
- quanto falta para a meta;
- qual faturamento total;
- qual faturamento válido;
- quais instituições, cursos e vendedores performam melhor;
- quantas matrículas subiram;
- quantas boas-vindas estão pendentes;
- onde existe gargalo;
- qual período está sendo analisado.

KPIs iniciais PROPOSTOS:

1. matrículas totais;
2. matrículas válidas;
3. progresso da meta;
4. faturamento total;
5. faturamento válido;
6. taxa de liberação;
7. pendências de BVS;
8. desempenho por vendedor;
9. desempenho por instituição;
10. cursos mais matriculados.

Use filtros por mês e, quando houver dados, por quinzena, instituição, vendedor, curso e status.

---

## 33. SEMÁFORO

Default PROPOSTO e configurável:

```text
VERDE: >= 90% da meta
AMARELO: >= 70% e < 90%
VERMELHO: < 70%
```

Não use somente cor. Exiba texto, ícone e valor.

Registre a regra como PENDENTE até validação da Elen.

---

## 34. MÓDULOS FUNCIONAIS

### 34.1 Matrículas

- tabela com filtros;
- busca por nome/CPF com mascaramento adequado;
- edição conforme permissão;
- ações rápidas de `Subiu?`, `BVS?` e WhatsApp;
- indicador de origem importada/manual;
- status de validade;
- histórico de alterações críticas.

### 34.2 Minha Área

Personalize os atalhos conforme permissões:

- Gestão: visão executiva;
- Relacionamento: pendências de BVS e matrículas;
- Administrativo: importações e inconsistências;
- Comercial: leads, convênios e metas;
- Marketing: campanhas e resultados.

### 34.3 Metas e KPIs

- meta geral de matrículas;
- meta geral de faturamento;
- período;
- progresso;
- histórico;
- regras configuráveis quando aprovadas.

### 34.4 Colaboradores e permissões

- usuários;
- áreas múltiplas;
- permissões por módulo/ação;
- status de acesso;
- aliases de vendedor;
- sem exibir senha ou segredo.

### 34.5 Leads

- cadastro e edição;
- origem;
- curso/instituição de interesse;
- responsável;
- status;
- conversão em matrícula sem duplicar aluno incorretamente.

### 34.6 Convênios

- empresa;
- contato;
- status;
- responsável;
- leads e matrículas associados;
- resultado por período.

### 34.7 Campanhas

- nome;
- canal;
- período;
- custo opcional;
- leads;
- matrículas;
- conversão.

### 34.8 Relacionamento

Não cadastre todos os eventos acadêmicos. Registre apenas casos estratégicos:

- reclamação;
- pendência recorrente;
- dificuldade de acesso/prova/financeiro;
- risco de evasão;
- caso importante;
- venda pelo atendimento;
- status de acompanhamento.

### 34.9 Planos 5W2H

Campos:

- What;
- Why;
- Where;
- When;
- Who;
- How;
- How much;
- KPI relacionado;
- status;
- resultado.

### 34.10 Relatórios

Primeira versão:

- visão imprimível;
- filtros consistentes;
- resumo mensal/quinzenal;
- matrículas;
- faturamento;
- vendedor;
- instituição;
- BVS/Subiu;
- metas.

Exportações avançadas podem ficar preparadas, mas não devem atrasar o núcleo.

---

## 35. DESIGN E EXPERIÊNCIA

O produto deve parecer um sistema empresarial moderno, não um template genérico.

Princípios:

- hierarquia visual clara;
- navegação lateral simples;
- densidade adequada para tabelas;
- cards somente quando ajudam decisão;
- estados vazios úteis;
- loading e skeleton coerentes;
- mensagens de erro acionáveis;
- confirmações para ações sensíveis;
- responsividade real;
- teclado e foco visível;
- contraste acessível;
- labels e descrições em português claro;
- não usar animações decorativas excessivas;
- sem interface infantil ou cheia de gradientes aleatórios;
- sem gráficos 3D;
- sem depender somente de cor;
- ocultar dados sensíveis quando não necessários.

Use `/shadcn`, `/react-best-practices` e skill de acessibilidade durante implementação e revisão.

---

# PARTE IX — SEGURANÇA E PRIVACIDADE

## 36. CONTROLES OBRIGATÓRIOS

Implemente:

- Firebase Authentication com criação de usuários restrita à Gestão/Admin; não disponibilize cadastro público;
- sessão SSR com cookie seguro e verificação/revogação pelo Admin SDK;
- Security Rules com negação por padrão e mínimo privilégio;
- testes automatizados de Rules com Emulator Suite e `@firebase/rules-unit-testing`;
- autorização explícita por ação em toda operação server-side que use Admin SDK;
- documentos de perfil/permissão protegidos contra autoelevação de privilégio;
- custom claims somente para atributos pequenos e estáveis; permissões granulares devem permanecer em documento protegido;
- validação de entrada com Zod antes de qualquer escrita;
- validação de campos mutáveis e imutáveis;
- proteção CSRF na criação/remoção da sessão e em endpoints sensíveis;
- mitigação XSS e escape de conteúdo importado;
- App Check em produção para serviços acessados diretamente pelo cliente;
- IAM mínimo para service accounts do App Hosting/Functions;
- bloqueio de acesso cliente ao Admin SDK e a qualquer chave privada;
- uploads limitados por MIME real, extensão, tamanho, quantidade e tempo de processamento;
- armazenamento temporário da planilha somente quando necessário; por padrão, descarte o arquivo após parsing e confirmação;
- regras de Storage separadas e testadas se o arquivo for persistido;
- rate limiting para login, importação, criação de sessão e operações de alto impacto;
- headers de segurança adequados;
- dependências auditadas;
- projetos/ambientes Firebase separados ou aliases claros para local, preview/staging e produção;
- secrets em Secret Manager/App Hosting secrets;
- logs sem PII, tokens, cookies ou conteúdo bruto da planilha;
- audit trail append-only para alterações críticas;
- mascaramento de CPF/telefone quando o contexto não exigir visão completa;
- alertas de orçamento, monitoramento de uso e revisão de custos do Firestore antes da produção;
- exportação/backup e plano de restauração documentados.

Atenção: operações do Firebase Admin SDK ignoram Security Rules. Portanto, nenhuma função server-side pode confiar nas Rules como autorização. Ela deve verificar sessão, status do usuário e permissão antes de ler ou escrever.

Crie um threat model leve usando STRIDE defensivo, sem executar pentest ofensivo.

## 37. DADOS DE DEMONSTRAÇÃO

Crie apenas dados sintéticos:

- nomes fictícios;
- CPFs de teste claramente não reais e validados apenas em modo demo, ou identificadores mascarados;
- telefones fictícios;
- valores e cursos plausíveis;
- nenhuma cópia da planilha real.

Se validadores de CPF exigirem dígitos formais, use geradores locais para testes e marque os dados como sintéticos. Nunca publique esses dados como registros reais.

---

# PARTE X — GIT, COLABORAÇÃO E CI

## 38. GIT

Antes de qualquer mudança:

```bash
git status
git branch --show-current
```

Regras:

- não trabalhar diretamente em `main`;
- não sobrescrever trabalho não relacionado;
- commits pequenos e coerentes;
- Conventional Commits;
- não fazer push sem autorização;
- não criar commit automático se o usuário não solicitar, salvo workflow explicitamente aprovado;
- registrar arquivos alterados no handoff;
- resolver conflitos preservando regras de negócio e testes.

Branches sugeridas:

```text
chore/project-bootstrap
feat/firebase-auth-rbac
feat/enrollment-import
feat/dashboard-kpis
feat/relationship-workflow
feat/strategic-modules
fix/<descricao>
```

Para trabalho simultâneo de Eric e seu primo, divida por módulos e evite edição concorrente dos mesmos arquivos estruturais.

---

## 39. CI

Crie GitHub Actions para:

- instalação reproduzível;
- lint;
- typecheck;
- testes unitários/integrados;
- build;
- E2E em estágio apropriado;
- auditoria básica de dependências, sem quebrar por alerta irrelevante não revisado;
- proteção contra secrets commitados.

Não inclua credenciais reais no workflow.

Documente secrets necessários em `.env.example` e README.

---

# PARTE XI — PIPELINE DE EXECUÇÃO

## 40. FASE 0 — PREFLIGHT

Objetivo: entender o estado real do repositório antes de alterar.

Execute:

1. leitura completa das fontes de verdade;
2. `git status` e branch;
3. inventário de arquivos;
4. detecção de package manager e código existente;
5. detecção das skills instaladas;
6. criação/atualização de `docs/ai/`;
7. verificação de ferramentas locais;
8. identificação de mudanças não commitadas;
9. relatório breve do plano.

Gate de saída:

- estado documentado;
- nenhuma alteração humana sobrescrita;
- skills confirmadas;
- tarefas iniciais registradas.

---

## 41. FASE 1 — ESPECIFICAÇÃO DO PRODUTO

Ative o preset CIES Foundation.

Crie:

```text
docs/specifications/cies-v1-spec.md
docs/specifications/acceptance-criteria.md
docs/specifications/user-journeys.md
docs/specifications/permissions-matrix.md
```

A especificação deve:

- consolidar requisitos confirmados;
- separar escopo V1 e futuro;
- registrar defaults propostos;
- listar perguntas pendentes;
- definir usuários e jornadas;
- definir critérios de aceitação verificáveis;
- evitar copiar todo `CONTEXT.md`;
- referenciar a fonte de cada regra crítica.

Gate de saída:

- escopo implementável;
- nenhum conflito silencioso;
- critérios de aceitação mensuráveis;
- tarefas quebradas por dependência.

Não aguarde aprovação humana para defaults reversíveis; registre-os como PROPOSTOS. Aguarde somente se houver conflito crítico.

---

## 42. FASE 2 — ARQUITETURA E ADRs

Ative skills de arquitetura, Firebase e segurança.

Crie, no mínimo:

```text
docs/decisions/0001-application-architecture.md
docs/decisions/0002-firebase-and-firestore.md
docs/decisions/0003-authentication-session-and-authorization.md
docs/decisions/0004-enrollment-identity-and-duplicates.md
docs/decisions/0005-money-representation.md
docs/decisions/0006-spreadsheet-parser-and-retention.md
docs/decisions/0007-testing-strategy.md
docs/decisions/0008-firestore-aggregations-and-cost.md
docs/decisions/0009-app-hosting-environments.md
docs/architecture/system-overview.md
docs/architecture/firestore-data-model.md
docs/architecture/security-model.md
docs/architecture/query-and-index-plan.md
```

Inclua diagramas Mermaid quando ajudarem.

Gate de saída:

- stack validada em documentação oficial atual;
- arquitetura modular;
- modelo documental consistente;
- fronteiras entre Client SDK e Admin SDK explícitas;
- threat model inicial;
- estratégia de Security Rules, IAM e testes de Rules;
- estratégia de schemaVersion/backfills e rollback;
- query/index plan para filtros e dashboards;
- parser escolhido com justificativa;
- estimativa inicial de custo e risco de leitura do Firestore.

## 43. FASE 3 — BOOTSTRAP

Inicialize ou ajuste o projeto.

Entregue:

- Next.js executável;
- TypeScript strict;
- Tailwind/shadcn configurados;
- layout base;
- rotas protegidas preparadas;
- lint/typecheck/test/build scripts;
- `.env.example` sem credenciais;
- README de ambiente;
- Firebase CLI inicializado com aliases seguros;
- Firebase Local Emulator Suite configurado;
- `firebase.json`, `firestore.rules`, `firestore.indexes.json` e `.firebaserc.example`;
- `storage.rules` apenas se Storage for usado;
- inicialização separada do Firebase client e Admin SDK;
- CI inicial executando emuladores e testes de Rules;
- design tokens;
- página de login e shell do dashboard;
- scripts `emulators`, `test:rules`, `test`, `typecheck`, `build` e `verify`;
- dados sintéticos/fixtures somente no ambiente emulado.

Não crie todas as páginas vazias sem propósito. Priorize infraestrutura funcional.

Gate de saída:

```text
install PASS
firebase config PASS
emulators smoke PASS
rules tests PASS
lint PASS
typecheck PASS
test PASS
build PASS
```

## 44. FASE 4 — AUTH, PERFIS E RBAC

Implemente:

- login/logout com Firebase Authentication por e-mail e senha;
- criação de usuários somente por fluxo administrativo server-side;
- troca de ID token por cookie de sessão seguro;
- verificação de cookie, expiração, revogação e usuário desativado;
- perfil `users/{uid}`;
- múltiplas áreas e permissões por módulo/ação;
- custom claims apenas se justificadas por ADR;
- proteção de rotas e layouts;
- helpers `server-only` para `requireSession`, `requirePermission` e auditoria;
- Security Rules com deny-by-default;
- regras que impeçam autoalteração de função/permissão;
- autorização explícita antes de toda operação Admin SDK;
- fixtures sintéticas de papéis e permissões no Emulator Suite;
- tela inicial de colaboradores;
- testes unitários, integração e Rules.

Teste:

- usuário sem sessão;
- sessão expirada ou revogada;
- usuário desativado;
- Gestão;
- Relacionamento;
- Administrativo;
- Comercial;
- Marketing;
- usuário com múltiplas áreas;
- tentativa de mutação direta pelo Client SDK sem permissão;
- tentativa de mutação por endpoint/server action sem permissão;
- autoelevação de permissão;
- alteração de Vendedor;
- alteração de Valor;
- acesso a dados de outra área conforme matriz de leitura.

Gate: nenhuma leitura ou mutação crítica depende apenas da interface ou somente das Security Rules quando usa Admin SDK.

## 45. FASE 5 — MATRÍCULAS E IMPORTAÇÃO

Implemente por TDD sempre que razoável:

1. entidades de aluno/matrícula;
2. normalizadores;
3. parser;
4. staging;
5. validação de cabeçalhos;
6. validação de linhas;
7. detecção de duplicidade;
8. prévia;
9. confirmação transacional;
10. edição manual;
11. histórico de lotes;
12. auditoria;
13. tabela de matrículas;
14. filtros;
15. ações rápidas;
16. reversão segura documentada.

Casos obrigatórios:

- arquivo válido;
- coluna ausente;
- valor brasileiro;
- SIM/NÃO/vazio;
- CPF com máscara e sem máscara;
- mesmo CPF em curso diferente;
- duplicado exato;
- reimportação;
- linha inválida;
- vendedor desconhecido;
- instituição inválida;
- edição posterior;
- permissão insuficiente;
- lote parcialmente problemático sem perda silenciosa.

Gate: o motor de importação deve ser demonstrável com fixture sintética.

---

## 46. FASE 6 — DASHBOARD, METAS E KPIs

Implemente:

- filtros de período;
- total de matrículas;
- matrículas válidas;
- faturamento total;
- faturamento válido;
- meta x realizado;
- taxa de liberação;
- pendência de BVS;
- vendedor;
- instituição;
- curso;
- forma de pagamento;
- tendências quando houver mais de um período;
- semáforo configurável;
- estados vazios.

Regras:

- números devem vir de uma camada de cálculo central;
- cada KPI deve ter definição documentada;
- filtros devem afetar todos os elementos coerentemente;
- totais de cards, gráficos e tabelas devem reconciliar;
- dinheiro deve ser formatado em pt-BR;
- gráficos precisam de alternativa textual/tabela quando necessário.

Gate: testes de cálculo e reconciliação verdes.

---

## 47. FASE 7 — RELACIONAMENTO E MINHA ÁREA

Implemente:

- regra derivada de BVS pendente;
- lista rápida de pendências;
- botão seguro de WhatsApp;
- atualização de BVS;
- atualização de Subiu;
- cards personalizados por permissão;
- casos estratégicos de relacionamento;
- vendas do atendimento quando o modelo permitir;
- indicadores do setor.

Não transforme esse módulo em cópia do sistema acadêmico da faculdade.

Gate: jornada `Subiu = SIM -> pendência -> abrir WhatsApp -> BVS = SIM -> saída da pendência` validada por E2E.

---

## 48. FASE 8 — MÓDULOS ESTRATÉGICOS

Implemente em fatias verticais:

1. leads;
2. convênios;
3. campanhas;
4. planos 5W2H;
5. relatórios básicos.

Cada fatia deve incluir:

- schema/evolução de dados;
- Security Rules, autorização server-side e permissão;
- validação;
- UI;
- testes;
- auditoria quando relevante;
- atualização da documentação.

Use subagentes somente quando as fatias não compartilharem arquivos centrais em edição.

Gate: cada módulo possui ao menos uma jornada completa funcional.

---

## 49. FASE 9 — UX, ACESSIBILIDADE E POLIMENTO

Execute revisão completa:

- desktop;
- notebook;
- tablet;
- mobile;
- teclado;
- foco;
- contraste;
- labels;
- mensagens de erro;
- loading;
- empty states;
- tabelas;
- diálogos;
- confirmação de ações sensíveis;
- consistência pt-BR;
- performance React/Next.js.

Não priorize efeitos visuais sobre clareza operacional.

Gate: principais jornadas utilizáveis sem mouse e sem erros críticos de acessibilidade.

---

## 50. FASE 10 — SEGURANÇA, QA E RELEASE CANDIDATE

Execute:

1. code review independente;
2. revisão de Firebase Security Rules com testes no Emulator Suite;
3. revisão de autorização explícita em todas as chamadas Admin SDK;
4. revisão de upload/importação, retenção e limites;
5. revisão de PII/logs;
6. auditoria de dependências;
7. testes unitários;
8. testes integrados;
9. E2E;
10. lint;
11. typecheck;
12. build de produção;
13. smoke test com Emulator Suite e build local;
14. reconciliação de critérios de aceitação;
15. documentação de ambiente;
16. checklist de release;
17. handoff final.

Use `/acceptance-orchestrator` e `/verification-before-completion`.

Não faça deploy, push ou merge sem autorização.

---

# PARTE XII — TESTES E CRITÉRIOS DE ACEITAÇÃO

## 51. PIRÂMIDE DE TESTES

### Unitários

- normalizadores;
- moeda;
- tri-state;
- regra de BVS;
- chave de duplicidade;
- permissão;
- cálculo de KPI;
- política de faturamento válido.

### Integração

- parser + staging no Firestore Emulator;
- confirmação de lote com batched writes/BulkWriter e idempotência;
- reimportação;
- Firebase Security Rules;
- mutações autorizadas/não autorizadas;
- queries/indexes de dashboard e snapshots agregados;
- audit logs.

### E2E

- login;
- importação;
- revisão de duplicidade;
- confirmação;
- edição de matrícula;
- proteção de Vendedor;
- proteção de Valor;
- pendência de BVS;
- filtros de dashboard;
- criação de meta;
- jornada de lead/convênio/5W2H.

---

## 52. DEFINITION OF DONE OPERACIONAL

Uma tarefa só está concluída quando:

- requisito e critério de aceitação estão identificados;
- implementação respeita arquitetura;
- permissões estão aplicadas no servidor;
- validação de entrada existe;
- testes relevantes existem e passam;
- lint passa;
- typecheck passa;
- build passa quando o escopo exigir;
- documentação foi atualizada;
- não há dados reais;
- não há secrets;
- alterações sensíveis têm auditoria;
- erros e estados vazios foram tratados;
- evidência foi registrada;
- `PROJECT_STATE.md`, `TASK_BOARD.md` e `SESSION_HANDOFF.md` foram atualizados.

---

## 53. ORÇAMENTO DE QUALIDADE

Não aceite:

- TypeScript `any` sem justificativa;
- `eslint-disable` genérico;
- testes removidos para obter verde;
- catch vazio;
- falha silenciosa;
- consulta sem escopo de usuário quando necessário;
- N+1 óbvio;
- componente gigante sem coesão;
- lógica financeira duplicada;
- enum representado por strings soltas em vários arquivos;
- permissões hardcoded em JSX;
- texto de erro técnico exibido diretamente ao usuário;
- dependência adicionada sem necessidade.

---

# PARTE XIII — SAÍDAS E HANDOFF

## 54. ENTREGÁVEIS ESPERADOS

Ao final, o repositório deve conter:

- aplicação funcional;
- scripts de evolução de dados;
- seeds sintéticos;
- `.env.example`;
- README completo;
- scripts de setup;
- CI;
- documentação de produto;
- ADRs;
- arquitetura;
- matriz de permissões;
- critérios de aceitação;
- testes;
- fixtures sintéticas de planilha;
- documentação de importação;
- checklist de release;
- evidências de verificação;
- handoff para Eric e seu primo.

---

## 55. FORMATO DO RELATÓRIO FINAL DO AGENTE

Ao concluir a execução ou chegar a um gate humano obrigatório, responda de forma objetiva:

```markdown
# Resultado da execução

## Estado
Concluído | Parcial | Bloqueado

## Entregue
- ...

## Arquivos principais
- ...

## Firebase, Rules, índices e evolução de dados
- ...

## Permissões e segurança
- ...

## Verificações executadas
- comando — PASS/FAIL

## Evidências
- ...

## Decisões propostas
- ...

## Pendências humanas
- ...

## Riscos conhecidos
- ...

## Próximo passo exato
- ...
```

Não use “pronto” ou “100% concluído” se houver qualquer gate falhando.

---

## 56. RECUPERAÇÃO E CONTINUIDADE

Se a sessão for interrompida, a quota terminar ou o contexto ficar extenso:

1. pare em um ponto consistente;
2. não deixe evolução de dados parcialmente aplicada;
3. execute verificações mínimas do que foi alterado;
4. atualize `PROJECT_STATE.md`;
5. atualize `TASK_BOARD.md`;
6. atualize `SESSION_HANDOFF.md` com o próximo comando exato;
7. indique o workflow `/cies-resume`.

Ao retomar:

1. leia os documentos de contexto;
2. leia `SESSION_HANDOFF.md`;
3. verifique Git;
4. repita a última verificação relevante;
5. continue a primeira tarefa incompleta.

---

# APÊNDICE A — REGRAS FIREBASE NÃO NEGOCIÁVEIS

1. O Firebase Web API key não é tratado como senha; a segurança depende de Auth, Rules, App Check, IAM e validação. Ainda assim, nenhuma credencial administrativa pode ir ao cliente.
2. O Firebase Admin SDK é `server-only` e ignora Security Rules; toda chamada deve autenticar, autorizar e validar.
3. Security Rules começam negando tudo e liberam apenas caminhos e campos explicitamente necessários.
4. Rules devem ser testadas no Emulator Suite, não apenas no Rules Playground.
5. CPF nunca aparece em document ID, URL, log, nome de arquivo ou analytics.
6. A chave de duplicidade é gerada no servidor com HMAC e secret seguro.
7. Nenhum documento pode crescer indefinidamente; listas crescentes usam collections/subcollections paginadas.
8. Dashboards não podem baixar toda a collection para somar no navegador. Use aggregation queries ou snapshots calculados no servidor.
9. Consultas devem ter plano de índice e paginação por cursor.
10. O arquivo importado não é persistido por padrão. Se for persistido, use Storage protegido, metadados mínimos e política de retenção.
11. Produção exige App Check onde aplicável, alertas de orçamento, backup/export e revisão de IAM.
12. Nenhuma alteração de Rules, índices, IAM, Auth providers ou App Hosting é considerada pronta sem revisão humana e plano de rollback.

---

# PARTE XIV — INSTRUÇÃO FINAL DE PARTIDA

## 57. EXECUÇÃO

Baseado em todas as informações anteriores:

1. entre em **modo autônomo controlado**;
2. execute a Fase 0;
3. crie a memória persistente;
4. descubra e registre as skills reais;
5. execute as fases na ordem definida;
6. use somente skills relevantes em cada fase;
7. use subagentes com fronteiras claras;
8. implemente e valide o sistema CIES Gestão;
9. corrija falhas encontradas;
10. não faça deploy, push, merge ou uso de dados reais;
11. pare somente nos gates humanos obrigatórios;
12. mantenha documentação e handoff atualizados.

A qualidade esperada é de um sistema empresarial interno real: funcional, intuitivo, seguro, auditável, testável e preparado para evolução.

**Comece agora pela Fase 0 — Preflight.**
