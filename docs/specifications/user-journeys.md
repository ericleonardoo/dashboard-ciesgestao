# Jornadas de Usuário (User Journeys) — CIES Gestão

Descrição passo a passo dos fluxos críticos que os colaboradores realizarão no sistema CIES Gestão.

---

## Jornada 1: Importar Planilha e Resolver Inconsistências (Administrativo / Gestão)

### Personagem: Bia (Administrativo)
- **Objetivo:** Adicionar os dados de matrículas do mês de junho/2026 no sistema CIES Gestão a partir do arquivo exportado do Google Sheets.

### Fluxo:
1.  Bia entra no sistema, faz login com seu e-mail/senha corporativos e clica em **"Importar Planilha"** no menu lateral.
2.  Ela seleciona o arquivo `Matrículas_Junho_2026.xlsx` e seleciona no campo obrigatório o mês de referência correspondente (`2026-06`). Clica em **"Processar arquivo"**.
3.  O sistema realiza a leitura temporária (efêmera) no servidor:
    - Valida se todas as colunas obrigatórias existem.
    - Normaliza os valores (R$ 199,90 -> 19990 centavos, remove whitespaces de CPFs).
4.  O sistema redireciona Bia para a tela de **"Prévia de Importação"**, mostrando um resumo estatístico:
    - Total de linhas lidas: 150.
    - Novas matrículas identificadas: 142.
    - Alertas de duplicidade: 8 (mesmo CPF, curso, instituição e período já existem no banco).
5.  Bia clica na seção de duplicidades para revisar:
    - Para 5 registros ela seleciona **"Ignorar"** (já haviam sido importados em lote anterior).
    - Para 3 registros ela seleciona **"Atualizar dados"** (são correções de status que foram editados na planilha original).
6.  Bia clica em **"Confirmar Importação"**.
7.  O sistema processa as gravações no Cloud Firestore sob uma transação atômica, registra o lote `importBatches` e atualiza instantaneamente os indicadores agregados do dashboard de junho.

---

## Jornada 2: Enviar Boas-Vindas aos Alunos Liberados (Relacionamento)

### Personagem: Nayara (Relacionamento com o Aluno)
- **Objetivo:** Localizar os alunos cujas matrículas já foram aceitas e liberadas no sistema oficial das faculdades parceiras e realizar o contato inicial de boas-vindas.

### Fluxo:
1.  Nayara entra na sua dashboard personalizada (**"Minha Área - Relacionamento"**).
2.  Na fila de **"Boas-Vindas Pendentes"**, o sistema lista automaticamente os registros que atendem ao critério: `Subiu? = SIM` e `BVS? = NÃO ou NÃO INFORMADO`.
3.  Nayara vê a linha do aluno "Carlos Alberto", cujo curso é "Análise de Sistemas" na "UniFecaf".
4.  Ela clica no ícone **"Redirect" (WhatsApp)** ao lado do contato do aluno.
5.  O navegador abre uma nova aba direcionada para o WhatsApp Web com o telefone de Carlos e uma mensagem padrão de boas-vindas formatada.
6.  Após o envio, Nayara volta à tela do CIES Gestão e altera o campo da matrícula `BVS?` para **"SIM"**.
7.  A matrícula de Carlos Alberto desaparece imediatamente da fila de pendências de boas-vindas e os KPIs de BVS do mês no dashboard são incrementados.

---

## Jornada 3: Ajuste de Faturamento por Matrícula Inválida (Gestão)

### Personagem: Elen (Gestão)
- **Objetivo:** Corrigir uma matrícula importada incorretamente que está inflando os indicadores de faturamento válido do mês.

### Fluxo:
1.  Elen acessa o módulo **"Matrículas"** e faz a busca pelo CPF do aluno.
2.  O sistema exibe os detalhes da matrícula, com os campos de `Vendedor` e `Valor` desabilitados para edição padrão por segurança.
3.  Elen clica no botão **"Editar Matrícula"**. O sistema valida as permissões de Elen no servidor (Admin SDK) e habilita a alteração dos campos de segurança.
4.  Elen descobre que a matrícula foi cancelada e deve ser desconsiderada. Ela altera o campo `Status de Validade` para **"Inválida"** e insere uma justificativa: *"Cancelamento solicitado pelo aluno na faculdade"*.
5.  Ela clica em **"Salvar"**.
6.  O sistema:
    - Grava a mutação no banco.
    - Remove o valor dessa matrícula do somatório do KPI de **"Faturamento Válido"** do dashboard (o Faturamento Total permanece o mesmo por motivos de auditoria de planilha).
    - Escreve um registro na coleção `auditLogs` contendo o ID do usuário de Elen, o timestamp do servidor, os campos alterados e a justificativa fornecida.
