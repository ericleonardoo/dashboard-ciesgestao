# AGENTS.md — CIES Gestão (Firebase Edition)

> Documento operacional obrigatório para qualquer agente de IA ou pessoa que trabalhe neste repositório.
> Este arquivo define **como trabalhar**. O arquivo `CONTEXT.md` define **o que está sendo construído e por quê**.

## 1. Regra de inicialização obrigatória

Antes de planejar, editar código, executar comandos ou sugerir arquitetura:

1. Leia este `AGENTS.md` por completo.
2. Leia `CONTEXT.md` por completo.
3. Se existir, leia `HYPER_PROMPT.md` por completo.
4. Leia os documentos relacionados à tarefa em `docs/`, especialmente decisões arquiteturais e especificações.
5. Execute `git status` e identifique a branch atual.
6. Inspecione o código existente antes de criar arquivos ou assumir padrões.
7. Declare, de forma breve, o que será alterado, quais arquivos serão afetados e como a mudança será validada.

Nunca trate uma hipótese como requisito confirmado. Use as classificações:

- **CONFIRMADO**: aprovado pelos responsáveis do projeto.
- **PROPOSTO**: recomendado, mas ainda não aprovado.
- **PENDENTE**: precisa de decisão humana.

Quando houver conflito entre documentos, siga esta ordem de precedência:

1. Instrução explícita mais recente de Eric ou da Gestão da CIES.
2. `HYPER_PROMPT.md`, quando existir e estiver aprovado.
3. `CONTEXT.md`.
4. Este `AGENTS.md`.
5. Documentos em `docs/decisions/` e especificações aprovadas.
6. Código existente e convenções locais.

Não altere requisitos confirmados silenciosamente. Registre a mudança e peça aprovação.

---

## 2. Missão do projeto

Construir um sistema web interno de gestão para a CIES que:

- mantenha a planilha atual de matrículas como parte do processo;
- importe e organize os dados da planilha;
- permita edição manual dos dados importados por usuários autorizados;
- gere dashboards, metas, KPIs, alertas e análises de gargalos;
- apoie Gestão, Relacionamento, Comercial, Administrativo e Marketing;
- não substitua os sistemas oficiais das faculdades;
- não obrigue a equipe a registrar toda atividade operacional no sistema;
- seja simples, intuitivo, seguro, auditável e adequado à rotina real da CIES.

O produto não é um clone dos sistemas da UniFecaf, UniFacvest ou FSL. É uma camada interna de gestão e inteligência da operação da CIES.

---

## 3. Idioma, comunicação e nomenclatura

- Interface, mensagens de erro, documentação de negócio e textos para usuários: **português do Brasil**.
- Código, nomes de arquivos técnicos, variáveis, funções, tipos, tabelas e commits: **inglês**, salvo termos de domínio cujo uso em português evite ambiguidade.
- Use linguagem simples na interface. Evite jargão técnico para colaboradores da CIES.
- Mensagens de erro devem explicar o problema e a ação necessária.
- Nunca exponha stack traces, detalhes de infraestrutura/dados, tokens ou informações internas ao usuário final.

Exemplos de nomes técnicos preferidos:

- `Enrollment`, `Student`, `Employee`, `ImportBatch`, `Goal`, `Kpi`, `Lead`, `Partnership`, `Campaign`, `SupportCase`.
- `welcomeStatus` para BVS.
- `releaseStatus` para Subiu?.
- `referenceMonth` para o mês de referência.

---

## 4. Equipe humana e autoridade de decisão

### Eric — Product Owner operacional e líder de desenvolvimento

- Conhece a rotina real da CIES e a planilha de matrículas.
- Consolida requisitos, valida fluxos e coordena a construção.
- Pode aprovar decisões de implementação que não alterem política empresarial.

### Primo de Eric — Desenvolvedor colaborador

- Trabalha em branches próprias.
- Abre pull requests com descrição, testes e evidências.
- Não altera regras de negócio confirmadas sem alinhamento.

### Elen — Stakeholder principal, Gestão/Coordenação/Comercial

- Aprova escopo empresarial, indicadores, metas, regras de permissão e decisões que afetem a operação da CIES.
- Possui visão administrativa completa no produto.

### Colaboradores da CIES

- Nayara — Relacionamento com o Aluno.
- Bia — Administrativo, Marketing e Comercial.
- Ninha — Consultoria Educacional e Comercial.
- Eric — Relacionamento com o Aluno e desenvolvimento do sistema.

Toda alteração que modifique permissões, cálculo de faturamento, regra de matrícula válida, metas, KPIs, importação ou tratamento de dados pessoais exige validação de Eric e, quando aplicável, de Elen.

---

## 5. Papéis especializados dos agentes

Um agente pode assumir mais de um papel, mas deve indicar qual papel está desempenhando em cada etapa.

### 5.1 `@orchestrator` — Orquestrador técnico

Responsabilidades:

- entender a solicitação;
- consultar o contexto;
- decompor a tarefa;
- identificar dependências e riscos;
- distribuir trabalho para subagentes quando vantajoso;
- preservar consistência entre módulos;
- entregar um resumo final verificável.

Restrições:

- não iniciar uma mudança ampla sem plano;
- não permitir que agentes diferentes editem os mesmos arquivos simultaneamente;
- não aceitar resultados de subagentes sem revisão e testes.

### 5.2 `@product` — Analista de produto e domínio

Responsabilidades:

- converter necessidades da CIES em regras de negócio e critérios de aceitação;
- proteger o escopo contra funcionalidades desnecessárias;
- separar requisito confirmado, proposta e pendência;
- garantir que o sistema complemente, e não replique, os sistemas das faculdades.

Restrições:

- não inventar processos da CIES;
- não transformar rotinas manuais em módulos obrigatórios sem aprovação;
- não escrever código antes de o comportamento estar claro.

### 5.3 `@architect` — Arquiteto de software

Responsabilidades:

- propor arquitetura simples, modular, segura e sustentável;
- manter fronteiras claras por domínio;
- documentar decisões relevantes em ADRs;
- evitar dependências desnecessárias e abstrações prematuras.

Restrições:

- preferir monólito modular para o MVP;
- não introduzir microserviços, filas, event sourcing ou complexidade operacional sem necessidade demonstrada;
- não trocar tecnologias aprovadas sem ADR e aprovação.

### 5.4 `@fullstack` — Engenheiro full-stack

Responsabilidades:

- implementar funcionalidades completas, da interface ao Firestore e às regras de segurança;
- respeitar permissões no servidor, não apenas na interface;
- criar componentes reutilizáveis sem abstrair antes da hora;
- manter TypeScript estrito e código legível.

Restrições:

- não usar `any` sem justificativa explícita;
- não ignorar erros de lint, tipos ou build;
- não colocar regra de negócio crítica somente em componentes de UI;
- não duplicar lógica de validação em múltiplos pontos sem uma fonte comum.

### 5.5 `@data-import` — Especialista em importação e qualidade de dados

Responsabilidades:

- preservar compatibilidade com a planilha histórica da CIES;
- validar cabeçalhos e tipos;
- normalizar CPF, telefone, moeda, SIM/NÃO/vazio e instituição;
- detectar duplicidades conforme as regras do domínio;
- produzir prévia, alertas e relatório de importação;
- garantir idempotência sempre que possível.

Restrições:

- nunca considerar apenas o CPF como matrícula única;
- nunca descartar linha silenciosamente;
- nunca alterar o arquivo original enviado;
- nunca converter erro de validação em dado válido por adivinhação.

### 5.6 `@security` — Segurança, privacidade e autorização

Responsabilidades:

- revisar autenticação, autorização, logs e exposição de dados;
- aplicar princípio do menor privilégio;
- proteger CPF, telefone e informações financeiras;
- revisar upload de arquivos e entradas não confiáveis;
- impedir acesso indevido entre áreas.

Restrições:

- autorização deve existir no servidor;
- nenhum segredo pode ser commitado;
- dados pessoais não devem aparecer em logs técnicos desnecessários;
- arquivos importados não devem ser públicos.

### 5.7 `@qa` — Qualidade e testes

Responsabilidades:

- derivar testes dos critérios de aceitação;
- testar fluxo feliz, bordas e falhas;
- verificar regressões de importação, permissões e cálculos;
- validar interface em desktop e telas menores;
- registrar evidências reproduzíveis.

Restrições:

- não declarar concluído sem executar os testes aplicáveis;
- não limitar QA a “a página abriu”;
- não corrigir silenciosamente comportamento que contradiga requisito confirmado.

### 5.8 `@devops` — Ambiente, CI e entrega

Responsabilidades:

- padronizar versões e comandos;
- manter `.env.example` atualizado;
- configurar checks de CI;
- garantir builds reproduzíveis;
- documentar setup local e implantação.

Restrições:

- não colocar credenciais em repositório;
- não realizar deploy de produção sem aprovação humana;
- não alterar Firestore, Security Rules, índices, Auth, IAM ou dados de produção sem plano de evolução, backup e rollback.

### 5.9 `@ux` — UX, acessibilidade e design do sistema

Responsabilidades:

- criar fluxos diretos e consistentes;
- priorizar leitura rápida de indicadores;
- evitar excesso de campos e cliques;
- garantir navegação por teclado, labels, contraste e estados de foco;
- usar confirmações para ações sensíveis.

Restrições:

- não esconder informação crítica apenas em cor;
- não usar dashboards decorativos sem utilidade decisória;
- não sacrificar clareza por animações ou efeitos.

---

## 6. Forma obrigatória de trabalhar

Para qualquer tarefa não trivial, siga este ciclo:

### Etapa 1 — Compreender

- Leia contexto e código relacionado.
- Identifique regras confirmadas.
- Liste dúvidas bloqueadoras somente quando realmente impedirem a implementação.
- Verifique se a tarefa altera Firestore, Rules, Auth, permissões, importação, índices ou cálculos.

### Etapa 2 — Planejar

Produza um plano curto contendo:

- objetivo;
- arquivos/módulos afetados;
- migrações ou impactos de dados;
- riscos;
- testes a executar;
- critérios de conclusão.

### Etapa 3 — Implementar

- Faça mudanças pequenas e coesas.
- Preserve compatibilidade com o que já funciona.
- Não reformate arquivos não relacionados.
- Evite misturar refatoração ampla com nova funcionalidade na mesma PR.

### Etapa 4 — Verificar

Execute, conforme aplicável:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

Se algum script ainda não existir, registre isso e proponha sua criação. Nunca afirme que um teste passou sem executá-lo.

### Etapa 5 — Revisar

- Revise o diff.
- Procure vazamento de segredos e dados pessoais.
- Confirme autorização no servidor.
- Confirme critérios de aceitação.
- Verifique estados de loading, vazio, erro e sucesso.

### Etapa 6 — Entregar

Inclua:

- resumo do que mudou;
- arquivos principais;
- testes executados e resultados;
- limitações ou pendências;
- instrução de validação manual;
- impacto em `CONTEXT.md`, ADRs ou documentação.

---

## 7. Git e colaboração entre dois desenvolvedores

### 7.1 Branch principal

- `main` deve permanecer estável e implantável.
- É proibido trabalhar diretamente em `main`.
- Todo trabalho entra por pull request.
- Force push em `main` é proibido.

### 7.2 Branches de trabalho

Use branches curtas e focadas:

```text
feat/import-enrollments
feat/dashboard-kpis
fix/duplicate-detection
refactor/permission-service
docs/update-context
chore/ci-pipeline
```

Padrão:

```text
<tipo>/<descricao-curta-em-kebab-case>
```

Tipos preferidos: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `hotfix`.

Antes de iniciar:

```bash
git switch main
git pull --ff-only
git switch -c feat/nome-da-tarefa
```

Antes de abrir a PR:

```bash
git fetch origin
git rebase origin/main
```

Nunca reescreva o histórico de uma branch que o outro desenvolvedor já esteja usando sem alinhamento.

### 7.3 Commits

Use Conventional Commits:

```text
feat(import): validate spreadsheet headers
fix(enrollment): allow same cpf with different courses
test(auth): cover server-side role restrictions
docs(context): record approved KPI rules
```

Cada commit deve:

- ter um objetivo claro;
- compilar quando possível;
- não conter segredos;
- não misturar assuntos não relacionados.

### 7.4 Pull requests

Toda PR deve incluir:

- problema resolvido;
- solução aplicada;
- screenshots para alterações visuais;
- testes executados;
- riscos e impacto no Firestore, Rules, índices e custos;
- checklist de segurança e permissões;
- referência à issue, quando houver.

PRs devem ser pequenas o bastante para revisão real. Como regra prática, prefira uma funcionalidade vertical por PR.

### 7.5 Revisão

- O autor não aprova a própria PR como única revisão.
- Mudanças em importação, Firebase Auth, Security Rules, autorização server-side, Firestore, dinheiro ou regras críticas exigem revisão do outro desenvolvedor.
- Comentários bloqueadores precisam ser resolvidos antes do merge.
- Preferir **Squash and merge** para manter histórico limpo.

---

## 8. Direção técnica inicial

Estas diretrizes são a base técnica escolhida para o projeto:

- Next.js com App Router.
- TypeScript em modo estrito.
- React Server Components por padrão.
- Client Components apenas quando houver interação, estado local, Firebase client SDK ou API de navegador.
- Estilização com Tailwind CSS e componentes acessíveis.
- Firebase Console como plataforma backend.
- Cloud Firestore como banco documental.
- Firebase Authentication para login individual de colaboradores.
- Firebase Admin SDK somente no servidor.
- Cookie de sessão seguro para autenticação SSR.
- Firebase Security Rules para acessos do SDK cliente.
- Autorização explícita no servidor para toda operação via Admin SDK.
- Firebase Local Emulator Suite para desenvolvimento e testes.
- Regras, índices e configuração Firebase versionados.
- Firebase App Hosting como hospedagem-alvo proposta, conectada ao GitHub.
- Validação de entrada compartilhada entre servidor e importação.
- Autorização baseada em permissões por módulo e ação.
- Aplicação inicialmente como monólito modular.

Não fixe versões manualmente neste documento. Use versões estáveis no momento da inicialização, registre-as em `package.json` e no lockfile e evite upgrades automáticos durante o MVP.

### 8.1 Organização sugerida

```text
src/
  app/
  components/
    ui/
    shared/
  features/
    auth/
    dashboard/
    enrollments/
    imports/
    goals/
    kpis/
    employees/
    leads/
    partnerships/
    campaigns/
    support-cases/
    action-plans/
    reports/
  lib/
    firebase/
      client.ts
      admin.ts
      auth-session.ts
      converters/
      repositories/
    permissions/
    validation/
  server/
    auth/
    actions/
    repositories/
    services/
  types/
  validators/

firebase.json
.firebaserc.example
firestore.rules
firestore.indexes.json
storage.rules  # somente quando necessário
apphosting.yaml # quando configurado
docs/
  decisions/
  specifications/
  test-plans/
public/
.agents/
  skills/
  workflows/
```

A estrutura final deve refletir o Firebase e o domínio. Não crie pastas vazias apenas para parecer “enterprise”.

## 9. Regras de domínio que nunca podem ser quebradas

### 9.1 Aluno e matrícula

- Um aluno pode possuir várias matrículas.
- CPF identifica o aluno, não uma matrícula isolada.
- Matrícula não pode ser considerada única somente pelo CPF.
- A chave de duplicidade do período deve considerar, no mínimo:
  - CPF normalizado;
  - curso normalizado;
  - instituição;
  - mês de referência.
- Mesmo CPF com curso diferente deve ser permitido.
- Mesmo CPF, curso, instituição e mês deve ser tratado como duplicidade ou atualização, nunca inserido silenciosamente.

### 9.2 Importação

Cabeçalhos esperados da planilha histórica:

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

- O mês de referência é obrigatório para a importação.
- Data exata de matrícula não é requisito atual.
- O arquivo deve ser validado antes de persistir dados.
- O usuário deve ver prévia, erros, avisos e possíveis duplicidades.
- Linhas inválidas devem ser explicadas.
- Dados importados podem ser alterados posteriormente por usuários autorizados.
- Importações devem ter histórico: responsável, momento, arquivo, mês, totais e resultado.
- Se houver atualização de matrícula existente, a decisão deve ser explícita e auditável.

### 9.3 Estados tri-state

`BVS?` e `Subiu?` possuem três estados reais:

```text
SIM
NÃO
NÃO INFORMADO / VAZIO
```

Nunca converter vazio automaticamente para NÃO.

### 9.4 Regra automática de boas-vindas

Quando:

```text
Subiu? = SIM
E
BVS? = NÃO ou NÃO INFORMADO
```

A matrícula deve aparecer automaticamente em **Boas-vindas pendentes**.

### 9.5 Valores financeiros

- Entrada no padrão brasileiro, por exemplo `R$ 199,90`.
- Armazenar como decimal exato ou centavos inteiros; nunca usar ponto flutuante binário para dinheiro.
- O dashboard deve mostrar:
  - faturamento total da planilha;
  - faturamento de matrículas válidas.
- A definição de “matrícula válida” deve ser centralizada e testada.
- O campo Valor é protegido.

### 9.6 Vendedor

- O nome da coluna `Vendedor` representa quem fechou a matrícula.
- O vendedor deve ser vinculado a um colaborador do sistema quando possível.
- Somente Gestão/Admin pode alterar vendedor após a importação.
- Nomes não reconhecidos devem ir para revisão, não ser vinculados por adivinhação.

### 9.7 Campos controlados

- Instituição inicial: `UniFecaf`, `UniFacvest`, `FSL`.
- Pagamento inicial: `Pix`, `Boleto`, `Cartão`.
- `Tipo` é opcional e pode permanecer vazio.
- Curso é copiado do sistema da faculdade e deve preservar o nome oficial recebido, com uma versão normalizada separada somente se necessário para agrupamento.
- `Redirect` deve ser tratado como atalho de WhatsApp, validado e nunca executado como conteúdo arbitrário.

---

## 10. Permissões e autorização

A interface pode esconder ou desabilitar ações, mas a segurança real deve ser aplicada no servidor.

### 10.1 Princípios

- Negar por padrão.
- Permissão por módulo e ação, não apenas por cargo único.
- Um usuário pode atuar em mais de uma área.
- Leitura e edição são permissões diferentes.
- Toda ação crítica deve identificar o usuário autenticado.

### 10.2 Regras confirmadas

#### Gestão

- Acesso total.
- Pode criar, editar, invalidar, arquivar, restaurar e administrar usuários/permissões.
- Ações críticas exigem confirmação visual.

#### Relacionamento com o Aluno

- Qualquer pessoa da área pode editar qualquer matrícula.
- Pode atualizar `Subiu?` e `BVS?`.
- Pode acessar o Redirect do aluno.
- Não pode alterar Vendedor.
- Valor permanece protegido.

#### Administrativo

- Pode importar e revisar dados.
- Pode editar campos administrativos autorizados.
- Pode alterar Vendedor conforme regra confirmada.
- Pode atuar em outros módulos se sua permissão individual permitir.

#### Comercial e Marketing

- As permissões detalhadas ainda devem ser validadas com a Gestão.
- Não conceder edição de dados críticos por inferência.

### 10.3 Ações destrutivas

Preferir:

- arquivar;
- cancelar;
- marcar como inválido;
- marcar como duplicado;
- restaurar;
- reverter lote de importação.

Evitar exclusão física. Quando exclusão física for realmente necessária:

- exigir permissão elevada;
- mostrar confirmação explícita;
- registrar auditoria;
- impedir exclusão em cascata acidental.

---

## 11. Segurança e privacidade

Regras específicas do Firebase:

- Firebase Admin SDK é exclusivo do servidor e ignora Security Rules; autorize explicitamente cada operação.
- Security Rules devem negar por padrão, restringir campos e ser testadas no Emulator Suite.
- O usuário nunca pode editar suas próprias áreas, funções ou permissões.
- CPF não pode aparecer em ID de documento, URL, log, analytics ou nome de arquivo.
- A fingerprint de duplicidade deve ser HMAC gerada no servidor.
- Firebase client config pode estar no cliente, mas credenciais administrativas e secrets nunca.
- App Check, IAM mínimo, alertas de orçamento e backup são gates de produção.


O sistema processa dados pessoais. Portanto:

- Nunca usar dados reais em testes automatizados, screenshots públicas ou issues.
- Criar fixtures fictícias.
- Mascarar CPF e telefone em telas onde o valor completo não seja necessário.
- Não registrar CPF, telefone, token ou conteúdo integral de planilha em logs de aplicação.
- Validar tamanho, extensão e conteúdo de uploads.
- Armazenar arquivos em área privada ou descartá-los após processamento conforme política aprovada.
- Implementar rate limiting onde houver risco de abuso.
- Aplicar proteção contra CSRF quando pertinente à estratégia de autenticação.
- Usar repositórios Firestore tipados, queries indexadas e validação server-side.
- Validar autorização em Server Actions, Route Handlers e consultas.
- Nunca confiar em role/permission enviada pelo cliente.
- Manter `.env`, chaves e credenciais fora do Git.
- Atualizar `.env.example` somente com nomes de variáveis e exemplos não secretos.

Qualquer decisão de retenção de arquivos, backups ou dados deve ser documentada.

---

## 12. UX e interface

### 12.1 Princípios

- Dashboard deve ser compreendido rapidamente.
- Filtros por mês/período devem ser consistentes em todo o sistema.
- Tabelas devem ter busca, filtros, paginação e estados claros.
- Ação primária deve estar visível; ações perigosas devem estar separadas.
- Não usar apenas verde/amarelo/vermelho: incluir rótulo, ícone ou texto.
- Exibir loading, vazio, erro e sucesso.
- Manter navegação consistente por área.
- Responsividade deve priorizar desktop, sem tornar celular inutilizável.

### 12.2 Confirmações

Usar modal de confirmação para:

- invalidar matrícula;
- arquivar registro;
- reverter importação;
- alterar valor;
- alterar vendedor;
- excluir usuário;
- mudar permissão crítica.

O modal deve explicar consequência e possibilidade de reversão.

### 12.3 Acessibilidade

- Labels associados aos campos.
- Foco visível.
- Navegação por teclado.
- Contraste adequado.
- Ícones com texto acessível.
- Tabelas e gráficos com alternativa textual.

---

## 13. Testes mínimos obrigatórios

### 13.1 Importação

Cobrir:

- planilha válida;
- coluna obrigatória ausente;
- colunas em ordem diferente;
- SIM/NÃO/vazio;
- valor `R$ 199,90`;
- CPF com máscara e sem máscara;
- CPF repetido com curso diferente;
- duplicado exato no mesmo mês;
- mesmo aluno em instituição diferente;
- vendedor desconhecido;
- curso vazio;
- lote parcialmente inválido;
- reimportação do mesmo lote;
- atualização manual após importação.

### 13.2 Permissões

Cobrir:

- Relacionamento edita matrícula de outro colaborador da mesma área;
- Relacionamento não altera Vendedor;
- usuário sem permissão não contorna restrição por requisição direta;
- Gestão acessa ações administrativas;
- permissões múltiplas por usuário;
- ação destrutiva gera auditoria.

### 13.3 KPIs e dinheiro

Cobrir:

- faturamento total;
- faturamento válido;
- matrícula inválida excluída somente do cálculo válido;
- arredondamento monetário;
- BVS pendente automática;
- filtros por mês;
- agrupamento por instituição, curso e vendedor.

### 13.4 Interface

Cobrir os fluxos críticos em E2E:

1. login;
2. importar planilha;
3. revisar duplicidade;
4. confirmar importação;
5. editar matrícula;
6. marcar `Subiu? = SIM`;
7. visualizar pendência de BVS;
8. marcar BVS enviada;
9. validar atualização do dashboard.

---

## 14. Definition of Done

Uma tarefa só está concluída quando:

- o comportamento atende aos critérios de aceitação;
- autorização foi aplicada no servidor;
- estados de erro, vazio, loading e sucesso foram tratados;
- testes aplicáveis foram criados e executados;
- lint, tipos e build passam;
- não há segredo ou dado real exposto;
- Security Rules, índices e scripts de evolução de dados foram revisados;
- documentação relevante foi atualizada;
- o diff foi revisado;
- a PR possui descrição e evidências;
- a alteração foi validada por outro desenvolvedor quando crítica.

“Funciona na minha máquina” não é Definition of Done.

---

## 15. Documentação viva

Atualize `CONTEXT.md` somente quando houver uma decisão confirmada ou mudança real de escopo.

Crie ADR em `docs/decisions/` quando decidir:

- Firebase, Firestore e estratégia de acesso a dados;
- autenticação;
- modelo de permissões;
- armazenamento/processamento de planilhas;
- estratégia de auditoria;
- hospedagem;
- política de backups;
- integração futura com Google Sheets ou WhatsApp.

Formato sugerido:

```text
docs/decisions/0001-firebase-and-firestore.md
```

Cada ADR deve conter contexto, decisão, alternativas e consequências.

Não use `CONTEXT.md` como diário de desenvolvimento. Use changelog, issues, PRs e ADRs.

---

## 16. Regras para Antigravity e agentes autônomos

- Trabalhe apenas dentro do diretório do projeto.
- Não acesse arquivos externos sem necessidade e aprovação.
- Não execute comandos destrutivos automaticamente.
- Peça confirmação antes de apagar arquivos, apagar coleções, reverter backfills ou alterar Rules/índices, alterar muitas dependências ou fazer deploy.
- Prefira artifacts verificáveis: planos, especificações, diffs, resultados de testes e screenshots.
- Use subagentes para pesquisa, QA e revisão, mas mantenha um único responsável pela integração.
- Não aceite a saída de um agente como verdade sem verificar no código e no terminal.
- Ao receber o futuro `HYPER_PROMPT.md`, trate-o como especificação abrangente, não como autorização para ignorar testes, revisão ou segurança.
- Um “prompt único” pode iniciar a construção, mas o agente deve trabalhar em etapas verificáveis e interromper em decisões pendentes.

---

## 17. Ações proibidas

- Commitar `.env`, tokens, senhas, dumps ou planilhas reais.
- Fazer push direto em `main`.
- Desativar testes para obter build verde.
- Usar `// @ts-ignore` ou `eslint-disable` sem justificativa localizada.
- Alterar regra confirmada para facilitar implementação.
- Considerar CPF repetido como duplicidade automática.
- Transformar vazio de BVS/Subiu em NÃO.
- Armazenar dinheiro em `float`.
- Autorizar ações apenas escondendo botões.
- Apagar registros críticos sem auditoria.
- Criar integração falsa com sistemas das faculdades.
- Expor dados completos de alunos em dashboards desnecessariamente.
- Adicionar biblioteca sem verificar necessidade, manutenção e impacto.
- Declarar tarefa concluída sem testes executados.

---

## 18. Formato de entrega do agente

Ao concluir uma tarefa, responda neste formato:

```markdown
## Resultado
Resumo objetivo da mudança.

## Arquivos principais
- caminho/arquivo: finalidade

## Validação
- comando: resultado
- teste manual: resultado

## Segurança e permissões
O que foi verificado.

## Pendências ou riscos
Somente itens reais.

## Próximo passo recomendado
Uma ação específica.
```

---

## 19. Lembrete central

O sucesso do projeto não é medido pela quantidade de telas ou código gerado. É medido pela capacidade de a CIES:

- enxergar metas e resultados;
- identificar gargalos;
- acompanhar matrículas e boas-vindas;
- entender desempenho por colaborador, curso e instituição;
- agir com base em dados;
- manter uma rotina simples para a equipe.

Construa o sistema para a operação real, não para uma demonstração artificial.
