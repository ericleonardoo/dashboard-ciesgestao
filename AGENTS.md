# AGENTS.md — CIES Gestão

> Contrato operacional obrigatório para qualquer agente de IA, desenvolvedor ou colaborador que trabalhe neste repositório.
>
> Este arquivo define **como o trabalho deve ser realizado**.  
> `CONTEXT.md` define **o produto, o negócio e as regras confirmadas**.  
> `HYPER_PROMPT.md` define **a sequência executável para construir o sistema**.

## 1. Inicialização obrigatória

Antes de planejar, editar código, instalar dependências ou executar comandos:

1. Leia `AGENTS.md` integralmente.
2. Leia `CONTEXT.md` integralmente.
3. Leia `HYPER_PROMPT.md` integralmente.
4. Leia os documentos relacionados em `docs/`.
5. Execute:
   ```bash
   git status
   git branch --show-current
   ```
6. Inspecione o código existente antes de criar ou substituir arquivos.
7. Registre um plano curto com:
   - objetivo;
   - arquivos ou módulos afetados;
   - impacto de dados;
   - riscos;
   - testes;
   - critério de conclusão.

Nunca trate hipótese como requisito confirmado.

Use sempre as classificações:

- **CONFIRMADO**: aprovado por Eric ou pela Gestão da CIES.
- **PROPOSTO**: decisão reversível adotada para avançar.
- **PENDENTE**: exige decisão humana antes de produção.
- **FORA DO ESCOPO**: não deve ser implementado nesta versão.

## 2. Hierarquia de autoridade

Quando houver conflito, siga esta ordem:

1. Instrução explícita mais recente de Eric ou da Gestão da CIES.
2. `HYPER_PROMPT.md`.
3. `CONTEXT.md`.
4. `AGENTS.md`.
5. ADRs e especificações aprovadas em `docs/`.
6. Código e testes existentes.
7. Convenções genéricas de tecnologia.

Não altere silenciosamente regra confirmada.

## 3. Missão do produto

Construir o **CIES Gestão**, sistema web interno que unifica:

- gestão de matrículas;
- importação da planilha atual;
- acompanhamento comercial B2C;
- prospecção B2B e convênios;
- atividades dos consultores;
- metas;
- KPIs;
- relacionamento pós-matrícula;
- campanhas;
- planos de ação 5W2H;
- relatórios e auditoria.

O sistema deve ajudar a CIES a responder rapidamente:

- quanto já foi realizado;
- quanto falta para a meta;
- quais consultores, canais, cursos e instituições performam melhor;
- em qual etapa os leads estão travando;
- quais empresas estão próximas de fechar parceria;
- quais parcerias realmente geram leads e matrículas;
- quais matrículas ainda não subiram;
- quais boas-vindas estão pendentes;
- qual ação precisa ser executada.

## 4. Restrições centrais

O sistema:

- não substitui os sistemas oficiais das faculdades;
- não substitui obrigatoriamente a planilha Google Sheets;
- não substitui o WhatsApp;
- não deve registrar cada atividade irrelevante da equipe;
- não pode se transformar em burocracia paralela;
- não pode conceder acesso apenas porque alguém possui uma conta Google;
- não pode armazenar ou expor dados pessoais sem necessidade;
- não pode calcular dinheiro usando ponto flutuante binário;
- não pode depender apenas da interface para aplicar permissões.

## 5. Responsáveis humanos

### Eric — Product Owner operacional e líder de desenvolvimento

- Consolida requisitos.
- Conhece a rotina da CIES.
- Valida fluxos, experiência e regras operacionais.
- Coordena desenvolvimento com seu primo.
- Pode aprovar decisões técnicas reversíveis que não alterem política empresarial.

### Elen — Stakeholder principal da Gestão

- Aprova indicadores, metas, regras empresariais e permissões críticas.
- Possui visão administrativa completa.
- Aprova mudanças que alterem faturamento, política de matrícula válida ou acesso da equipe.

### Desenvolvedor colaborador — primo de Eric

- Trabalha em branch própria.
- Abre pull request com testes e evidências.
- Não modifica regra de negócio confirmada sem alinhamento.

### Equipe conhecida

- Eric — Relacionamento e desenvolvimento.
- Elen — Gestão, Coordenação e Comercial.
- Nayara — Relacionamento.
- Bia — Administrativo, Marketing e Comercial.
- Ninha — Consultoria Educacional e Comercial.
- Três consultores externos — prospecção ativa B2C e B2B; nomes e contas serão cadastrados pela Gestão.

## 6. Papéis dos agentes

### `@orchestrator`

Responsável por:

- entender a tarefa;
- decompor o trabalho;
- evitar conflito entre agentes;
- manter consistência entre produto, banco, interface e testes;
- revisar tudo antes da integração;
- manter `docs/ai/` atualizado.

Não deve aceitar saída de subagente sem verificar código, diff e testes.

### `@product`

Responsável por:

- converter necessidades em regras e critérios de aceitação;
- evitar burocracia desnecessária;
- separar confirmado, proposto e pendente;
- preservar os não objetivos;
- garantir que indicadores levem a decisões.

### `@ux`

Responsável por:

- sistema visual profissional;
- fluxo simples;
- dashboard escaneável;
- tabelas densas sem confusão;
- responsividade;
- acessibilidade;
- estados de loading, vazio, erro e sucesso.

Não deve priorizar efeitos visuais sobre clareza.

### `@architect`

Responsável por:

- monólito modular;
- limites de domínio;
- modelo Firestore;
- estratégia de consultas e índices;
- ADRs;
- integração segura entre Firebase Client SDK e Admin SDK.

Não deve criar microserviços ou complexidade sem necessidade demonstrada.

### `@fullstack`

Responsável por:

- funcionalidades verticais completas;
- React/Next.js;
- Server Actions ou Route Handlers;
- Firestore;
- validação;
- autorização;
- testes.

Não usar `any` sem justificativa e não colocar regra crítica apenas no JSX.

### `@auth-security`

Responsável por:

- Google Sign-In;
- cookie de sessão;
- allowlist de colaboradores;
- RBAC;
- Security Rules;
- autorização server-side;
- proteção de dados;
- auditoria;
- CSRF, XSS, rate limiting e headers.

### `@data-import`

Responsável por:

- compatibilidade com a planilha histórica;
- cabeçalhos;
- normalização;
- tri-state;
- CPF;
- moeda;
- duplicidade;
- prévia e relatório de importação;
- idempotência;
- preservação do arquivo original.

### `@analytics`

Responsável por:

- catálogo de KPIs;
- fórmulas centralizadas;
- reconciliação entre cards, gráficos e tabelas;
- filtros globais;
- funis B2C e B2B;
- metas e projeções;
- performance por consultor, origem, empresa, instituição e curso.

### `@qa`

Responsável por:

- critérios de aceitação;
- testes unitários, integração, Rules e E2E;
- cenários de erro e permissão;
- evidências reproduzíveis;
- acessibilidade e responsividade.

### `@devops`

Responsável por:

- scripts;
- CI;
- Firebase Emulator Suite;
- configuração Vercel;
- `.env.example`;
- builds reproduzíveis;
- preview por pull request;
- documentação de ambiente.

Nunca realizar deploy, push, merge ou mudança destrutiva sem autorização humana.

## 7. Forma obrigatória de trabalhar

Para tarefas não triviais:

### Compreender

- Ler contexto e código.
- Identificar regra confirmada.
- Identificar impacto em Auth, Firestore, Rules, índices, dinheiro, PII e KPIs.
- Evitar perguntas que possam ser resolvidas pelo repositório ou por default reversível.

### Planejar

Criar plano pequeno e verificável.

### Implementar

- Mudanças coesas.
- Uma fatia vertical por vez.
- Sem refatoração ampla misturada com funcionalidade.
- Sem sobrescrever trabalho não relacionado.
- Sem criar páginas vazias apenas para “parecer completo”.

### Validar

Executar, quando disponíveis:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:rules
npm run test:e2e
npm run build
npm run verify
```

Nunca afirmar que um comando passou sem executá-lo.

### Revisar

- Revisar diff.
- Procurar segredo e PII.
- Verificar autorização no servidor.
- Reconciliar cards, gráficos e tabelas.
- Verificar loading, vazio, erro e sucesso.
- Verificar teclado, foco, contraste e textos.
- Verificar índices e custo de consulta.

### Entregar

Informar:

- o que mudou;
- arquivos principais;
- testes executados;
- resultado;
- riscos;
- pendências reais;
- próximo passo exato.

## 8. Git e colaboração

- `main` deve permanecer estável.
- Não trabalhar diretamente em `main`.
- Toda mudança entra por pull request.
- Não fazer force push em `main`.
- Não reescrever branch compartilhada sem alinhamento.
- Preferir squash merge.

Branches:

```text
chore/project-bootstrap
feat/google-auth-rbac
feat/design-system-shell
feat/b2c-pipeline
feat/b2b-partnerships
feat/sales-activities
feat/goals-kpis
feat/enrollment-import
feat/executive-dashboard
feat/reports-5w2h
fix/<descricao>
docs/<descricao>
```

Commits:

```text
feat(auth): implement Google session login
feat(leads): add B2C qualification pipeline
feat(partnerships): add B2B company stages
fix(enrollment): allow same cpf in different courses
test(rules): block unauthorized seller changes
docs(context): add external consultant workflow
```

## 9. Direção técnica

### Stack

- Next.js com App Router.
- React Server Components por padrão.
- TypeScript estrito.
- Tailwind CSS.
- Componentes acessíveis, preferencialmente shadcn/ui.
- Firebase Authentication.
- Google como provedor de login da V1.
- Cloud Firestore.
- Firebase Admin SDK exclusivamente no servidor.
- Firebase Security Rules para acessos pelo Client SDK.
- Firebase Emulator Suite.
- Vercel como hospedagem-alvo da aplicação.
- GitHub para versionamento, CI e colaboração.
- Google Antigravity como ambiente/agente de desenvolvimento.

Não fixe versões neste arquivo. Use versões estáveis atuais, lockfile e documentação oficial.

### Princípios arquiteturais

- Monólito modular.
- Server-first.
- Client Components somente quando houver interação real.
- Validação compartilhada com schemas.
- Camada central de autorização.
- Camada central de métricas.
- Repositórios Firestore tipados.
- Paginação por cursor.
- Índices planejados.
- Nenhum dashboard deve baixar coleções inteiras para somar no navegador.

### Organização sugerida

```text
src/
  app/
    (auth)/
    (dashboard)/
    api/
  components/
    ui/
    shared/
    charts/
    tables/
  features/
    auth/
    dashboard/
    leads/
    companies/
    partnerships/
    sales-activities/
    goals/
    enrollments/
    imports/
    employees/
    campaigns/
    relationship/
    action-plans/
    reports/
    settings/
  lib/
    firebase/
    permissions/
    validation/
    money/
    dates/
    metrics/
  server/
    auth/
    actions/
    repositories/
    services/
    metrics/
  types/
  validators/
docs/
  ai/
  architecture/
  decisions/
  specifications/
  test-plans/
firestore.rules
firestore.indexes.json
firebase.json
.env.example
```

Não crie pastas vazias sem função real.

## 10. Autenticação Google — regra obrigatória

### Fluxo

1. Usuário clica em **Entrar com Google**.
2. Firebase Authentication autentica a conta Google.
3. O cliente envia o ID token ao endpoint server-side de sessão.
4. O servidor verifica:
   - assinatura e validade do token;
   - e-mail verificado;
   - e-mail presente na allowlist interna;
   - colaborador ativo;
   - perfil e permissões válidos.
5. O servidor cria cookie de sessão `HttpOnly`, `Secure` em produção e `SameSite`.
6. Rotas protegidas usam verificação server-side.
7. Logout revoga/remove a sessão.
8. Usuário autenticado no Google, mas não autorizado na CIES, recebe a mensagem:
   **“Sua conta Google foi reconhecida, mas ainda não possui acesso ao CIES Gestão. Solicite liberação à Gestão.”**

### Regras

- Não existe cadastro público.
- Não conceder acesso automático por domínio sem decisão confirmada.
- A allowlist é administrada apenas por Gestão/Admin.
- O usuário não pode alterar as próprias áreas ou permissões.
- UID, e-mail normalizado e status devem ser verificados no servidor.
- Firebase Admin SDK ignora Security Rules; cada operação deve autorizar explicitamente.
- Não confiar em role enviada pelo cliente.
- Login por popup deve possuir fallback por redirect quando necessário.
- Registrar login, logout, bloqueios e alterações de acesso sem armazenar token.

## 11. Modelo de permissões

Permissões são por módulo e ação, não apenas por cargo.

Exemplo:

```ts
type Permission =
  | "dashboard.view"
  | "leads.view"
  | "leads.create"
  | "leads.edit"
  | "leads.assign"
  | "companies.view"
  | "companies.create"
  | "companies.edit"
  | "partnerships.manage"
  | "activities.create"
  | "activities.view_team"
  | "goals.manage"
  | "enrollments.view"
  | "enrollments.edit"
  | "enrollments.change_seller"
  | "enrollments.change_amount"
  | "imports.execute"
  | "imports.rollback"
  | "users.manage"
  | "reports.export";
```

### Gestão

- Acesso total.
- Administra allowlist, usuários e permissões.
- Pode mudar vendedor e valor.
- Pode configurar metas.
- Pode reverter importação.
- Ações críticas exigem confirmação e auditoria.

### Relacionamento

- Pode editar qualquer matrícula.
- Pode atualizar `Subiu?` e `BVS?`.
- Pode abrir Redirect/WhatsApp.
- Não altera Vendedor.
- Valor permanece protegido.

### Administrativo

- Pode importar e revisar matrículas.
- Pode atuar em campos administrativos autorizados.
- Pode alterar Vendedor quando possuir a permissão confirmada.

### Comercial interno

- Pode acessar leads, empresas, convênios, atividades, metas e resultados conforme sua carteira/permissões.

### Consultor externo

- Pode visualizar e editar seus próprios leads, empresas, contatos, atividades, reuniões, propostas e oportunidades.
- Pode visualizar sua meta e seu desempenho.
- Não pode visualizar CPF completo ou valor protegido sem necessidade.
- Não pode alterar permissões, vendedor histórico, valor de matrícula, lotes ou dados de outros consultores, salvo permissão explícita.

### Marketing

- Pode visualizar campanhas, origens, leads agregados e conversões.
- Não recebe edição de dados críticos por inferência.

## 12. Regras de negócio de matrículas

- Um aluno pode ter várias matrículas.
- CPF identifica o aluno, não a matrícula isolada.
- Mesmo CPF com curso diferente deve ser permitido.
- Duplicidade considera, no mínimo:
  - CPF normalizado;
  - curso normalizado;
  - instituição;
  - mês de referência.
- Mesmo conjunto no mesmo período deve ser sinalizado como duplicidade ou atualização.
- Nenhuma linha pode desaparecer silenciosamente.
- `BVS?` e `Subiu?` são tri-state:
  - SIM;
  - NÃO;
  - NÃO INFORMADO.
- Vazio nunca é convertido automaticamente para NÃO.
- `Subiu? = SIM` e `BVS? != SIM` gera boas-vindas pendentes.
- Valor deve ser armazenado em centavos inteiros.
- Vendedor somente Gestão/Admin altera.
- Dados importados podem ser editados conforme permissão.
- Faturamento total e faturamento válido são métricas diferentes.

Cabeçalhos históricos:

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

## 13. Regras comerciais B2C

### Status permitidos

```text
Novo
Primeiro contato
Em atendimento
Qualificado
Proposta enviada
Negociação
Follow-up
Matriculado
Perdido
Sem retorno
```

### Campos mínimos

- nome;
- telefone;
- cidade;
- curso de interesse;
- modalidade;
- instituição de interesse;
- origem;
- consultor responsável;
- status;
- último contato;
- próximo contato;
- valor potencial opcional;
- motivo de perda;
- observação objetiva;
- datas de criação e atualização.

### Regras

- Todo lead deve possuir responsável.
- Próximo contato deve ser visível quando o lead não está encerrado.
- Mudança para `Matriculado` deve permitir vincular a matrícula criada/importada.
- Motivo de perda é obrigatório ao marcar `Perdido`.
- Duplicidade de lead deve considerar telefone normalizado e contexto, sem bloquear automaticamente casos legítimos.
- O sistema deve destacar follow-ups vencidos.
- O consultor externo vê principalmente sua carteira.
- Gestão pode redistribuir carteira com auditoria.

## 14. Regras comerciais B2B

### Funil

```text
Prospectada
Contato realizado
Decisor identificado
Reunião agendada
Reunião realizada
Proposta enviada
Em negociação
Parceria aprovada
Parceria ativa
Sem interesse
```

### Campos mínimos de empresa

- razão/nome da empresa;
- CNPJ opcional no início;
- segmento;
- cidade/bairro;
- número estimado de funcionários;
- contato;
- cargo do contato;
- telefone;
- e-mail;
- consultor responsável;
- status;
- último contato;
- próximo passo;
- data do próximo passo;
- observações;
- origem da prospecção.

### Regras

- “Empresa visitada” não é resultado suficiente; registrar estágio, contato e próximo passo.
- Contato decisor deve ser distinguido de contato genérico.
- Reunião realizada, proposta enviada e parceria aprovada devem possuir data.
- Parceria ativa deve poder gerar leads e matrículas associados.
- Sem interesse deve registrar motivo e possibilidade de reativação.
- Empresa não deve ser duplicada apenas por variação de escrita; usar CNPJ quando existente e normalização quando não existir.
- Métricas B2B devem separar empresas prospectadas, contatos efetivos, reuniões, propostas, parcerias e matrículas geradas.

## 15. Atividades dos consultores

Atividades relevantes:

- ligação;
- WhatsApp;
- novo contato;
- follow-up;
- visita;
- empresa prospectada;
- reunião;
- proposta;
- matrícula.

Sempre que possível, gerar atividade automaticamente a partir de mudanças reais no sistema. Entrada manual deve ser rápida e não burocrática.

Campos:

- data e hora;
- consultor;
- tipo;
- entidade relacionada;
- resultado;
- próximo passo;
- observação curta;
- origem automática ou manual.

Não usar apenas contadores manuais desconectados das entidades.

## 16. Metas

Metas podem ser:

- geral da CIES;
- por consultor;
- por equipe;
- por instituição;
- por período;
- por métrica.

Métricas de meta:

- leads;
- contatos efetivos;
- reuniões;
- propostas;
- parcerias;
- matrículas;
- faturamento.

Toda meta deve possuir:

- período;
- escopo;
- métrica;
- alvo;
- responsável;
- status;
- criado por;
- data de criação;
- regra de cálculo;
- realizado calculado.

Não permitir que o usuário digite manualmente o realizado quando ele puder ser calculado.

## 17. KPIs e dashboards

### KPIs executivos

- matrículas totais;
- matrículas válidas;
- meta x realizado;
- faltante para a meta;
- faturamento total;
- faturamento válido;
- taxa de liberação;
- BVS pendentes;
- conversão geral de leads;
- parcerias ativas.

### KPIs B2C

- leads novos;
- taxa de contato;
- taxa de qualificação;
- propostas enviadas;
- conversão lead → matrícula;
- follow-ups vencidos;
- tempo médio por etapa quando houver datas confiáveis;
- matrículas por origem;
- matrículas por consultor;
- motivos de perda.

### KPIs B2B

- empresas prospectadas;
- contatos efetivos;
- decisores identificados;
- reuniões agendadas e realizadas;
- propostas enviadas;
- parcerias aprovadas;
- parcerias ativas;
- conversão empresa → parceria;
- leads por parceria;
- matrículas por parceria;
- receita por parceria.

### Guardrails

- leads sem responsável;
- oportunidades sem próximo passo;
- follow-ups vencidos;
- empresas duplicadas;
- parcerias sem ação recente;
- matrículas sem origem;
- divergência entre cards, gráficos e tabela;
- dados desatualizados;
- consultas excessivas.

Cada KPI deve ter definição, fórmula, fonte, granularidade e filtros.

## 18. UX e sistema visual

### Direção

- Sistema empresarial moderno e confiável.
- Desktop-first, responsivo.
- Interface em português do Brasil.
- Sidebar recolhível.
- Header com período global, busca e perfil.
- Navegação simples.
- Cards apenas quando ajudam a decidir.
- Gráficos 2D simples.
- Tabelas com busca, filtros, paginação, ordenação e ações.
- Drawer ou modal para edição rápida.
- Feedback por toast e mensagens inline.
- Skeletons consistentes.
- Empty states úteis.
- Sem gradientes aleatórios, gráficos 3D ou animações excessivas.

### Design tokens propostos

Até a identidade visual oficial ser fornecida:

- azul-marinho como cor estrutural;
- azul médio como ação primária;
- verde apenas para sucesso;
- âmbar para atenção;
- vermelho para risco;
- neutros claros para fundo;
- tipografia sem serifa legível;
- bordas discretas;
- sombras leves.

Tokens devem estar centralizados e ser facilmente substituíveis.

### Dashboard

A primeira dobra deve responder o estado do período sem rolagem excessiva:

1. filtros globais;
2. hero KPIs;
3. progresso de meta;
4. tendência;
5. funil;
6. ranking;
7. alertas acionáveis.

Não duplicar a mesma informação em muitos cards.

## 19. Segurança e privacidade

- Negar por padrão.
- Admin SDK somente no servidor.
- Security Rules testadas no emulador.
- PII mascarada quando possível.
- CPF nunca em URL, ID de documento, log, analytics ou nome de arquivo.
- Logs sem token, cookie, CPF, telefone ou planilha bruta.
- Dados reais nunca em seed, teste, screenshot público ou issue.
- Upload validado por tipo, tamanho e conteúdo.
- Arquivo de importação descartado após processamento por padrão.
- Auditoria append-only para ações críticas.
- Rate limiting em login, sessão, importação e mutações sensíveis.
- Headers de segurança.
- Secrets fora do Git.
- `.env.example` sem valor real.
- App Check considerado para produção.
- Backups e alertas de orçamento antes da produção.

## 20. Testes mínimos

### Auth

- Google login autorizado;
- Google login de e-mail não autorizado;
- e-mail não verificado;
- usuário desativado;
- sessão expirada;
- logout;
- acesso direto a rota protegida;
- autoelevação de permissão;
- alteração de allowlist sem permissão.

### B2C

- criação;
- atribuição;
- status;
- próximo contato;
- follow-up vencido;
- motivo de perda;
- conversão em matrícula;
- carteira do consultor.

### B2B

- empresa sem CNPJ;
- empresa com CNPJ;
- duplicidade;
- decisor;
- reunião;
- proposta;
- parceria;
- leads e matrículas por parceria;
- acesso apenas à carteira quando aplicável.

### Matrículas e importação

- cabeçalho ausente;
- moeda brasileira;
- CPF mascarado e não mascarado;
- tri-state;
- mesmo CPF em curso diferente;
- duplicado exato;
- vendedor desconhecido;
- reimportação;
- edição posterior;
- proteção de Valor e Vendedor.

### KPIs

- fórmulas;
- filtros;
- metas;
- reconciliação;
- zero denominador;
- períodos vazios;
- origem e consultor;
- B2C e B2B.

### E2E

1. login Google;
2. dashboard;
3. criar lead;
4. avançar lead;
5. criar empresa;
6. registrar reunião;
7. fechar parceria;
8. converter lead;
9. importar matrícula;
10. atualizar Subiu;
11. concluir BVS;
12. confirmar atualização dos indicadores.

## 21. Definition of Done

Uma tarefa só está concluída quando:

- atende ao critério de aceitação;
- possui autorização server-side;
- valida entradas;
- trata loading, vazio, erro e sucesso;
- testes aplicáveis passam;
- lint passa;
- typecheck passa;
- build passa;
- não contém segredo ou dado real;
- documentação foi atualizada;
- diff foi revisado;
- evidência foi registrada;
- interface foi validada em desktop e mobile;
- cards, gráficos e tabelas reconciliam;
- alteração crítica foi revisada por outro desenvolvedor.

## 22. Ações proibidas

- Commitar `.env`, tokens ou planilhas reais.
- Fazer push direto em `main`.
- Apagar dados sem plano e autorização.
- Autorizar ação apenas escondendo botão.
- Permitir acesso a qualquer conta Google.
- Usar CPF como ID.
- Usar `float` para dinheiro.
- Transformar vazio em NÃO.
- Descartar linha silenciosamente.
- Alterar vendedor ou valor sem permissão.
- Baixar toda coleção no cliente para calcular dashboard.
- Criar integração falsa com sistemas de faculdade.
- Declarar “100% funcional” sem testes e evidências.
- Substituir arquivos humanos não relacionados.
- Instalar dependências sem necessidade.

## 23. Formato de entrega

```markdown
# Resultado

## Estado
Concluído | Parcial | Bloqueado

## Entregue
- ...

## Arquivos principais
- ...

## Dados, Rules e índices
- ...

## Auth, permissões e segurança
- ...

## Verificações
- comando — PASS/FAIL

## Evidências
- ...

## Pendências reais
- ...

## Próximo passo exato
- ...
```

## 24. Lembrete central

O sucesso não é quantidade de telas.

O sistema será bem-sucedido quando a equipe conseguir usar o CIES Gestão sem treinamento complexo, enxergar o funil comercial e a operação de matrículas, identificar gargalos e tomar decisões com dados confiáveis.
