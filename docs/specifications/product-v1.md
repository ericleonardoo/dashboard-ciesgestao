# Product Specification — CIES Gestão v3.0

## 1. Visão Geral
O **CIES Gestão** é um sistema web interno de gestão, CRM comercial (B2C e B2B), controle de matrículas e inteligência operacional para a CIES (polo de ensino superior EAD e semipresencial das instituições UniFecaf, UniFacvest e FSL).

## 2. Personas e Usuários
1. **Elen (Gestão / Stakeholder):** Visão completa de KPIs, faturamento, metas, allowlist de colaboradores, auditoria e redefinição de vendedores/valores.
2. **Eric (Relacionamento & Dev):** Acompanhamento de matrículas, atualização de liberação (`Subiu?`) e boas-vindas (`BVS?`), disparo de WhatsApp.
3. **Nayara (Relacionamento):** Recepção e acompanhamento dos novos alunos.
4. **Bia (Administrativo / Marketing / Comercial):** Importação de planilhas de matrículas, campanhas de captação e suporte a vendas.
5. **Ninha (Consultoria Educacional / Comercial):** Atendimento a leads B2C e captação.
6. **3 Consultores Externos:** Prospecção ativa de pessoas físicas (B2C) e prospecção ativa de empresas para convênios (B2B). Carteira própria isolada.

## 3. Principais Módulos do Sistema
1. **Autenticação & Controle de Acesso:** Login Google exclusivo via Firebase Auth + Allowlist server-side em `accessAllowlist` + RBAC por área e ação.
2. **CRM B2C (Leads Direct Sales):** Funil de atendimento a alunos (Novo -> Contato -> Atendimento -> Qualificado -> Proposta -> Negociação -> Matriculado / Perdido).
3. **CRM B2B (Empresas & Convênios):** Funil de empresas (Prospectada -> Contatada -> Decisor -> Reunião -> Proposta -> Parceria Ativa).
4. **Parcerias & Convênios:** Painel de parcerias com desconto/benefício, contagem de leads/matrículas e faturamento atrelado.
5. **Atividades Comerciais:** Linha do tempo unificada com registros automáticos (mudanças de status) e entradas manuais.
6. **Metas & KPIs:** Definição de metas por escopo (Geral, Equipe, Consultor, Instituição) e cálculo automático de realizado.
7. **Matrículas & Importação:** Parser de planilhas `.xlsx`, tri-state (`SIM`, `NÃO`, `NÃO INFORMADO`), deduplicação HMAC (`CPF + Curso + Inst + Mês`), prévia em staging.
8. **Relacionamento & Boas-Vindas:** Fila automática de pendências quando `Subiu = SIM` e `BVS != SIM`, atalho direto para WhatsApp.
9. **Dashboards Executivo & Analíticos:** Resumo executivo em tempo real, funis visualizáveis, gráficos de tendência e reconciliação com tabelas operacionais.
10. **Auditoria & Segurança:** Trilha de auditoria append-only para ações sensíveis, proteção de PII e máscaras de CPF.
