# KPI_CATALOG.md — CIES Gestão v3.0

> Catálogo central de fórmulas e definições de KPIs do CIES Gestão.

## Catálogo de Métricas e Fórmulas

| ID | Nome do KPI | Objetivo | Fórmula | Numerador | Denominador | Elegibilidade / Filtro | Tratamento de Zero |
|---|---|---|---|---|---|---|---|
| `KPI-01` | **Matrículas Totais** | Medir volume absoluto de matrículas ativas | `Count(enrollments)` | Total de documentos em `enrollments` | N/A | Período de referência (`referenceMonth`) | Retorna `0` |
| `KPI-02` | **Matrículas Válidas** | Medir matrículas confirmadas e elegíveis | `Count(enrollments onde releaseStatus == 'YES')` | Matrículas liberadas (`Subiu = SIM`) | N/A | `releaseStatus == 'YES'` no período | Retorna `0` |
| `KPI-03` | **Faturamento Total** | Total bruto comercializado | `Sum(amountCents) / 100` | Soma dos centavos de todas as matrículas | N/A | Período de referência | Retorna `0.00` |
| `KPI-04` | **Faturamento Válido** | Faturamento efetivo liberado | `Sum(amountCents onde releaseStatus == 'YES') / 100` | Soma dos centavos de matrículas com `Subiu = SIM` | N/A | `releaseStatus == 'YES'` | Retorna `0.00` |
| `KPI-05` | **Taxa de Liberação** | Percentual de matrículas que subiram no sistema oficial | `(Matrículas Válidas / Matrículas Totais) * 100` | `Matrículas Válidas` | `Matrículas Totais` | `Matrículas Totais > 0` | Retorna `0%` se denom. == 0 |
| `KPI-06` | **Boas-Vindas Pendentes** | Matrículas liberadas sem recepção concluída | `Count(enrollments onde releaseStatus == 'YES' e welcomeStatus != 'YES')` | Matrículas liberadas com BVS não concluída | N/A | `releaseStatus == 'YES' && welcomeStatus != 'YES'` | Retorna `0` |
| `KPI-07` | **Conversão B2C** | Eficiência de conversão de leads em alunos | `(Leads Matriculados / Leads Totais Elegíveis) * 100` | `Leads com status == 'ENROLLED'` | `Total de Leads criados/elegíveis` | Período e proprietário | Retorna `0%` se denom. == 0 |
| `KPI-08` | **Taxa de Contato B2C** | Alcance inicial dos leads novos | `(Leads Contatados / Leads Novos) * 100` | `Leads com status != 'NEW'` | `Total de Leads Criados` | Leads do período | Retorna `0%` se denom. == 0 |
| `KPI-09` | **Conversão B2B (Empresa -> Parceria)** | Eficiência da prospecção de empresas em convênio | `(Parcerias Aprovadas ou Ativas / Empresas Prospectadas) * 100` | `Empresas com status PARTNERSHIP_APPROVED ou ACTIVE` | `Total de Empresas Prospectadas` | Empresas do período | Retorna `0%` se denom. == 0 |
| `KPI-10` | **Atingimento de Meta** | Progresso em relação ao objetivo definido | `(Realizado Calculado / TargetValue Meta) * 100` | `Métrica realizada acumulada` | `targetValue` da Meta | Período e Escopo da meta | Retorna `0%` se denom. == 0 |
| `KPI-11` | **Matrículas por Parceria** | Volume de matrículas geradas por convênios B2B | `Count(enrollments vinculadas a partnershipId)` | Matrículas com vínculo de parceria | N/A | `partnershipId != null` | Retorna `0` |
