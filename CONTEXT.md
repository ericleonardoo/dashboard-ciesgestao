# CONTEXT.md — CIES Gestão

> Fonte de verdade de produto, negócio, escopo e regras do sistema.
>
> Atualização consolidada: **29 de julho de 2026**.

## 1. Identificação

**Produto:** CIES Gestão  
**Empresa:** CIES — polo de ensino superior EAD e semipresencial  
**Tipo:** Sistema web interno de gestão, CRM comercial, matrículas e inteligência operacional  
**Product Owner operacional:** Eric  
**Stakeholder principal:** Elen  
**Desenvolvimento:** Eric e seu primo, com GitHub e Google Antigravity  
**Frontend/aplicação:** Next.js  
**Backend:** Firebase  
**Banco:** Cloud Firestore  
**Autenticação:** Firebase Authentication com login Google  
**Hospedagem-alvo:** Vercel  
**Idioma da interface:** Português do Brasil

## 2. Resumo executivo

A CIES usa uma planilha Google Sheets para controlar matrículas e utiliza os sistemas oficiais das faculdades para processos acadêmicos e administrativos. Também realiza atendimento e vendas pelo WhatsApp, prospecção de pessoas físicas, busca ativa de empresas e criação de convênios.

O CIES Gestão será uma camada interna de gestão, sem substituir obrigatoriamente os processos existentes. Ele deve integrar em uma visão única:

- matrículas;
- importações;
- funil B2C;
- funil B2B;
- empresas e convênios;
- atividades comerciais;
- metas;
- desempenho da equipe;
- campanhas;
- relacionamento;
- planos 5W2H;
- relatórios.

A pergunta central do produto é:

> Onde a CIES está, quanto falta para a meta, onde está o gargalo e qual ação precisa ser tomada?

## 3. Contexto organizacional

### Instituições no escopo inicial

- UniFecaf;
- UniFacvest;
- FSL — Faculdade São Luiz.

### Modalidades

- EAD;
- semipresencial.

EJA não é fluxo principal do MVP, mas a arquitetura não deve bloquear inclusão futura.

### Áreas internas

- Gestão;
- Relacionamento com o Aluno;
- Comercial;
- Administrativo;
- Marketing.

Uma pessoa pode atuar em mais de uma área. Permissões não devem assumir “um usuário = um único papel”.

### Pessoas conhecidas

| Pessoa | Atuação |
|---|---|
| Elen | Gestão, Coordenação e Comercial |
| Eric | Relacionamento e desenvolvimento |
| Nayara | Relacionamento |
| Bia | Administrativo, Marketing e Comercial |
| Ninha | Consultoria Educacional e Comercial |
| 3 consultores externos | Prospecção ativa B2C e B2B |

Os nomes dos três consultores externos ainda serão cadastrados pela Gestão.

## 4. Problema atual

Os dados ficam espalhados em:

- Google Sheets;
- sistemas oficiais das faculdades;
- WhatsApp;
- agendas;
- controles manuais;
- conhecimento da equipe;
- análises feitas manualmente.

Isso dificulta responder:

- quantas matrículas foram feitas;
- quanto falta para a meta;
- quanto foi faturado;
- qual consultor converte mais;
- quais origens geram matrículas;
- quantas empresas foram prospectadas;
- quantas reuniões e propostas ocorreram;
- quais convênios geram resultado;
- quais follow-ups estão vencidos;
- quais matrículas não subiram;
- quais boas-vindas estão pendentes;
- onde existe gargalo;
- qual ação precisa ser priorizada.

## 5. Objetivos

### Objetivo principal

Criar uma operação previsível, visual e simples para captar, acompanhar e converter pessoas e empresas em matrículas, ao mesmo tempo em que a Gestão acompanha metas, faturamento e gargalos.

### Objetivos específicos

1. Manter a planilha atual como fonte operacional de matrículas.
2. Importar dados de forma periódica e repetível.
3. Permitir edição manual conforme permissão.
4. Organizar o funil B2C.
5. Organizar a prospecção B2B.
6. Medir atividades relevantes dos consultores.
7. Ligar empresas, parcerias, leads e matrículas.
8. Centralizar metas e indicadores.
9. Gerar alertas acionáveis.
10. Preservar simplicidade e segurança.

## 6. Não objetivos

O sistema não deve no MVP:

- substituir os sistemas oficiais das faculdades;
- copiar módulos acadêmicos completos;
- controlar provas, AVA, documentos e boletos oficiais;
- substituir o WhatsApp;
- obrigar registro de todo atendimento comum;
- substituir completamente a planilha;
- virar ERP educacional completo;
- integrar com terceiros sem API oficial e autorização;
- incluir EJA como fluxo principal;
- conceder acesso público;
- permitir que qualquer conta Google entre;
- criar automações fictícias.

## 7. Princípios de produto

- Simples antes de completo.
- Ação antes de decoração.
- Informação centralizada sem burocracia.
- Fonte e fórmula visíveis.
- Desktop-first com mobile utilizável.
- Segurança aplicada no servidor.
- Dados pessoais somente quando necessários.
- Nenhum KPI sem definição.
- Nenhuma meta sem período e regra.
- Nenhuma oportunidade aberta sem próximo passo.

## 8. Processo operacional desejado

### Matrículas

```text
Venda/matrícula
→ preenchimento da planilha
→ importação periódica
→ validação e revisão
→ matrícula no CIES Gestão
→ dashboard e acompanhamento
→ Subiu?
→ boas-vindas
→ indicadores atualizados
```

### B2C

```text
Lead
→ primeiro contato
→ atendimento
→ qualificação
→ proposta
→ negociação/follow-up
→ matrícula ou perda
→ vínculo com matrícula
→ resultado por origem e consultor
```

### B2B

```text
Empresa identificada
→ prospecção
→ contato
→ decisor
→ reunião
→ proposta
→ negociação
→ parceria
→ divulgação
→ leads
→ matrículas
→ receita da parceria
```

### Gestão

```text
Indicador
→ comparação com meta
→ diagnóstico do gargalo
→ plano 5W2H
→ responsável e prazo
→ execução
→ nova medição
```

## 9. Usuários e autenticação

### Decisão confirmada em 29/07/2026

A V1 usará **login com Google** por Firebase Authentication.

Não haverá cadastro público.

### Fluxo de acesso

1. Gestão autoriza previamente o e-mail.
2. Colaborador escolhe a conta Google.
3. Firebase autentica.
4. O servidor valida token, e-mail verificado, allowlist, status e permissões.
5. O servidor cria cookie de sessão.
6. Usuário é direcionado à sua área.
7. Contas não autorizadas permanecem sem acesso.

### Allowlist

A allowlist deve conter:

- e-mail normalizado;
- nome;
- status;
- áreas;
- conjunto de permissões;
- data de liberação;
- liberado por;
- observação administrativa opcional.

A implementação pode armazenar chave derivada/HMAC do e-mail para busca server-side. O documento não deve ser legível pelo cliente.

### Sessão

- cookie `HttpOnly`;
- `Secure` em produção;
- `SameSite`;
- expiração configurável;
- verificação de revogação em ações sensíveis;
- logout remove cookie;
- acesso server-side obrigatório.

### Tela de login

Deve conter:

- marca CIES;
- mensagem curta;
- botão “Entrar com Google”;
- estado de carregamento;
- erro claro;
- aviso de acesso restrito;
- suporte visual profissional;
- sem formulário de cadastro.

## 10. Áreas e permissões

### Gestão

- visão total;
- metas;
- relatórios;
- usuários;
- allowlist;
- permissões;
- importações;
- campos protegidos;
- auditoria;
- ações destrutivas controladas.

### Relacionamento

- visualizar e editar qualquer matrícula;
- atualizar Subiu e BVS;
- abrir WhatsApp;
- acompanhar pendências;
- não alterar Vendedor;
- não alterar Valor sem permissão elevada.

### Administrativo

- importar;
- revisar;
- corrigir campos autorizados;
- resolver inconsistências;
- alterar Vendedor apenas com permissão confirmada.

### Comercial interno

- leads;
- empresas;
- parcerias;
- atividades;
- metas;
- relatórios comerciais;
- visão de equipe conforme permissão.

### Consultor externo

- própria carteira de leads;
- próprias empresas;
- próprias atividades;
- reuniões e propostas;
- própria meta;
- próprio desempenho;
- criação de contatos;
- atualização de estágio;
- sem acesso administrativo;
- sem alteração de Valor, Vendedor histórico, permissões ou importações.

### Marketing

- campanhas;
- origens;
- resultados agregados;
- leads vinculados conforme necessidade;
- sem edição de dados críticos por padrão.

## 11. Módulos e rotas

```text
/login
/dashboard
/minha-area
/comercial
/leads
/empresas
/convenios
/atividades
/metas
/matriculas
/importacoes
/relacionamento
/campanhas
/planos-acao
/relatorios
/colaboradores
/configuracoes
/auditoria
```

### Navegação recomendada

**Visão**
- Dashboard
- Minha Área

**Comercial**
- Leads
- Empresas
- Convênios
- Atividades
- Metas

**Operação**
- Matrículas
- Importações
- Relacionamento

**Estratégia**
- Campanhas
- Planos de Ação
- Relatórios

**Administração**
- Colaboradores
- Configurações
- Auditoria

Itens devem aparecer conforme permissões.

## 12. Planilha de matrículas

Colunas confirmadas:

| Coluna | Regra |
|---|---|
| Aluno | Nome do aluno |
| Valor | Valor em formato brasileiro |
| Tipo | Opcional |
| Inst. | UniFecaf, UniFacvest ou FSL |
| Vendedor | Quem fechou |
| BVS? | SIM, NÃO ou vazio |
| CPF | Identifica aluno |
| Telefone | Contato |
| Redirect | Atalho de WhatsApp |
| Subiu? | SIM, NÃO ou vazio |
| Curso | Nome oficial |
| Pagamento | Pix, Boleto ou Cartão |

### Mês de referência

Data exata não é requisito do MVP. Cada lote deve possuir `referenceMonth` no formato `YYYY-MM`.

### Importação

Fluxo:

1. upload;
2. mês;
3. validação de cabeçalho;
4. normalização;
5. prévia;
6. erros e avisos;
7. duplicidades;
8. decisão;
9. confirmação;
10. atualização de dashboard;
11. histórico.

### Regras

- não alterar arquivo original;
- não descartar linha silenciosamente;
- permitir edição posterior;
- registrar responsável;
- registrar totais;
- reimportação deve ser segura;
- reversão deve ser controlada;
- arquivo deve ser descartado após parsing por padrão.

## 13. Aluno, matrícula e duplicidade

Um aluno pode possuir várias matrículas.

CPF não é matrícula.

Chave mínima de duplicidade:

```text
CPF normalizado
+ curso normalizado
+ instituição
+ mês de referência
```

Permitido:

- mesmo CPF, curso diferente;
- mesmo CPF, instituição diferente quando legítimo.

Conflito:

- mesmo CPF, curso, instituição e período.

Tratamentos:

- ignorar;
- atualizar;
- revisar;
- importar com justificativa e permissão elevada.

## 14. BVS e Subiu

Tri-state:

```text
YES
NO
UNKNOWN
```

Interface:

```text
SIM
NÃO
NÃO INFORMADO
```

Regra:

```text
releaseStatus = YES
AND welcomeStatus != YES
→ boas-vindas pendentes
```

Ao marcar BVS como SIM, a pendência desaparece e os KPIs são recalculados.

## 15. Valores e faturamento

- entrada `R$ 199,90`;
- persistência em centavos inteiros;
- formatação pt-BR;
- Valor protegido;
- auditoria de alteração.

Indicadores:

- faturamento total;
- faturamento válido.

A definição oficial de matrícula válida continua PENDENTE da Gestão. Até aprovação, o sistema deve centralizar uma política configurável e marcar o default como PROPOSTO.

## 16. Leads B2C

### Campos

```text
id
name
phone
phoneNormalized
city
courseInterest
modality
institutionInterest
source
ownerId
status
lastContactAt
nextContactAt
potentialAmountCents?
lossReason?
notes?
partnershipId?
campaignId?
convertedEnrollmentId?
createdAt
createdBy
updatedAt
updatedBy
```

### Status

```text
NEW
FIRST_CONTACT
IN_SERVICE
QUALIFIED
PROPOSAL_SENT
NEGOTIATION
FOLLOW_UP
ENROLLED
LOST
NO_RESPONSE
```

Rótulos em português conforme o funil definido.

### Origens

- Instagram;
- Facebook;
- Google;
- WhatsApp;
- Indicação;
- Evento;
- Ação externa;
- Empresa parceira;
- Orgânico;
- Outros.

### Regras

- responsável obrigatório;
- próximo contato visível;
- perda exige motivo;
- matrícula deve poder ser vinculada;
- parceria e campanha devem ser preservadas como origem;
- follow-up vencido gera alerta;
- redistribuição gera auditoria.

## 17. Empresas e prospecção B2B

### Empresa

```text
id
name
legalName?
cnpjNormalized?
cnpjFingerprint?
segment
city
neighborhood?
employeeCountEstimate?
source
ownerId
status
lastContactAt?
nextStep
nextStepAt?
createdAt
createdBy
updatedAt
updatedBy
```

### Contatos da empresa

```text
id
companyId
name
role
phone
email
isDecisionMaker
active
```

### Estágios

```text
PROSPECTED
CONTACTED
DECISION_MAKER_IDENTIFIED
MEETING_SCHEDULED
MEETING_HELD
PROPOSAL_SENT
NEGOTIATION
PARTNERSHIP_APPROVED
PARTNERSHIP_ACTIVE
NO_INTEREST
```

### Regras

- próximo passo obrigatório em oportunidade aberta;
- reunião e proposta possuem data;
- sem interesse possui motivo;
- CNPJ é opcional na primeira abordagem;
- empresa sem CNPJ usa revisão de similaridade;
- empresa com CNPJ usa chave normalizada;
- evitar duplicidade;
- carteira por consultor;
- gestão visualiza tudo.

## 18. Parcerias e convênios

### Campos

```text
id
companyId
ownerId
status
benefitType
startDate?
endDate?
responsibleContactId?
activationNotes?
leadCount
enrollmentCount
revenueCents
lastActionAt?
createdAt
updatedAt
```

### Status

- Em prospecção;
- Em negociação;
- Aprovada;
- Ativa;
- Inativa.

### Indicadores

- leads gerados;
- matrículas;
- conversão;
- receita;
- última ação;
- tempo sem movimentação.

Parceria ativa deve ser um canal permanente, não apenas um registro de empresa fechada.

## 19. Atividades

### Tipos

- ligação;
- WhatsApp;
- contato novo;
- follow-up;
- visita;
- prospecção;
- reunião;
- proposta;
- matrícula.

### Modelo

```text
id
actorId
type
entityType
entityId
occurredAt
outcome?
nextStep?
notes?
source: AUTO | MANUAL
createdAt
```

Atividades automáticas devem ser criadas para eventos confiáveis, como:

- mudança de estágio;
- reunião marcada;
- proposta enviada;
- lead convertido;
- parceria aprovada.

Não duplicar automaticamente contadores agregados e eventos.

## 20. Metas

```text
id
periodType
periodStart
periodEnd
metric
scopeType
scopeId?
targetValue
unit
status
createdBy
createdAt
updatedAt
```

Métricas:

- leads;
- contatos;
- reuniões;
- propostas;
- parcerias;
- matrículas;
- faturamento.

Escopos:

- empresa/CIES;
- equipe;
- consultor;
- instituição;
- curso;
- canal.

O realizado deve ser calculado.

## 21. Dashboard e páginas analíticas

### Dashboard executivo

Hero KPIs:

- matrículas;
- progresso da meta;
- faturamento válido;
- conversão B2C;
- parcerias ativas;
- BVS pendentes.

Seis cards são uma proposta; a Gestão poderá priorizar.

Seções:

1. progresso do mês;
2. tendência;
3. funil B2C;
4. funil B2B;
5. desempenho por consultor;
6. origens;
7. instituições e cursos;
8. alertas;
9. ações 5W2H.

### Dashboard comercial

- leads por etapa;
- conversão;
- follow-ups;
- ranking;
- atividades;
- metas;
- motivos de perda;
- previsão simples baseada em etapas, marcada como estimativa.

### Dashboard B2B

- empresas por etapa;
- reuniões;
- propostas;
- parcerias;
- empresas sem próximo passo;
- parcerias sem ação;
- leads e matrículas por parceria.

### Dashboard operacional

- matrículas;
- Subiu;
- BVS;
- importações;
- inconsistências;
- faturamento total e válido.

### Filtros globais

- período;
- consultor;
- equipe;
- instituição;
- curso;
- modalidade;
- origem;
- cidade;
- empresa/parceria;
- status.

Filtros devem afetar elementos coerentes e mostrar claramente quando não se aplicam.

## 22. Catálogo inicial de KPIs

| KPI | Fórmula |
|---|---|
| Conversão B2C | Leads matriculados / leads elegíveis |
| Taxa de contato | Leads com contato / leads novos |
| Taxa de qualificação | Leads qualificados / leads contatados |
| Proposta → matrícula | Matrículas / propostas enviadas |
| Empresas → reunião | Reuniões realizadas / empresas prospectadas |
| Reunião → proposta | Propostas / reuniões realizadas |
| Empresa → parceria | Parcerias aprovadas / empresas prospectadas |
| Leads por parceria | Leads vinculados / parcerias ativas |
| Matrículas por parceria | Matrículas vinculadas / parcerias ativas |
| Taxa de liberação | Matrículas com Subiu=SIM / matrículas elegíveis |
| Taxa de BVS | Matrículas com BVS=SIM / matrículas liberadas |
| Atingimento de meta | realizado / meta |
| Ticket médio | faturamento válido / matrículas válidas |

Cada denominador deve tratar zero e critérios de elegibilidade.

## 23. Sistema visual

### Objetivo

Transmitir:

- organização;
- confiança;
- clareza;
- modernidade;
- controle;
- profissionalismo.

### Layout

- sidebar fixa e recolhível;
- cabeçalho;
- conteúdo com largura confortável;
- filtros persistentes;
- cards alinhados;
- gráficos responsivos;
- tabela operacional;
- detalhes em drawer;
- modais apenas para confirmação ou tarefa focada.

### Cores propostas

```text
background: neutro muito claro
surface: branco
primary: azul corporativo
navigation: azul-marinho
success: verde
warning: âmbar
danger: vermelho
text: cinza-azulado escuro
muted: cinza
```

A paleta é PROPOSTA até identidade oficial.

### Componentes essenciais

- PageHeader;
- GlobalPeriodFilter;
- KpiCard;
- GoalProgress;
- FunnelChart;
- TrendChart;
- RankingTable;
- DataTable;
- FilterBar;
- StatusBadge;
- EmptyState;
- ErrorState;
- Skeleton;
- ConfirmDialog;
- EntityDrawer;
- ActivityTimeline;
- NextStepAlert;
- PermissionGuard visual, sem substituir autorização server-side.

## 24. Modelo Firestore inicial

### Coleções

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

### Princípios

- top-level collections para consultas globais;
- subcollections somente quando fortemente acopladas;
- sem arrays ilimitados;
- timestamps de servidor;
- `schemaVersion`;
- soft delete;
- índices compostos planejados;
- fingerprints HMAC server-side para CPF/CNPJ/e-mail quando necessário;
- nenhuma PII em ID.

## 25. Auditoria

Registrar:

- login bloqueado;
- criação/desativação de acesso;
- mudança de permissão;
- redistribuição de lead/empresa;
- mudança de Vendedor;
- mudança de Valor;
- importação;
- reversão;
- invalidação;
- parceria aprovada;
- alteração de meta;
- exportação sensível.

Campos:

```text
actorId
action
entityType
entityId
changedFields
timestamp
correlationId?
reason?
```

Não registrar conteúdo sensível integral.

## 26. Requisitos não funcionais

### Segurança

- autenticação individual;
- allowlist;
- autorização server-side;
- Rules;
- PII protegida;
- audit trail;
- prevenção de exclusão acidental.

### Confiabilidade

- importação repetível;
- cálculos exatos;
- testes;
- idempotência;
- versionamento de schema;
- reconciliação de métricas.

### Desempenho

- paginação;
- filtros no servidor;
- índices;
- agregações;
- evitar N+1;
- evitar leituras desnecessárias.

### Acessibilidade

- teclado;
- foco;
- labels;
- contraste;
- texto além de cor;
- gráficos com tabela/descrição;
- mensagens acionáveis.

### Manutenibilidade

- TypeScript strict;
- módulos;
- schemas;
- testes;
- CI;
- documentação;
- dependências reduzidas.

## 27. Escopo da primeira versão funcional

### Núcleo obrigatório

1. login Google;
2. allowlist;
3. perfis e permissões;
4. shell visual;
5. leads B2C;
6. empresas B2B;
7. contatos;
8. atividades;
9. parcerias;
10. metas;
11. matrículas;
12. importação;
13. BVS/Subiu;
14. dashboard executivo;
15. dashboard comercial;
16. auditoria;
17. dados sintéticos;
18. testes;
19. CI;
20. documentação de ambiente.

### Segunda camada

- campanhas;
- casos estratégicos de relacionamento;
- planos 5W2H;
- relatórios;
- exportações;
- aliases avançados;
- snapshots de KPI;
- integrações futuras.

A segunda camada deve ser implementada depois que o núcleo estiver confiável.

## 28. Critérios de aceitação de alto nível

1. Colaborador autorizado entra com Google.
2. Conta Google não autorizada não acessa o sistema.
3. Gestão administra acessos.
4. Consultor externo vê a própria carteira.
5. Gestão vê a equipe.
6. Lead percorre o funil.
7. Follow-up vencido é destacado.
8. Empresa percorre o funil B2B.
9. Reunião, proposta e parceria ficam registradas.
10. Parceria gera leads e matrículas vinculados.
11. Metas mostram realizado calculado.
12. Planilha histórica é importada.
13. Mesmo CPF com curso diferente é aceito.
14. Duplicado exato é sinalizado.
15. BVS e Subiu preservam três estados.
16. Subiu=SIM e BVS pendente aparece automaticamente.
17. Relacionamento edita matrícula.
18. Relacionamento não muda Vendedor.
19. Valor permanece protegido.
20. Dashboard reconcilia com tabelas.
21. Filtros funcionam.
22. Ações críticas deixam auditoria.
23. Dados reais não aparecem em código/testes.
24. Lint, typecheck, testes e build passam.

## 29. Decisões confirmadas

- manter planilha;
- importar periodicamente;
- editar dados importados;
- mês é suficiente;
- mesmo CPF pode ter cursos diferentes;
- duplicidade inclui curso, instituição e período;
- BVS e Subiu são tri-state;
- BVS pendente automática;
- Relacionamento edita qualquer matrícula;
- Vendedor somente Gestão/Admin altera;
- Valor protegido;
- faturamento total e válido separados;
- todos os colaboradores terão acesso individual;
- três consultores externos trabalharão B2C e B2B;
- sistema terá funis B2C e B2B;
- sistema terá atividades, parcerias e metas;
- login será com Google;
- Firebase será backend;
- Firestore será banco;
- Next.js será aplicação;
- Vercel será hospedagem-alvo;
- GitHub será usado na colaboração;
- Antigravity será usado na construção.

## 30. Decisões propostas

- shadcn/ui;
- paleta azul corporativa;
- allowlist server-side;
- popup com fallback redirect;
- monólito modular;
- soft delete;
- HMAC para fingerprints;
- dados sintéticos;
- preview Vercel por PR;
- regras de semáforo configuráveis;
- criação automática de atividades derivadas;
- agregações server-side;
- snapshots de KPI quando custo justificar.

## 31. Pendências da Gestão

- definição oficial de matrícula válida;
- regra exata do semáforo;
- cinco KPIs prioritários da home;
- permissões detalhadas de Comercial, Marketing e Administrativo;
- nomes/e-mails dos consultores externos;
- metas iniciais;
- política de retenção de arquivos;
- política de backup;
- domínio/e-mails corporativos;
- visibilidade entre áreas;
- relatórios obrigatórios;
- identidade visual oficial;
- administrador substituto;
- tempo de expiração da sessão;
- orçamento Firebase/Vercel.

Pendências não críticas devem usar default reversível e ser registradas.

## 32. Riscos

### Escopo amplo

Mitigação: fatias verticais, gates e núcleo antes de módulos secundários.

### Burocracia comercial

Mitigação: campos mínimos, automações derivadas e próximo passo rápido.

### Dados ruins

Mitigação: validação, normalização, prévia e revisão.

### Permissões incompletas

Mitigação: negar por padrão.

### Métricas divergentes

Mitigação: catálogo central e testes de reconciliação.

### Dados pessoais

Mitigação: allowlist, servidor, mascaramento, auditoria e dados sintéticos.

### Agente autônomo

Mitigação: branches, diff, testes, proibição de ações destrutivas e artifacts.

## 33. Histórico

| Data | Alteração | Responsável |
|---|---|---|
| 2026-07-13 | Consolidação inicial do CIES Gestão com Firebase | Eric + ChatGPT |
| 2026-07-29 | Integração do planejamento comercial B2C/B2B, três consultores externos, seis bases operacionais e login Google | Eric + ChatGPT |
