# DATA_DICTIONARY.md — CIES Gestão v3.0

> Dicionário de dados completo das coleções Firestore e schemas do CIES Gestão.

## Coleções Firestore (Top-Level)

### 1. `accessAllowlist`
Coleção de permissões prévias gerenciada exclusivamente pela Gestão/Admin via Server SDK.
- `id` (string): ID hash/fingerprint ou autogerado
- `emailNormalized` (string): e-mail em minúsculas
- `emailHash` (string): HMAC hash do e-mail para buscas indexadas seguras
- `name` (string): nome do colaborador
- `status` (string): `'ACTIVE' | 'INACTIVE'`
- `roles` (string[]): áreas (`'GESTATION' | 'RELATIONSHIP' | 'ADMINISTRATIVE' | 'COMMERCIAL' | 'MARKETING' | 'EXTERNAL_CONSULTANT'`)
- `permissions` (string[]): array granular de permissões
- `grantedBy` (string): UID do admin que concedeu
- `createdAt` (timestamp): data de criação
- `updatedAt` (timestamp): data de última atualização

### 2. `users`
Perfil de usuário vinculado à autenticação do Firebase.
- `id` (string): UID do Firebase Auth
- `email` (string): e-mail do colaborador
- `name` (string): nome completo
- `photoURL` (string, opcional): foto do perfil Google
- `status` (string): `'ACTIVE' | 'INACTIVE'`
- `roles` (string[]): cópia de segurança das áreas do colaborador
- `permissions` (string[]): permissões ativas
- `lastLoginAt` (timestamp): último acesso registrado
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### 3. `leads` (B2C)
Leads e oportunidades B2C.
- `id` (string): autogerado
- `name` (string): nome do lead
- `phone` (string): telefone formatado
- `phoneNormalized` (string): apenas dígitos para busca/duplicidade
- `city` (string): cidade de residência
- `courseInterest` (string): curso de interesse
- `modality` (string): `'EAD' | 'SEMIPRESENCIAL'`
- `institutionInterest` (string): `'UniFecaf' | 'UniFacvest' | 'FSL'`
- `source` (string): origem do lead (Instagram, WhatsApp, Indicação, etc.)
- `ownerId` (string): UID do consultor responsável
- `status` (string): `'NEW' | 'FIRST_CONTACT' | 'IN_SERVICE' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'NEGOTIATION' | 'FOLLOW_UP' | 'ENROLLED' | 'LOST' | 'NO_RESPONSE'`
- `lastContactAt` (timestamp, opcional)
- `nextContactAt` (timestamp, opcional)
- `potentialAmountCents` (number, opcional): em centavos inteiros
- `lossReason` (string, opcional): obrigatório se `status === 'LOST'`
- `partnershipId` (string, opcional): vínculo com convênio B2B
- `campaignId` (string, opcional): vínculo com campanha de Mkt
- `convertedEnrollmentId` (string, opcional): ID da matrícula gerada ao converter
- `createdAt` (timestamp)
- `createdBy` (string): UID
- `updatedAt` (timestamp)
- `updatedBy` (string): UID

### 4. `companies` (B2B)
Empresas prospectadas para convênio.
- `id` (string): autogerado
- `name` (string): nome de fantasia/razão social
- `cnpjNormalized` (string, opcional): apenas dígitos
- `cnpjFingerprint` (string, opcional): HMAC do CNPJ para duplicidade
- `segment` (string): ramo de atuação
- `city` (string)
- `employeeCountEstimate` (number, opcional)
- `source` (string): origem da prospecção
- `ownerId` (string): UID do consultor responsável
- `status` (string): `'PROSPECTED' | 'CONTACTED' | 'DECISION_MAKER_IDENTIFIED' | 'MEETING_SCHEDULED' | 'MEETING_HELD' | 'PROPOSAL_SENT' | 'NEGOTIATION' | 'PARTNERSHIP_APPROVED' | 'PARTNERSHIP_ACTIVE' | 'NO_INTEREST'`
- `lastContactAt` (timestamp, opcional)
- `nextStep` (string): próximo passo obrigatório se aberta
- `nextStepAt` (timestamp, opcional)
- `createdAt` (timestamp)
- `createdBy` (string)
- `updatedAt` (timestamp)
- `updatedBy` (string)

### 5. `companyContacts` (Subcoleção ou Coleção Top-Level)
Contatos nas empresas.
- `id` (string)
- `companyId` (string): ID da empresa
- `name` (string)
- `role` (string): cargo
- `phone` (string)
- `email` (string)
- `isDecisionMaker` (boolean): indica se é o tomador de decisão
- `active` (boolean)

### 6. `partnerships`
Convênios e parcerias aprovadas/ativas.
- `id` (string)
- `companyId` (string)
- `ownerId` (string): consultor responsável
- `status` (string): `'IN_PROSPECTION' | 'IN_NEGOTIATION' | 'APPROVED' | 'ACTIVE' | 'INACTIVE'`
- `benefitType` (string): desconto/benefício oferecido
- `startDate` (timestamp, opcional)
- `endDate` (timestamp, opcional)
- `leadCount` (number): acumulado
- `enrollmentCount` (number): acumulado
- `revenueCents` (number): acumulado em centavos
- `lastActionAt` (timestamp, opcional)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### 7. `salesActivities`
Linha do tempo de atividades comerciais.
- `id` (string)
- `actorId` (string): UID de quem realizou
- `type` (string): `'CALL' | 'WHATSAPP' | 'NEW_CONTACT' | 'FOLLOW_UP' | 'VISIT' | 'PROSPECTION' | 'MEETING' | 'PROPOSAL' | 'ENROLLMENT'`
- `entityType` (string): `'LEAD' | 'COMPANY' | 'PARTNERSHIP' | 'ENROLLMENT'`
- `entityId` (string): ID da entidade relacionada
- `occurredAt` (timestamp)
- `outcome` (string, opcional)
- `nextStep` (string, opcional)
- `notes` (string, opcional)
- `source` (string): `'AUTO' | 'MANUAL'`
- `createdAt` (timestamp)

### 8. `goals`
Metas comerciais e operacionais.
- `id` (string)
- `periodType` (string): `'MONTHLY' | 'QUARTERLY' | 'ANNUAL'`
- `periodStart` (string): `'YYYY-MM'`
- `periodEnd` (string): `'YYYY-MM'`
- `metric` (string): `'LEADS' | 'CONTACTS' | 'MEETINGS' | 'PROPOSALS' | 'PARTNERSHIPS' | 'ENROLLMENTS' | 'REVENUE'`
- `scopeType` (string): `'COMPANY' | 'TEAM' | 'CONSULTANT' | 'INSTITUTION' | 'COURSE'`
- `scopeId` (string, opcional): UID do consultor ou nome da instituição se aplicável
- `targetValue` (number)
- `unit` (string): `'COUNT' | 'CURRENCY_CENTS'`
- `status` (string): `'ACTIVE' | 'CLOSED'`
- `createdBy` (string)
- `createdAt` (timestamp)

### 9. `enrollments`
Matrículas registradas/importadas.
- `id` (string)
- `studentName` (string)
- `cpfNormalized` (string): apenas números
- `cpfFingerprint` (string): HMAC do CPF
- `phone` (string)
- `phoneNormalized` (string)
- `course` (string)
- `institution` (string): `'UniFecaf' | 'UniFacvest' | 'FSL'`
- `sellerName` (string): Vendedor
- `sellerId` (string, opcional): ID do usuário vendedor se mapeado
- `amountCents` (number): Valor da matrícula em centavos
- `type` (string, opcional)
- `paymentMethod` (string)
- `releaseStatus` (string): `'YES' | 'NO' | 'UNKNOWN'` (Subiu?)
- `welcomeStatus` (string): `'YES' | 'NO' | 'UNKNOWN'` (BVS?)
- `redirectUrl` (string, opcional)
- `referenceMonth` (string): `'YYYY-MM'`
- `importBatchId` (string, opcional)
- `duplicateFingerprint` (string): HMAC(`cpfNormalized` + `course` + `institution` + `referenceMonth`)
- `isDuplicate` (boolean)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### 10. `importBatches`
Histórico de importações da planilha.
- `id` (string)
- `referenceMonth` (string): `'YYYY-MM'`
- `fileName` (string)
- `importedBy` (string): UID
- `totalRows` (number)
- `validRows` (number)
- `duplicateRows` (number)
- `errorRows` (number)
- `status` (string): `'STAGING' | 'CONFIRMED' | 'REVERTED'`
- `createdAt` (timestamp)

### 11. `auditLogs`
Trilha de auditoria append-only para ações sensíveis.
- `id` (string)
- `actorId` (string): UID
- `actorEmail` (string)
- `action` (string): ex: `'LOGIN_BLOCKED'`, `'CHANGE_SELLER'`, `'CHANGE_AMOUNT'`, `'IMPORT_EXECUTE'`, `'IMPORT_ROLLBACK'`, `'PERMISSION_GRANT'`
- `entityType` (string)
- `entityId` (string)
- `changedFields` (object, opcional)
- `reason` (string, opcional)
- `timestamp` (timestamp)
