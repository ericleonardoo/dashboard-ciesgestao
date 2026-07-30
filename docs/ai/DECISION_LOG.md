# Decision Log — CIES Gestão v3.0

## Registro de Decisões Técnicas e de Produto

| Data | Decisão | Classificação | Motivo | Impacto | Fonte | Reversibilidade |
|---|---|---|---|---|---|---|
| 2026-07-29 | **Autenticação via Google Sign-In com Allowlist Sever-Side Restrita** | **CONFIRMADO** | Segurança operacional e simplificação do acesso individual dos colaboradores sem cadastro público. | Apenas contas previamente liberadas pela Gestão em `accessAllowlist` poderão autenticar e criar sessão HTTP-Only. | `CONTEXT.md` Sec. 9 | Reversível via configuração de regras de acesso |
| 2026-07-29 | **Modelo Comercial Híbrido: Funil B2C + Funil B2B com Contatos Decisores e Convênios** | **CONFIRMADO** | Atender a rotina de vendas diretas a alunos e prospecção ativa de empresas parceiras. | Criação das coleções `leads`, `companies`, `companyContacts` e `partnerships` no Firestore. | `CONTEXT.md` Sec. 16-18 | Reversível em camadas de pipeline |
| 2026-07-29 | **Trabalho por Fatias Verticais Completa em Branch `chore/project-bootstrap`** | **CONFIRMADO** | Garantir estabilidade da branch `main` e validação ponta a ponta com testes e documentação. | Desenvolvimento isolado por branches por funcionalidade. | `AGENTS.md` Sec. 8 | Reversível via Git |
| 2026-07-29 | **Armazenamento Monetário Estrito em Centavos Inteiros (`amountCents`)** | **CONFIRMADO** | Evitar erros de arredondamento causados por ponto flutuante binário. | Todos os campos e cálculos de valores financeiros serão inteiros formatados em pt-BR no cliente. | `AGENTS.md` Sec. 4, `CONTEXT.md` Sec. 15 | Irreversível após banco populado |
