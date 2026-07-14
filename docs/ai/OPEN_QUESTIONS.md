# Open Questions — CIES Gestão

Centralização de dúvidas sobre regras de negócio ou de infraestrutura que exigem alinhamento posterior com a Gestão da CIES (Elen/Eric).

## Perguntas em Aberto

### Q-001: Regra Oficial de Matrícula Válida
- **Pergunta:** Qual é a definição detalhada e oficial de uma matrícula "válida" para o cálculo do "Faturamento Válido"?
- **Impacto:** Afeta diretamente o principal indicador gerencial do dashboard.
- **Default Temporário (PROPOSTO):** Matrículas válidas são aquelas que possuem `validityStatus = 'active'`. Matrículas com status `cancelled`, `invalid`, `duplicate` ou `archived` são desconsideradas no faturamento válido. Registros com status `in_review` (em revisão) ficam em um estado intermediário que por padrão *não* conta no faturamento válido até decisão explícita.
- **Responsável:** Elen / Eric

### Q-002: Faixas de Indicadores do Semáforo
- **Pergunta:** Quais são as regras e faixas de percentual de meta para as cores Verde, Amarelo e Vermelho nos cards de KPI?
- **Impacto:** Visualização e alertas do Dashboard.
- **Default Temporário (PROPOSTO):**
  - **Verde:** Desempenho igual ou superior a 90% da meta (`>= 90%`).
  - **Amarelo:** Desempenho entre 70% (inclusivo) e 90% (exclusivo) da meta (`>= 70%` e `< 90%`).
  - **Vermelho:** Desempenho abaixo de 70% da meta (`< 70%`).
- **Responsável:** Elen

### Q-003: Permissões Granulares por Área (Comercial, Marketing e Administrativo)
- **Pergunta:** Quais módulos específicos cada uma das áreas poderá ver ou editar no modo de múltiplos papéis?
- **Impacto:** Projeto do middleware de segurança e das Security Rules.
- **Default Temporário (PROPOSTO):**
  - Todas as áreas possuem acesso de leitura aos relatórios e dashboards gerais.
  - Relacionamento: pode ler/editar todas as matrículas, atualizar BVS/Subiu, mas não edita Vendedor nem Valor.
  - Administrativo: pode importar planilhas, revisar inconsistências e alterar Vendedor.
  - Comercial: edita leads, convênios e metas comerciais; leitura de matrículas.
  - Marketing: edita campanhas e canais; visualiza dados agregados.
- **Responsável:** Elen

### Q-004: Retenção e Histórico de Arquivos de Planilha
- **Pergunta:** Por quanto tempo os arquivos de planilhas importados brutos (ou metadados detalhados de processamento) devem ser mantidos armazenados?
- **Impacto:** Custo de armazenamento e políticas LGPD do sistema.
- **Default Temporário (PROPOSTO):** Os metadados de execução do lote (responsável, data, totais de sucesso/erro) são permanentes. O arquivo físico em si não será salvo (efêmero). As linhas da planilha que apresentarem erros serão gravadas em subcoleções de staging por 30 dias para revisão humana, sendo descartadas automaticamente após esse período.
- **Responsável:** Eric / Elen
