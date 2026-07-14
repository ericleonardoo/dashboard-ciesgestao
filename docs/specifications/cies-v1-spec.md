# Especificação de Produto (V1 Spec) — CIES Gestão

Esta especificação define o escopo funcional e as regras de negócio para a primeira versão estável (V1) do sistema CIES Gestão.

## 1. Escopo da V1 (Núcleo Obrigatório)

O sistema CIES Gestão V1 funcionará como uma camada interna de visualização gerencial e controle de fluxo, dividida nas seguintes funcionalidades essenciais:

1.  **Autenticação e Controle de Sessão:** Acesso restrito a colaboradores cadastrados e sessão gerenciada por cookies seguros.
2.  **Motor de Importação de Matrículas:** Upload, validação de cabeçalhos e tipos, staging, processamento de duplicidades e gravação transacional.
3.  **Tabela de Matrículas:** Consulta geral das matrículas com paginação, busca e filtros operacionais.
4.  **Ações Rápidas e Edição Manual:** Edição de dados importados com níveis de proteção e auditoria de alterações.
5.  **Dashboard de Gestão:** Cards e KPIs do período selecionado (matrículas e faturamento).
6.  **Fila de Pós-Venda (Boas-Vindas):** Detecção e tratamento automático de pendências de boas-vindas dos alunos.

---

## 2. Regras de Negócio e Comportamentos

### 2.1 Importação e Estrutura da Planilha
O motor de importação deve processar a planilha histórica sem exigir alterações de cabeçalho da equipe CIES.
- **Formato esperado:** XLSX ou CSV.
- **Cabeçalhos aceitos (case-insensitive):**
  - `Aluno` (Nome completo)
  - `Valor` (Formato monetário brasileiro, ex: `R$ 199,90` ou `199,9`)
  - `Tipo` (Opcional, texto)
  - `Inst.` (UniFecaf, UniFacvest ou FSL)
  - `Vendedor` (Nome do responsável pela venda)
  - `BVS?` (SIM, NÃO ou vazio)
  - `CPF` (Apenas dígitos ou formatado com máscara)
  - `Telefone` (Apenas dígitos ou formatado)
  - `Redirect` (Link do WhatsApp)
  - `Subiu?` (SIM, NÃO ou vazio)
  - `Curso` (Nome oficial do curso acadêmico)
  - `Pagamento` (Pix, Boleto ou Cartão)

### 2.2 Deduplicação e Identidade do Aluno
- Um aluno é identificado de forma única por seu CPF normalizado no sistema.
- Um aluno pode ter múltiplas matrículas ativas em diferentes cursos ou instituições.
- **Chave de Duplicidade no Período:** `CPF normalizado + Curso normalizado + Instituição + Mês de referência`.
- **Tratamento de Duplicidades na Prévia:**
  - Se a matrícula já existir no mesmo período com a mesma chave: Exibir alerta de duplicidade.
  - O usuário poderá escolher:
    1.  *Atualizar:* Sobrescrever os dados do banco com a linha da planilha (com log de auditoria).
    2.  *Ignorar:* Pular a linha duplicada da planilha.
    3.  *Marcar em revisão:* Guardar a linha emstaging para análise posterior.

### 2.3 Controle de BVS (Boas-Vindas) e Subiu (Liberação)
- Ambos os campos aceitam três estados lógicos (`SIM`, `NÃO`, `NÃO INFORMADO`).
- **Regra do Gargalo de Boas-Vindas:**
  Se a matrícula tiver `Subiu? = SIM` e `BVS? = NÃO ou NÃO INFORMADO`, o sistema gera automaticamente uma pendência na fila de Boas-Vindas da equipe de Relacionamento.
- A pendência é removida da fila assim que o colaborador do Relacionamento atualiza `BVS? = SIM` após enviar a mensagem via Redirect de WhatsApp.

### 2.4 Proteção de Alteração e Auditoria
- **Relacionamento:** Permissão ampla de edição de dados operacionais (BVS, Subiu, telefone, etc.) de qualquer matrícula, mas **não** pode alterar o campo `Vendedor` e não altera `Valor` (campo financeiro bloqueado).
- **Gestão / Admin:** Acesso total, incluindo permissão de alteração de `Valor` e `Vendedor`.
- **Trilha de Auditoria:** Qualquer alteração em `Valor` ou `Vendedor` após a importação deve registrar obrigatoriamente no banco: quem alterou, quando, valor anterior, valor novo e justificativa.

---

## 3. Escopo Futuro (Módulos Pós-V1)

Os módulos abaixo estão mapeados para desenvolvimento em ciclos posteriores, conforme tempo e validação gerencial:
- CRM de Leads (Captação e motivos de perda).
- Convênios com empresas parceiras (desempenho comercial corporativo).
- Gestão de Campanhas de Marketing (retorno sobre investimento).
- Planos de Ação estruturados por 5W2H vinculados diretamente aos gargalos de KPIs.
- Exportação avançada de relatórios em PDF.
