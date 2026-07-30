# B2B Pipeline Specification — CIES Gestão v3.0

## 1. Visão Geral
O funil B2B gerencia a prospecção ativa de empresas, identificação de contatos decisores e formalização de parcerias e convênios corporativos.

## 2. Estágios da Empresa B2B
1. `PROSPECTED` (Prospectada): Empresa mapeada para prospecção.
2. `CONTACTED` (Contato realizado): Primeiro contato com a empresa realizado.
3. `DECISION_MAKER_IDENTIFIED` (Decisor identificado): Contato chave (RH, Diretoria) mapeado em `companyContacts`.
4. `MEETING_SCHEDULED` (Reunião agendada): Reunião de apresentação agendada.
5. `MEETING_HELD` (Reunião realizada): Apresentação dos convênios e benefícios concluída.
6. `PROPOSAL_SENT` (Proposta enviada): Minuta do convênio enviada à empresa.
7. `NEGOTIATION` (Em negociação): Ajustes na proposta ou no benefício oferecido.
8. `PARTNERSHIP_APPROVED` (Parceria aprovada): Termo aceito pela diretoria da empresa.
9. `PARTNERSHIP_ACTIVE` (Parceria ativa): Convênio em vigor, gerando novos leads de funcionários.
10. `NO_INTEREST` (Sem interesse): Empresa recusou a proposta de convênio (motivo registrado).

## 3. Regras de Negócio B2B
- Em oportunidades abertas, o campo `nextStep` (Próximo Passo) e `nextStepAt` são obrigatórios.
- A empresa não deve ser duplicada. A busca de similaridade considera o `cnpjFingerprint` (se informado) e o nome normalizado da empresa.
- Ao aprovar/ativar a parceria, o registro é vinculado a um documento na coleção `partnerships`, permitindo atribuir leads e matrículas posteriores a esse convênio.
