# B2C Pipeline Specification — CIES Gestão v3.0

## 1. Visão Geral
O funil B2C gerencia a captação e conversão de alunos (leads de pessoas físicas) provenientes de redes sociais, WhatsApp, indicações e campanhas.

## 2. Estágios do Lead B2C
1. `NEW` (Novo): Lead recém-chegado, sem contato inicial realizado.
2. `FIRST_CONTACT` (Primeiro contato): Primeira tentativa de comunicação iniciada.
3. `IN_SERVICE` (Em atendimento): Diálogo em andamento para entender demandas e interesses.
4. `QUALIFIED` (Qualificado): Lead atende aos pré-requisitos de modalidade, curso e polo.
5. `PROPOSAL_SENT` (Proposta enviada): Valores de mensalidade e oferta apresentados.
6. `NEGOTIATION` (Negociação): Alinhamento de forma de pagamento, vencimentos ou descontos.
7. `FOLLOW_UP` (Follow-up): Acompanhamento agendado para decisão do aluno.
8. `ENROLLED` (Matriculado): Lead efetivou a matrícula (vincular `convertedEnrollmentId`).
9. `LOST` (Perdido): Negociação encerrada sem conversão (motivo de perda obrigatório).
10. `NO_RESPONSE` (Sem retorno): Lead parou de responder após múltiplas tentativas.

## 3. Regras de Negócio B2C
- Todo lead deve possuir um consultor responsável (`ownerId`).
- Mudança para `LOST` exige obrigatoriamente preenchimento de `lossReason`.
- Se o lead não estiver encerrado (`ENROLLED` ou `LOST`), a data do `nextContactAt` (próximo contato) deve ser mantida. Se `nextContactAt < Agora`, o lead é destacado como **Follow-up Vencido**.
- Consultores externos visualizam prioritariamente sua própria carteira (`ownerId === uid`).
