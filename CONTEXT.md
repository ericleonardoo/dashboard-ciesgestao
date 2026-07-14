# CONTEXT.md — Sistema Interno de Gestão da CIES (Firebase Edition)

> Contexto de produto e domínio para humanos e agentes de IA.
> Este documento registra o que já foi confirmado, o que está proposto e o que ainda precisa ser decidido.

## 1. Identificação do projeto

**Nome de trabalho:** CIES Gestão  
**Tipo:** Sistema web interno de gestão, indicadores e acompanhamento estratégico  
**Status atual:** Preparação do ambiente e especificação pré-desenvolvimento  
**Responsável operacional e líder de desenvolvimento:** Eric  
**Stakeholder principal:** Elen, Gestão/Coordenação/Comercial da CIES  
**Equipe de desenvolvimento:** Eric e seu primo, trabalhando de forma colaborativa pelo GitHub  
**Prazo inicialmente comunicado para a primeira versão funcional:** aproximadamente três semanas, sujeito a validação do escopo técnico

---

## 2. Resumo executivo

A CIES controla atualmente suas matrículas por uma planilha no Google Sheets e utiliza sistemas próprios das faculdades parceiras para processos acadêmicos e administrativos oficiais.

O novo sistema não substituirá a planilha, os sistemas das faculdades, o WhatsApp ou todas as rotinas manuais. Ele funcionará como uma camada interna de gestão e inteligência, permitindo:

- importar periodicamente a planilha de matrículas;
- organizar e validar os registros;
- editar manualmente dados importados conforme permissões;
- acompanhar metas de matrículas e faturamento;
- analisar resultados por colaborador, curso, instituição e período;
- identificar pendências de liberação e boas-vindas;
- acompanhar leads, convênios, campanhas e planos de ação;
- encontrar gargalos semanais, quinzenais e mensais;
- apoiar decisões da Gestão com dados confiáveis.

A visão central é:

> O sistema deve mostrar onde a CIES está, o que falta para alcançar suas metas, onde está o gargalo e qual ação precisa ser tomada.

---

## 3. Contexto da CIES

A CIES é um polo/empresa que atende alunos e trabalha com instituições de ensino superior parceiras.

### Instituições atuais no escopo inicial

- UniFecaf
- UniFacvest
- FSL — Faculdade São Luiz

### Fora do foco inicial

A CIES também trabalha ou trabalhou com EJA, mas esse segmento está temporariamente fora do MVP. A arquitetura não deve bloquear uma inclusão futura, mas nenhuma funcionalidade específica de EJA deve atrasar a primeira versão.

### Áreas internas

- Gestão
- Relacionamento com o Aluno
- Comercial
- Administrativo
- Marketing

A empresa possui equipe pequena, e algumas pessoas atuam em mais de uma área. O sistema não deve assumir uma relação rígida de “um usuário = uma única área”.

---

## 4. Equipe conhecida

| Pessoa | Atuação atual conhecida |
|---|---|
| Elen | Gestão, Coordenação e Comercial |
| Eric | Relacionamento com o Aluno e desenvolvimento do sistema |
| Nayara | Relacionamento com o Aluno |
| Bia | Administrativo, Marketing e Comercial |
| Ninha | Consultora Educacional e Comercial |

Todos os colaboradores deverão ter acesso ao sistema. O conjunto exato de permissões por módulo ainda deverá ser validado com a Gestão.

### E-mails corporativos

Existe a proposta de criar e-mails individuais no domínio da empresa, por exemplo:

```text
eric.carvalho@ciesmg.com.br
elen.sena@ciesmg.com.br
```

**Status:** PROPOSTO, ainda não confirmado como requisito de autenticação.

O sistema deve permitir autenticação individual independentemente de a criação desses e-mails ocorrer antes ou depois do MVP.

---

## 5. Problema atual

A operação produz dados importantes, mas eles ficam distribuídos entre:

- planilha de matrículas no Google Sheets;
- sistemas oficiais das faculdades;
- WhatsApp;
- agendas e anotações manuais;
- conhecimento das pessoas;
- análises realizadas manualmente pela Gestão.

Isso dificulta responder rapidamente:

- quantas matrículas foram feitas no mês;
- quanto falta para a meta;
- qual foi o faturamento;
- qual colaborador, curso ou instituição performou melhor;
- quantas matrículas já foram liberadas;
- quais alunos ainda não receberam boas-vindas;
- se o gargalo está na captação, venda, liberação, atendimento ou acompanhamento;
- quais ações precisam ser priorizadas.

---

## 6. Objetivo do produto

Criar um sistema interno simples, confiável e intuitivo para centralizar a visão gerencial da CIES sem obrigar a equipe a abandonar processos que já funcionam.

O sistema deverá:

1. Receber a planilha atual de matrículas.
2. Validar e importar seus registros.
3. Permitir ajustes manuais posteriores.
4. Transformar os dados em indicadores e alertas.
5. Oferecer visões adequadas para cada área.
6. Controlar acesso e edição por permissões.
7. Registrar ações críticas e evitar exclusões acidentais.
8. Permitir análise por mês e outros períodos selecionados.

---

## 7. Não objetivos

O sistema **não** deve, no MVP:

- substituir os sistemas oficiais da UniFecaf, UniFacvest ou FSL;
- copiar módulos acadêmicos completos das faculdades;
- controlar avaliações, provas, documentos, AVA, boletos ou atividades que obrigatoriamente ficam no sistema da faculdade;
- substituir o WhatsApp;
- substituir a agenda manual de demandas cotidianas;
- obrigar o Relacionamento a registrar cada atendimento comum;
- importar automaticamente todos os alunos históricos dos sistemas das faculdades;
- criar uma réplica completa de ERP educacional;
- incluir EJA como fluxo principal;
- integrar-se a sistemas de terceiros sem acesso oficial e autorização.

O critério para inclusão de uma informação é:

> Ela ajuda a medir resultado, identificar gargalo, acompanhar meta, melhorar atendimento ou orientar uma decisão de gestão?

---

## 8. Processo atual e processo futuro

### 8.1 Processo atual

```text
Atendimento / venda / matrícula
        ↓
Preenchimento da planilha no Google Sheets
        ↓
Uso dos sistemas oficiais das faculdades
        ↓
Acompanhamento manual de demandas
        ↓
Análise manual dos resultados
```

### 8.2 Processo futuro desejado

```text
Atendimento / venda / matrícula
        ↓
Planilha continua sendo preenchida
        ↓
Importação periódica no CIES Gestão
        ↓
Validação, normalização e revisão
        ↓
Dashboards, KPIs, alertas e relatórios
        ↓
Identificação de gargalos
        ↓
Plano de ação 5W2H
        ↓
Nova medição de resultados
```

A frequência de importação/análise pode ser semanal, quinzenal ou mensal. A Gestão deverá poder filtrar o período. A conversa inicial indicou uso quinzenal como rotina importante.

---

## 9. Fonte de dados principal: planilha de matrículas

A planilha histórica possui as colunas:

| Coluna | Significado | Regra atual |
|---|---|---|
| Aluno | Nome do aluno | Obrigatória para uso normal |
| Valor | Valor da matrícula/venda | Formato brasileiro, exemplo `R$ 199,90` |
| Tipo | Tipo da matrícula | Opcional; normalmente não preenchido |
| Inst. | Instituição | UniFecaf, UniFacvest ou FSL |
| Vendedor | Pessoa que fechou a matrícula | Usado em desempenho por colaborador |
| BVS? | Boas-vindas enviadas | `SIM`, `NÃO` ou vazio |
| CPF | CPF do aluno | Identifica o aluno, não a matrícula isolada |
| Telefone | Telefone do aluno | Usado em contato |
| Redirect | Atalho para WhatsApp | Direciona ao WhatsApp do aluno |
| Subiu? | Matrícula liberada pela faculdade | `SIM`, `NÃO` ou vazio |
| Curso | Curso da matrícula | Copiado diretamente do sistema da faculdade |
| Pagamento | Forma de pagamento | Pix, boleto ou cartão |

### 9.1 Mês de referência

A planilha não possui data exata de matrícula como requisito atual. Para a gestão pretendida, basta associar o lote a um **mês de referência**, por exemplo `junho/2026`.

**Regra confirmada:** data exata de matrícula não é necessária no MVP.

A interface pode permitir identificar o lote como mensal, primeira quinzena ou segunda quinzena, mas a necessidade dessa subdivisão deve ser confirmada antes de torná-la obrigatória.

---

## 10. Importação da planilha

### 10.1 Objetivo

Importar o modelo histórico sem exigir que a equipe reformule a planilha.

### 10.2 Fluxo esperado

1. Usuário autorizado seleciona o arquivo.
2. Informa o mês de referência.
3. Sistema valida cabeçalhos.
4. Sistema normaliza os valores.
5. Sistema apresenta uma prévia.
6. Sistema identifica erros, avisos e possíveis duplicidades.
7. Usuário decide como tratar conflitos.
8. Sistema confirma a importação.
9. Dashboard é recalculado.
10. Lote fica registrado no histórico.

### 10.3 Informações do lote

Cada importação deverá registrar, no mínimo:

- identificador do lote;
- mês de referência;
- nome original do arquivo;
- usuário responsável;
- data/hora da importação;
- total de linhas lidas;
- total criado;
- total atualizado;
- total ignorado;
- total com erro;
- resultado e status do lote.

### 10.4 Validação de cabeçalhos

O sistema deve reconhecer exatamente o modelo esperado e avisar quando houver:

- coluna obrigatória ausente;
- nome inesperado;
- arquivo sem dados;
- formato não suportado;
- múltiplas abas ambíguas;
- células incompatíveis.

A estratégia de tolerância a pequenas variações de cabeçalho ainda deverá ser definida. Não corrigir por adivinhação.

### 10.5 Dados editáveis

**Regra confirmada:** todos os dados importados poderão ser alterados manualmente depois, respeitando permissões e proteção de campos críticos.

Alterações relevantes devem ter auditoria.

---

## 11. Modelo de aluno e matrícula

### 11.1 Regra central

Um aluno pode possuir várias matrículas.

```text
Aluno 1
 ├── Matrícula A — Administração / UniFecaf
 └── Matrícula B — Pedagogia / UniFecaf
```

O CPF identifica o aluno, mas não pode ser usado sozinho para definir uma matrícula única.

### 11.2 Regra de duplicidade confirmada

O sistema deve permitir:

- mesmo CPF com curso diferente;
- mesmo CPF com instituição diferente, caso exista uma matrícula real;
- múltiplas matrículas legítimas em campanhas específicas.

O sistema deve sinalizar como duplicidade ou atualização quando houver, no mínimo:

```text
CPF normalizado + Curso normalizado + Instituição + Mês de referência
```

Exemplo permitido:

| CPF | Curso | Instituição | Mês |
|---|---|---|---|
| 123 | Administração | UniFecaf | 2026-06 |
| 123 | Pedagogia | UniFecaf | 2026-06 |

Exemplo de conflito:

| CPF | Curso | Instituição | Mês |
|---|---|---|---|
| 123 | Administração | UniFecaf | 2026-06 |
| 123 | Administração | UniFecaf | 2026-06 |

A tela de revisão deve oferecer opções controladas, como:

- ignorar registro duplicado;
- atualizar registro existente;
- revisar/editar antes de confirmar;
- importar mesmo assim, somente se a permissão e a justificativa permitirem.

Nenhuma linha deve desaparecer silenciosamente.

---

## 12. Estados de BVS e Subiu

### 12.1 BVS?

Significa **Boas-vindas**. A equipe envia uma mensagem de boas-vindas depois que a matrícula é liberada no sistema da faculdade.

Valores reais:

- SIM
- NÃO
- vazio / não informado

### 12.2 Subiu?

Indica se a matrícula foi liberada no sistema da faculdade.

Valores reais:

- SIM
- NÃO
- vazio / não informado

### 12.3 Regra automática confirmada

Se:

```text
Subiu? = SIM
BVS? = NÃO ou vazio
```

então a matrícula deve aparecer automaticamente em **Boas-vindas pendentes**.

Ao marcar BVS como SIM, a pendência deve desaparecer e os indicadores devem ser atualizados.

Vazio não é igual a NÃO. O sistema deve preservar os três estados.

---

## 13. Formas de pagamento e valores

### Pagamentos iniciais

- Pix
- Boleto
- Cartão

### Valores

- Entrada no formato brasileiro, por exemplo `R$ 199,90`.
- Armazenamento deve evitar erro de ponto flutuante.
- Campo Valor é sensível e deve ser mais protegido.

### Indicadores confirmados

O dashboard deve mostrar:

1. **Faturamento total da planilha** — soma de todos os registros considerados no lote/período.
2. **Faturamento válido** — soma apenas das matrículas classificadas como válidas segundo regra de negócio central.

A definição exata de matrícula válida e o tratamento de canceladas, arquivadas, duplicadas e inválidas ainda precisam ser formalizados com a Gestão.

---

## 14. Vendedor e desempenho

A coluna `Vendedor` indica quem fechou a matrícula.

### Regras confirmadas

- O vendedor poderá ser vinculado ao usuário/colaborador correspondente.
- Somente Gestão/Admin pode alterar Vendedor depois da importação.
- O sistema deverá permitir análise por vendedor.
- O Relacionamento também pode fechar vendas; essas vendas devem continuar sendo reconhecidas.

### Pendência de modelagem

Definir como tratar:

- variações de nome na planilha;
- vendedor que ainda não possui usuário;
- colaborador desativado;
- apelidos;
- vendas compartilhadas.

Proposta: tabela de aliases do vendedor, com revisão humana para nomes desconhecidos.

---

## 15. Usuários, áreas e permissões

### 15.1 Princípio

Permissões devem ser flexíveis por módulo e ação, pois colaboradores atuam em múltiplas áreas.

Exemplos de ações:

- visualizar;
- criar;
- editar;
- arquivar;
- invalidar;
- restaurar;
- importar;
- exportar;
- gerenciar permissões;
- alterar campo protegido.

### 15.2 Regras confirmadas

#### Gestão

- Visualiza e administra tudo.
- Pode realizar ações críticas.
- Deve receber pop-ups/confirmações antes de ações destrutivas ou sensíveis.

#### Relacionamento com o Aluno

- Qualquer pessoa do Relacionamento pode editar qualquer matrícula.
- Pode atualizar BVS e Subiu.
- Pode acessar os dados necessários ao atendimento.
- Não pode alterar Vendedor.
- Valor deve permanecer protegido.

#### Administrativo

- Poderá importar planilhas e revisar matrículas.
- Pode alterar Vendedor conforme regra confirmada Gestão/Admin.
- Outras permissões precisam ser refinadas.

#### Comercial

- Deve trabalhar com vendas, leads, convênios e desempenho.
- Permissões exatas ainda precisam de aprovação.

#### Marketing

- Deve acompanhar campanhas, origens, leads e resultados.
- Permissões exatas ainda precisam de aprovação.

### 15.3 Visibilidade entre áreas

Existe a proposta de que colaboradores possam visualizar dados de outras áreas, mas editar apenas aquilo permitido para sua função.

**Status:** PROPOSTO; precisa ser validado com Elen.

### 15.4 Exclusão

Preferência já discutida:

- arquivar;
- cancelar;
- marcar como inválido;
- marcar como duplicado;
- restaurar;
- excluir fisicamente apenas em casos restritos.

A política final de retenção e exclusão precisa ser aprovada.

---

## 16. Módulos e páginas planejados

### 16.1 Login e autenticação

Objetivo:

- acesso individual;
- identificação das ações;
- aplicação de permissões;
- futura compatibilidade com e-mail corporativo.

### 16.2 Dashboard Geral

Público principal: Gestão.

Deve apresentar, por período selecionado:

- meta de matrículas;
- matrículas realizadas;
- percentual atingido;
- matrículas faltantes;
- meta de faturamento;
- faturamento total;
- faturamento válido;
- desempenho por vendedor;
- desempenho por instituição;
- cursos com maior volume;
- formas de pagamento;
- matrículas liberadas;
- matrículas pendentes de liberação;
- BVS enviadas;
- BVS pendentes;
- alertas e gargalos.

### 16.3 Minha Área

Painel personalizado por usuário/permissões.

Exemplos:

- Relacionamento: BVS pendentes, matrículas que não subiram e indicadores do setor.
- Comercial: leads, vendas, conversão, convênios e metas.
- Administrativo: importações, inconsistências e revisão.
- Marketing: campanhas, canais, leads e conversão.
- Gestão: visão geral, metas e planos de ação.

### 16.4 Importações

- upload de planilha;
- mês de referência;
- validação de cabeçalhos;
- prévia;
- normalização;
- revisão de conflitos;
- confirmação;
- histórico de lotes;
- reversão controlada.

### 16.5 Matrículas

- tabela central;
- pesquisa por aluno ou CPF;
- filtros por mês, instituição, vendedor, curso, pagamento, BVS e Subiu;
- edição manual conforme permissão;
- acesso ao WhatsApp por Redirect;
- arquivar, invalidar e restaurar;
- visualização do histórico de alterações em campos críticos.

### 16.6 Metas e KPIs

- metas de matrículas;
- metas de faturamento;
- metas operacionais;
- resultados por período;
- semáforo;
- evolução;
- comparações.

A regra final do semáforo ainda precisa ser definida pela Gestão.

### 16.7 Colaboradores e permissões

- usuários;
- áreas;
- papéis múltiplos;
- permissões por módulo/ação;
- status ativo/inativo;
- vínculo com nomes de vendedor na planilha;
- último acesso e auditoria, se aprovado.

### 16.8 Leads

Campos propostos:

- nome;
- telefone;
- curso de interesse;
- instituição de interesse;
- origem;
- responsável;
- status;
- período;
- resultado;
- motivo de perda.

Status sugeridos:

- Novo
- Em atendimento
- Aguardando retorno
- Aguardando documentação
- Aguardando pagamento
- Matriculado
- Perdido
- Sem resposta

O nível de obrigatoriedade de uso deste módulo ainda deverá ser validado. Ele não deve tornar o atendimento excessivamente burocrático.

### 16.9 Convênios

Campos propostos:

- empresa;
- contato;
- cidade/bairro;
- responsável CIES;
- status;
- visitas;
- leads gerados;
- matrículas geradas;
- período.

Status sugeridos:

- A prospectar
- Contato feito
- Visita agendada
- Proposta enviada
- Convênio fechado
- Sem interesse
- Reativar depois

### 16.10 Marketing e campanhas

- campanha;
- canal;
- período;
- custo;
- leads;
- matrículas;
- conversão;
- instituição/curso relacionado;
- resultado.

Canais iniciais sugeridos:

- Instagram
- WhatsApp
- Indicação
- Presencial
- Panfleto
- Empresa conveniada
- Evento
- Google
- TikTok
- Campanha interna

### 16.11 Relacionamento / casos importantes

Este módulo não deve copiar o sistema acadêmico das faculdades nem registrar todo atendimento.

Deve apoiar registros estratégicos, como:

- reclamação recorrente;
- aluno com risco de evasão;
- dificuldade de acesso;
- problema com prova;
- problema financeiro;
- dificuldade de contato;
- caso que impacta retenção;
- venda fechada pelo atendimento;
- indicação;
- pendência importante.

Possíveis status:

- Aberto
- Em acompanhamento
- Resolvido
- Encaminhado
- Sem retorno
- Risco de evasão

**Regra atual:** observação interna em cada matrícula não faz parte da primeira versão confirmada. Casos importantes podem existir como entidade separada se aprovados.

### 16.12 Planos de ação 5W2H

Campos:

- objetivo;
- o quê;
- por quê;
- onde;
- quando;
- quem;
- como;
- quanto;
- status;
- KPI relacionado;
- resultado.

O fluxo esperado é:

```text
Objetivo → 5W2H → Execução → KPI → Análise → Ajuste/Novo 5W2H
```

### 16.13 Relatórios

Relatórios por:

- período;
- instituição;
- curso;
- vendedor;
- pagamento;
- BVS;
- Subiu;
- campanha;
- convênio;
- colaborador;
- meta.

Exportação PDF/Excel pode ser incluída conforme priorização.

---

## 17. KPIs e análises desejadas

### 17.1 Matrículas

- total de matrículas;
- meta x realizado;
- faltante para a meta;
- evolução por período;
- matrículas por instituição;
- matrículas por curso;
- matrículas por vendedor;
- matrículas por pagamento.

### 17.2 Faturamento

- faturamento total;
- faturamento válido;
- meta x realizado;
- faturamento por instituição;
- faturamento por vendedor;
- ticket médio, se aprovado.

### 17.3 Operação pós-matrícula

- taxa de matrículas que subiram;
- quantidade pendente de subir;
- taxa de BVS enviada;
- quantidade de BVS pendentes;
- tempo de pendência, somente se no futuro houver data confiável.

### 17.4 Comercial e marketing

- leads captados;
- conversão em matrícula;
- origem dos leads;
- campanha x resultado;
- convênios fechados;
- leads e matrículas por convênio.

### 17.5 Atendimento e relacionamento

- casos importantes;
- reclamações;
- problemas recorrentes;
- casos resolvidos;
- sinais de risco de evasão;
- vendas fechadas pelo atendimento;
- satisfação, se no futuro houver coleta estruturada.

### 17.6 Semáforo

O uso de verde, amarelo e vermelho foi aprovado conceitualmente, mas os limites exatos ainda precisam ser definidos.

Proposta inicial não confirmada:

- Verde: meta alcançada ou desempenho saudável.
- Amarelo: atenção, próximo do limite.
- Vermelho: desempenho abaixo do esperado ou gargalo crítico.

Nunca usar somente cor; incluir texto e valor.

---

## 18. Fluxos críticos de usuário

### 18.1 Importar e revisar matrículas

```text
Login
→ Importações
→ Selecionar arquivo
→ Informar mês
→ Validar
→ Revisar prévia
→ Resolver duplicidades/erros
→ Confirmar
→ Ver resumo
→ Dashboard atualizado
```

### 18.2 Atualizar liberação e boas-vindas

```text
Matrículas
→ Filtrar Subiu? = NÃO/vazio
→ Atualizar para SIM
→ Sistema verifica BVS
→ Matrícula aparece em BVS pendente
→ Abrir WhatsApp pelo Redirect
→ Enviar boas-vindas
→ Marcar BVS = SIM
→ Pendência removida
```

### 18.3 Analisar meta e criar ação

```text
Dashboard
→ Selecionar mês
→ Identificar KPI abaixo da meta
→ Abrir detalhes
→ Identificar dimensão do gargalo
→ Criar plano 5W2H
→ Atribuir responsável/prazo
→ Medir novamente no próximo período
```

### 18.4 Editar campo protegido

```text
Matrícula
→ Solicitar edição de Vendedor ou Valor
→ Verificar permissão no servidor
→ Exibir confirmação
→ Salvar alteração
→ Registrar auditoria
→ Recalcular indicadores afetados
```

---

## 19. Modelo conceitual inicial

Este modelo é uma proposta de domínio para Cloud Firestore, não um desenho final e imutável.

### Collections e documentos principais

#### `users/{uid}`

- name
- email
- status
- areas
- permissions por módulo/ação
- employeeId opcional
- createdAt / updatedAt

O `uid` vem do Firebase Authentication. O usuário não pode elevar suas próprias permissões.

#### `areas/{areaId}`

- name
- active

#### `employees/{employeeId}`

- userId opcional
- displayName
- active
- primaryArea

#### `sellerAliases/{aliasId}`

- employeeId
- sourceName
- normalizedSourceName

#### `students/{studentId}`

- normalizedCpf protegido
- cpfFingerprint para busca/deduplicação server-side
- name
- phone
- createdAt / updatedAt

CPF nunca deve ser document ID. A estratégia final de proteção deve ser documentada em ADR.

#### `enrollments/{enrollmentId}`

- studentId
- institution
- courseOfficialName
- courseNormalizedName
- referenceMonth (`YYYY-MM`)
- amountCents
- type opcional
- sellerId
- sellerSourceName
- welcomeStatus (`yes` / `no` / `unset`)
- releaseStatus (`yes` / `no` / `unset`)
- paymentMethod
- redirect
- validityStatus
- dedupFingerprint
- importBatchId opcional
- sourceRowNumber opcional
- schemaVersion
- createdAt / createdBy
- updatedAt / updatedBy

#### `importBatches/{batchId}`

- referenceMonth
- originalFileName sanitizado
- importedBy
- status
- totals
- parserVersion
- createdAt / completedAt

#### `importBatches/{batchId}/rows/{rowId}`

- rowNumber
- status
- errorCode
- message sanitizada
- enrollmentId opcional
- normalizedPreview sem PII desnecessária

#### `goals/{goalId}`

- period
- metric
- target
- scope
- status

#### `kpiSnapshots/{snapshotId}` ou agregação calculada

A decisão entre aggregation queries, snapshots persistidos e agregação de escrita será feita considerando consistência, custo de leitura e volume. Dashboards não devem baixar toda a collection para calcular totais no cliente.

#### `leads/{leadId}`

- contact data protegida
- interest
- source
- owner
- status
- outcome

#### `partnerships/{partnershipId}`

- company
- contact
- owner
- status
- metrics

#### `campaigns/{campaignId}`

- channel
- period
- costCents
- metrics

#### `relationshipCases/{caseId}`

- studentId opcional
- category
- status
- owner
- retentionImpact

#### `actionPlans/{planId}`

- objective
- what
- why
- where
- when
- who
- how
- howMuchCents
- linkedKpi
- status

#### `auditLogs/{logId}`

- actorId
- entity
- entityId
- action
- changedFields sem valores sensíveis desnecessários
- timestamp
- request/correlation id quando aplicável

### Observações de modelagem Firestore

- Use top-level collections para dados consultados globalmente.
- Use subcollections apenas para filhos realmente acoplados ao pai.
- Evite arrays ilimitados e documentos que cresçam indefinidamente.
- Planeje queries e composite indexes antes de implementar filtros.
- Toda desnormalização precisa ter fonte canônica e mecanismo de atualização.
- Dados pessoais e financeiros exigem Rules, autorização server-side, mascaramento e logs seguros.
- Evoluções de estrutura devem usar `schemaVersion` e scripts idempotentes de backfill.

## 20. Requisitos de experiência do usuário

- Interface em português do Brasil.
- Dashboard compreensível rapidamente.
- Filtros consistentes por mês/período.
- Tabelas com pesquisa e filtros.
- Ações rápidas para BVS e Subiu.
- Confirmação para ações críticas.
- Estados de loading, vazio, erro e sucesso.
- Feedback claro após importação e edição.
- Acessibilidade básica desde o início.
- Desktop como contexto principal de uso.
- Responsividade suficiente para consultas em celular.
- Não exigir conhecimento técnico dos colaboradores.

---

## 21. Requisitos não funcionais

### Segurança

- autenticação individual;
- autorização no servidor;
- proteção de CPF e telefone;
- segredo fora do Git;
- upload privado e validado;
- auditoria de campos críticos;
- prevenção de exclusão acidental.

### Confiabilidade

- importação repetível e revisável;
- cálculos financeiros exatos;
- migrações versionadas;
- backups antes de mudanças destrutivas;
- comportamento testado para duplicidades.

### Desempenho

A empresa possui poucos colaboradores, mas pode ter uma base grande de matrículas. O sistema deve usar paginação, filtros no servidor e índices adequados, sem otimização prematura.

### Manutenibilidade

- TypeScript estrito;
- arquitetura modular;
- testes em regras críticas;
- documentação viva;
- dependências reduzidas;
- CI obrigatório.

### Observabilidade

- logs técnicos sem dados pessoais desnecessários;
- registro de falhas de importação;
- rastreabilidade de ações críticas;
- monitoramento de erros a definir antes da produção.

---

## 22. Direção tecnológica

### Confirmado

- Desenvolvimento colaborativo usando GitHub.
- Uso do Google Antigravity como ambiente/agente de desenvolvimento.
- Aplicação web em Next.js.
- Firebase Console como plataforma backend escolhida.
- Cloud Firestore como banco de dados.
- Firebase Authentication para acesso individual dos colaboradores.
- Firebase Admin SDK somente no servidor.
- Firebase Security Rules e autorização server-side como camadas complementares.
- Arquivos de contexto `AGENTS.md`, `CONTEXT.md` e `HYPER_PROMPT.md`.

### Proposto

- Next.js App Router.
- TypeScript estrito.
- Tailwind CSS e shadcn/ui.
- Sessão SSR por cookie seguro criado a partir de Firebase ID token.
- Cloud Firestore Standard edition em Native mode.
- Firebase Local Emulator Suite.
- Firebase App Hosting integrado ao GitHub.
- Firebase App Check em produção.
- Cloud Storage apenas se a retenção de planilhas for aprovada.
- Cloud Functions 2nd gen somente para tarefas assíncronas/agendadas justificadas.
- Permissões granulares em `users/{uid}`; custom claims apenas para atributos pequenos e estáveis.
- Testes unitários, integração, Security Rules e E2E.
- Ambientes separados por projeto/alias Firebase.

### Pendente de decisão

- região do Firestore e do App Hosting;
- plano Spark/Blaze e orçamento mensal;
- política de criação inicial de usuários;
- uso definitivo de custom claims;
- hospedagem final no Firebase App Hosting;
- retenção ou descarte imediato dos arquivos importados;
- necessidade de Cloud Storage;
- necessidade de Cloud Functions;
- serviço de e-mail;
- domínio e e-mails corporativos;
- biblioteca de gráficos;
- política de backups/exportações;
- política LGPD/privacidade interna;
- estratégia de projetos Firebase: development, staging e production;
- regras detalhadas de App Check e monitoramento.

Decisões relevantes devem ser registradas em ADRs.

## 23. Estratégia de desenvolvimento colaborativo

### Fluxo recomendado

- `main` protegida e estável;
- branches curtas por tarefa;
- pull request obrigatório;
- revisão cruzada entre Eric e seu primo;
- CI com lint, typecheck, testes e build;
- squash merge;
- issues ou quadro de tarefas para dividir o trabalho;
- nenhuma edição concorrente nos mesmos arquivos sem alinhamento.

### Divisão inicial sugerida

#### Eric

- domínio e requisitos;
- importação da planilha;
- matrículas;
- permissões do Relacionamento;
- validação com a CIES.

#### Primo

- estrutura visual e componentes;
- autenticação;
- dashboards e gráficos;
- CI/deploy, conforme experiência.

A divisão é apenas proposta. Tarefas devem ser organizadas por módulos com fronteiras claras.

---

## 24. Escopo sugerido da primeira versão funcional

### Núcleo obrigatório

- autenticação;
- usuários/permissões básicas;
- importação da planilha;
- validação e revisão;
- matrículas;
- edição manual;
- regra de duplicidade;
- BVS/Subiu tri-state;
- BVS pendentes automáticas;
- dashboard principal;
- faturamento total e válido;
- indicadores por vendedor, instituição e curso;
- histórico de importação;
- proteção de Valor e Vendedor;
- auditoria básica de ações críticas.

### Módulos possíveis no mesmo ciclo, conforme tempo

- metas e KPIs configuráveis;
- colaboradores;
- planos 5W2H;
- leads;
- convênios;
- campanhas;
- casos importantes de Relacionamento;
- relatórios/exportações.

A quantidade de telas não deve comprometer a confiabilidade do núcleo.

---

## 25. Critérios de aceitação de alto nível

A primeira versão será considerada funcional quando:

1. Um usuário autorizado consegue entrar no sistema.
2. A planilha histórica é importada sem reformatação obrigatória.
3. Cabeçalhos ausentes são detectados antes da persistência.
4. Valores, CPF, BVS, Subiu, instituição e pagamento são normalizados corretamente.
5. O mesmo CPF com cursos diferentes é aceito.
6. Um duplicado exato do mesmo período é sinalizado.
7. Usuário autorizado pode corrigir dados importados.
8. Relacionamento pode editar qualquer matrícula.
9. Relacionamento não altera Vendedor.
10. Valor permanece protegido.
11. `Subiu = SIM` com BVS não enviada gera pendência automática.
12. Dashboard mostra matrículas e faturamento do mês.
13. Dashboard mostra faturamento total e válido separadamente.
14. Indicadores podem ser filtrados por período.
15. Ações críticas exigem confirmação e deixam rastreabilidade.
16. Permissões não podem ser burladas por chamada direta ao servidor.
17. Dados reais não aparecem em repositório, testes ou logs públicos.
18. O projeto passa por lint, typecheck, testes críticos e build.

---

## 26. Decisões ainda necessárias com Elen

1. Quais são os cinco indicadores prioritários da primeira tela?
2. Qual será a regra exata de verde, amarelo e vermelho?
3. Quais permissões cada área terá para visualizar e editar outros módulos?
4. Qual é a definição oficial de matrícula válida?
5. Como canceladas, arquivadas, duplicadas e inválidas impactam faturamento?
6. Quem poderá importar, reverter e invalidar lotes?
7. Qual será a frequência operacional padrão de análise?
8. Metas serão apenas gerais ou também por colaborador/instituição/curso?
9. Quais módulos estratégicos precisam obrigatoriamente entrar na primeira entrega?
10. Haverá criação imediata de e-mails corporativos?
11. Por quanto tempo arquivos e históricos de importação devem ser mantidos?
12. Colaboradores poderão visualizar todas as áreas em modo leitura?
13. Quais relatórios precisam ser exportáveis na primeira versão?
14. Quem será o administrador substituto além de Elen?

Essas perguntas não bloqueiam todo o bootstrap, mas bloqueiam partes específicas do produto.

---

## 27. Riscos conhecidos

### Escopo amplo em prazo curto

Mitigação: construir o núcleo verticalmente, priorizando importação, matrículas, permissões e dashboard antes de módulos secundários.

### Dependência da qualidade da planilha

Mitigação: validação, prévia, normalização, relatório de erros e fixtures baseadas no modelo real sem dados pessoais.

### Regras de permissão incompletas

Mitigação: negar por padrão e liberar somente ações confirmadas.

### Dados pessoais

Mitigação: segurança desde o início, dados fictícios em desenvolvimento e auditoria de acesso.

### Dois desenvolvedores e agentes editando em paralelo

Mitigação: branches curtas, divisão por módulo, PRs e rebase frequente.

### “Prompt único” gerar mudanças grandes sem controle

Mitigação: `HYPER_PROMPT.md` deve exigir etapas, testes, artifacts e gates de aprovação, mesmo que seja disparado por um único comando.

### Replicar funções das faculdades

Mitigação: aplicar os não objetivos e exigir justificativa gerencial para novos campos/módulos.

---

## 28. Glossário

| Termo | Significado |
|---|---|
| CIES | Empresa/polo que utilizará o sistema |
| Matrícula subiu | Matrícula foi liberada no sistema da faculdade |
| BVS | Mensagem de boas-vindas enviada após a liberação |
| Redirect | Atalho/link para abrir o WhatsApp do aluno |
| Inst. | Instituição parceira |
| FSL | Faculdade São Luiz |
| Vendedor | Pessoa que fechou a matrícula |
| Mês de referência | Mês ao qual um lote de matrículas pertence |
| Faturamento total | Soma geral definida para os registros da planilha |
| Faturamento válido | Soma somente das matrículas classificadas como válidas |
| 5W2H | Plano de ação: What, Why, Where, When, Who, How, How much |
| KPI | Indicador-chave de desempenho |
| Lote de importação | Conjunto de linhas processado a partir de um arquivo |
| Matrícula inválida | Registro que não deve contar como matrícula válida, conforme regra a aprovar |

---

## 29. Estado atual das decisões

### Confirmado

- Manter a planilha.
- Importar dados periodicamente.
- Dados importados podem ser editados.
- Mês é suficiente; data exata não é necessária.
- Mesmo CPF pode ter cursos diferentes.
- Duplicidade considera curso, instituição e período.
- BVS e Subiu aceitam SIM/NÃO/vazio.
- BVS pendente é automática quando Subiu = SIM.
- Relacionamento edita qualquer matrícula.
- Vendedor só Gestão/Admin altera.
- Valor é mais protegido.
- Mostrar faturamento total e válido.
- Todos os colaboradores terão acesso.
- O sistema não substitui sistemas das faculdades nem toda rotina manual.
- Firebase Console é a plataforma backend escolhida.
- Cloud Firestore será o banco do sistema.
- Firebase Authentication será usado nos acessos individuais.

### Proposto

- E-mails corporativos.
- Visibilidade de leitura entre áreas.
- Next.js App Router + TypeScript strict.
- Aliases de vendedor.
- Monólito modular.
- Arquivar/inativar no lugar de excluir.
- Ambientes de preview por PR.

### Pendente

- Região, plano, ambientes e hospedagem Firebase finais.
- Permissões detalhadas de Comercial, Marketing e Administrativo.
- Regra de matrícula válida.
- Fórmulas e faixas do semáforo.
- KPIs prioritários da home.
- Escopo final das três semanas.
- Política de arquivos, auditoria e backups.

---

## 30. Manutenção deste documento

Atualize este arquivo quando:

- Elen aprovar uma decisão de negócio;
- uma regra confirmada mudar;
- um módulo entrar ou sair do escopo;
- uma pendência for resolvida;
- uma decisão arquitetural afetar a compreensão global.

Não atualize este arquivo para cada commit ou detalhe de implementação.

Ao modificar:

1. Atualize a seção correspondente.
2. Mova o item entre Confirmado, Proposto e Pendente.
3. Registre a mudança no histórico abaixo.
4. Faça a alteração em PR revisada.

### Histórico

| Data | Alteração | Responsável |
|---|---|---|
| 2026-07-13 | Primeira consolidação completa do contexto pré-desenvolvimento | Eric + ChatGPT |
