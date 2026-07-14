# Modelo de Dados do Cloud Firestore — CIES Gestão

Estrutura detalhada de coleções, documentos e tipos a serem implementados no banco Cloud Firestore.

---

## 1. Coleção: `users/{uid}`
Representa a conta individual de acesso de cada colaborador, vinculada ao UID do Firebase Authentication.

*   **Campos:**
    *   `name` (string): Nome completo do colaborador.
    *   `email` (string): E-mail de login corporativo.
    *   `status` (string: `'active' | 'inactive'`): Status da conta no sistema.
    *   `areas` (array de strings): Áreas nas quais o usuário atua (ex: `['gestao', 'relacionamento']`).
    *   `permissions` (map): Permissões detalhadas por feature, ex:
        *   `enrollments` (array de strings): `['read', 'write']`
        *   `imports` (array de strings): `['read']`
    *   `createdAt` (timestamp / serverTimestamp)
    *   `updatedAt` (timestamp / serverTimestamp)

---

## 2. Coleção: `students/{studentId}`
Identidade única do aluno. Evita duplicação de dados cadastrais caso o aluno compre mais de um curso.

*   **Campos:**
    *   `cpfFingerprint` (string): Hash HMAC-SHA256 do CPF normalizado. Usado como identificador para dedup e busca exata.
    *   `maskedCpf` (string): CPF do aluno mascarado para visualização segura (ex: `***.456.***-89`).
    *   `encryptedCpf` (string): CPF original criptografado ou armazenado de forma restrita (se houver permissão).
    *   `name` (string): Nome completo.
    *   `phone` (string): Telefone com DDD.
    *   `createdAt` (timestamp)
    *   `updatedAt` (timestamp)

---

## 3. Coleção: `enrollments/{enrollmentId}`
Cada matrícula individual efetuada. É a principal coleção para relatórios de faturamento e dashboard.

*   **Campos:**
    *   `studentId` (reference / string): Vínculo com a coleção `students`.
    *   `institution` (string: `'UniFecaf' | 'UniFacvest' | 'FSL'`): Faculdade parceira.
    *   `courseOfficialName` (string): Nome oficial do curso retornado pela faculdade.
    *   `courseNormalizedName` (string): Nome normalizado sem acentuação e em caixa alta para deduplicação.
    *   `referenceMonth` (string: formato `YYYY-MM`): Período ao qual o lote pertence.
    *   `amountCents` (number): Valor financeiro da matrícula em centavos inteiros (ex: `19990`).
    *   `paymentMethod` (string: `'Pix' | 'Boleto' | 'Cartao'`): Forma de pagamento.
    *   `type` (string): Opcional, tipo da matrícula.
    *   `sellerName` (string): Nome do vendedor conforme importado na planilha.
    *   `sellerId` (string / null): Vínculo com colaborador cadastrado no sistema (se associado).
    *   `releaseStatus` (string: `'yes' | 'no' | 'unset'`): Indica se a matrícula "Subiu" (liberada).
    *   `welcomeStatus` (string: `'yes' | 'no' | 'unset'`): Indica se as boas-vindas foram dadas (BVS).
    *   `redirectUrl` (string): Atalho do WhatsApp gerado para redirecionamento.
    *   `validityStatus` (string: `'active' | 'invalid' | 'duplicate' | 'cancelled' | 'in_review'`): Situação de auditoria da matrícula.
    *   `dedupFingerprint` (string): Hash determinístico de duplicidade (`HMAC(CPF + Curso + Inst + Mês)`).
    *   `importBatchId` (string): Identificador do lote que inseriu o registro.
    *   `schemaVersion` (number): Versão da estrutura de dados para controle de migrações.
    *   `createdAt` (timestamp)
    *   `updatedAt` (timestamp)
    *   `updatedBy` (string): UID do usuário que efetuou a última edição.

---

## 4. Coleção: `importBatches/{batchId}`
Registra o histórico de planilhas carregadas.

*   **Campos:**
    *   `referenceMonth` (string: `YYYY-MM`): Mês de referência informado.
    *   `fileName` (string): Nome do arquivo higienizado.
    *   `importedBy` (string): UID do usuário responsável pelo upload.
    *   `status` (string: `'processing' | 'completed' | 'failed' | 'reverted'`): Situação do lote.
    *   `totals` (map): Estatísticas de importação:
        *   `rowsRead` (number)
        *   `inserted` (number)
        *   `updated` (number)
        *   `ignored` (number)
        *   `failed` (number)
    *   `createdAt` (timestamp)
    *   `completedAt` (timestamp)

---

## 5. Coleção: `auditLogs/{logId}`
Trilha de auditoria *append-only* (somente escrita) de alterações críticas realizadas por usuários na interface.

*   **Campos:**
    *   `actorId` (string): UID do colaborador que efetuou a ação.
    *   `actorName` (string): Nome do colaborador.
    *   `action` (string: `'EDIT_VALUE' | 'EDIT_SELLER' | 'INVALIDATE_ENROLLMENT' | 'REVERT_BATCH'`): Ação realizada.
    *   `entity` (string: `'enrollments' | 'importBatches'`): Coleção afetada.
    *   `entityId` (string): ID do documento modificado.
    *   `changedFields` (map): Diffs contendo apenas campos alterados de forma não-PII:
        *   `amountCents` (map: `{ old: 19990, new: 15000 }`)
        *   `justification` (string)
    *   `timestamp` (timestamp / serverTimestamp)
