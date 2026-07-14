# Visão Geral da Arquitetura do Sistema — CIES Gestão

Este documento apresenta a arquitetura macro, o fluxo de dados e os papéis técnicos no sistema CIES Gestão.

---

## 1. Fluxo de Dados da Importação de Planilhas

A importação é efêmera e atômica, passando pelas seguintes camadas técnicas:

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Bia (Administrativo)
    participant Client as Frontend Next.js (Client)
    participant Server as Route Handler Next.js (Server)
    participant DB as Cloud Firestore

    Admin->>Client: Seleciona .xlsx + Mês de referência
    Client->>Server: Envia arquivo (FormData / Buffer)
    Note over Server: Valida MIME & Extensão
    Note over Server: Processa buffer via exceljs/xlsx
    Note over Server: Normaliza CPF, Moeda e Textos
    Note over Server: Compara CPF/Curso com banco (HMAC)
    Server-->>Client: Retorna Prévia + Inconsistências (Staging JSON)
    Admin->>Client: Clica em "Confirmar Importação" (decide duplicados)
    Client->>Server: Envia payload de confirmação
    Note over Server: Inicia transação atômica
    Server->>DB: Salva alunos na coleção /students/
    Server->>DB: Salva matrículas na coleção /enrollments/
    Server->>DB: Registra lote na coleção /importBatches/
    Server->>DB: Grava auditoria na coleção /auditLogs/
    Note over Server: Recalcula KPIs agregados
    Server-->>Client: Retorna sucesso de importação
    Client-->>Admin: Exibe Dashboard Atualizado
```

---

## 2. Fluxo da Regra Automática de Boas-Vindas

O Relacionamento acompanha o gargalo de atendimento de pós-venda utilizando o status derivado:

```mermaid
graph TD
    A[Matrícula Importada / Editada] --> B{Subiu? = SIM}
    B -- Não --> C[Não exibe na fila de pendências]
    B -- Sim --> D{BVS? = SIM}
    D -- Sim --> E[Não exibe na fila - Boas-vindas já dadas]
    D -- Não / Vazio --> F[Aparece automaticamente em 'Boas-Vindas Pendentes']
    F --> G[Colaboradora Nayara clica em 'Redirect']
    G --> H[WhatsApp Web abre com número do aluno]
    H --> I[Nayara marca BVS = SIM no sistema]
    I --> D
```

---

## 3. Estrutura Modular da Aplicação
- **`src/app/`**: Roteamento físico (App Router). Contém as layouts, páginas de login e dashboard e endpoints de API.
- **`src/features/`**: Divisão lógica por recursos. Cada feature possui seus componentes específicos, hooks e queries para não misturar domínios de negócio.
- **`src/lib/`**: Utilitários puros reutilizáveis e integradores de SDKs (Firebase client, Firebase admin, formatação financeira, datas e criptografia HMAC de CPF).
- **`src/server/`**: Lógica que roda exclusivamente no servidor, incluindo repositórios de acesso ao Firestore, Server Actions e middleware de autorização de sessão.
