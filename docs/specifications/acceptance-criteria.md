# Critérios de Aceitação (V1) — CIES Gestão

Lista de requisitos e comportamentos que o sistema CIES Gestão deve cumprir para ser considerado concluído na versão V1.

---

## 1. Módulo: Autenticação e RBAC
- [ ] O sistema não deve permitir cadastro público de usuários (botão de sign-up desabilitado/inexistente).
- [ ] O login deve exigir e-mail e senha validados no Firebase Authentication.
- [ ] Usuários desativados na base de dados (`users/{uid}/status == 'inactive'`) devem ter sua sessão bloqueada no servidor imediatamente, mesmo que possuam um token de autenticação cliente ainda válido.
- [ ] A navegação deve proteger rotas privadas do Next.js de acordo com a área do colaborador.
- [ ] Tentativas de alteração de dados no Firestore a partir do Client SDK sem a devida permissão em `firestore.rules` devem ser bloqueadas pelo banco com erro de permissão negada.
- [ ] Toda chamada ao servidor (Server Actions / Route Handlers) usando o Admin SDK deve conter verificação explícita de autenticação e papel de usuário, retornando erro estruturado de autorização em caso de falha.

## 2. Módulo: Motor de Importação
- [ ] Cabeçalhos de planilhas com variações de maiúsculas/minúsculas e espaçamentos (ex: ` bvs? `, `aluno`) devem ser normalizados e reconhecidos automaticamente.
- [ ] Planilhas sem a coluna obrigatória `CPF` ou sem a coluna `Aluno` devem ser rejeitadas no processamento inicial antes de salvar qualquer registro, com mensagem de erro clara exibida na UI.
- [ ] Valores financeiros informados na planilha (ex: `R$ 199,90`, `R$ 199`, `199.9`) devem ser normalizados corretamente em centavos de Real (`19990`) no banco.
- [ ] A normalização de BVS e Subiu deve considerar células vazias como `unset` (não informado), sem convertê-las para `no` (NÃO) automaticamente.
- [ ] Se uma matrícula duplicada for encontrada na prévia (mesmo CPF, curso, instituição e período), o sistema deve apresentar as opções: "Ignorar", "Atualizar" ou "Revisar" de forma visual.
- [ ] A importação total deve ser atômica: se houver falha de escrita em uma das linhas normais, o lote inteiro deve sofrer rollback no Firestore.

## 3. Módulo: Matrículas e Edição Manual
- [ ] Colaboradores da equipe de Relacionamento devem conseguir editar campos como BVS, Subiu e telefone de qualquer matrícula, mas o campo de Vendedor e Valor deve aparecer bloqueado ou somente leitura.
- [ ] Gestão deve ter permissão para alterar Valor e Vendedor.
- [ ] Se o campo Valor ou Vendedor for alterado manualmente, o sistema deve escrever um documento em `auditLogs` registrando o UID do autor, a data do servidor, o ID do documento alterado, e os valores antigo e novo.
- [ ] A tabela de matrículas deve possuir busca rápida por nome e CPF (com máscara parcial ex: `***.123.***-**` na interface, mas busca funcional por CPF limpo).
- [ ] A tabela de matrículas deve possuir paginação por cursor (limite de itens por página).

## 4. Módulo: Dashboard e KPIs
- [ ] O painel deve recalcular e exibir os dados com base no filtro de período selecionado (mês de referência `YYYY-MM`).
- [ ] O KPI de faturamento total deve somar todos os registros de matrículas importadas do período (excluindo duplicados ignorados).
- [ ] O KPI de faturamento válido deve somar apenas os valores de matrículas com `validityStatus = 'active'`. Matrículas marcadas como `invalid`, `duplicate` ou `cancelled` devem ser subtraídas do faturamento válido.
- [ ] Os cards gerenciais devem aplicar a regra visual do semáforo:
  - `Verde` se `>= 90%` da meta.
  - `Amarelo` se `>= 70%` e `< 90%` da meta.
  - `Vermelho` se `< 70%` da meta.
- [ ] O dashboard deve exibir tabelas/gráficos auxiliares com faturamento e matrículas distribuídos por Vendedor, Curso e Instituição parceira.

## 5. Módulo: Pós-Venda (Boas-Vindas)
- [ ] Matrículas cuja faculdade liberou (`Subiu? = SIM`) e a equipe ainda não contatou (`BVS? = NÃO ou NÃO INFORMADO`) devem aparecer de forma automática na tela de pendências de boas-vindas.
- [ ] O clique no Redirect deve abrir o link correto do WhatsApp com o DDI, DDD e número do aluno formatados (`https://wa.me/55...`).
- [ ] Ao marcar BVS como SIM na interface, o item deve desaparecer da fila na mesma tela sem necessidade de recarregamento manual total da página.
