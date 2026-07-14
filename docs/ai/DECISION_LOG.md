# Decision Log — CIES Gestão

Este documento registra as decisões de negócio e arquitetura tomadas ao longo do projeto, classificando-as conforme sua estabilidade.

## Decisões Atuais

### D-001: Adoção do Firebase em substituição ao Supabase
- **Data:** 2026-07-13
- **Decisão:** O banco de dados do sistema será o Cloud Firestore (Standard Edition, Native Mode) e a autenticação será feita pelo Firebase Authentication. O Supabase foi desconsiderado.
- **Classificação:** **CONFIRMADO** (Decidido pela Gestão/Eric)
- **Motivo:** Simplificação operacional e alinhamento com a stack desejada pelo Product Owner.
- **Impacto:** Todas as referências técnicas de código e segurança devem usar a API nativa e o Admin SDK do Firebase.

### D-002: Processamento Efêmero de Planilhas
- **Data:** 2026-07-13
- **Decisão:** Por padrão de privacidade (LGPD), o arquivo XLSX/CSV importado não será salvo fisicamente no Cloud Storage de forma permanente. O processamento do arquivo de importação será efêmero, na memória/request de staging do servidor, gravando no Firestore apenas os registros normalizados e o histórico estatístico do lote.
- **Classificação:** **PROPOSTO** (Default técnico para segurança e menor custo de infraestrutura)
- **Motivo:** Evitar vazamento de dados de alunos (PII) e diminuir custos com Cloud Storage.
- **Impacto:** Caso a Gestão exija a retenção dos arquivos brutos, será necessário habilitar o Cloud Storage com regras de acesso rígidas.

### D-003: Chave de Duplicidade HMAC
- **Data:** 2026-07-13
- **Decisão:** A identificação de duplicidades será calculada de forma determinística no servidor através de um hash HMAC-SHA256 composto por: CPF normalizado + Curso normalizado + Instituição + Mês de referência. O segredo do HMAC ficará seguro no Secret Manager (fora do cliente).
- **Classificação:** **CONFIRMADO**
- **Motivo:** Garante que o CPF não seja exposto diretamente em índices públicos do banco e resolve a regra que permite o mesmo aluno ter matrículas distintas em cursos diferentes no mesmo período.

### D-004: Armazenamento Financeiro em Centavos
- **Data:** 2026-07-13
- **Decisão:** Valores monetários de faturamento e vendas serão representados no banco como números inteiros (centavos de Real, ex: `R$ 199,90` -> `19990`). Toda conversão visual em pt-BR será tratada apenas na camada de interface/UX.
- **Classificação:** **CONFIRMADO**
- **Motivo:** Evitar imprecisões matemáticas causadas por arredondamento de pontos flutuantes binários em Javascript/Firestore.
