# Permissions Matrix — CIES Gestão v3.0

> Matriz completa de Controle de Acesso Baseado em Permissões (RBAC) e por Ação.

## 1. Definição de Permissões Granulares

```ts
export type Permission =
  | "dashboard.view"
  | "leads.view"
  | "leads.create"
  | "leads.edit"
  | "leads.assign"
  | "companies.view"
  | "companies.create"
  | "companies.edit"
  | "partnerships.manage"
  | "activities.create"
  | "activities.view_team"
  | "goals.manage"
  | "enrollments.view"
  | "enrollments.edit"
  | "enrollments.change_seller"
  | "enrollments.change_amount"
  | "imports.execute"
  | "imports.rollback"
  | "users.manage"
  | "reports.export";
```

## 2. Mapeamento de Permissões por Papel / Área

| Área / Perfil | Permissões Concedidas por Padrão | Restrições e Limitações |
|---|---|---|
| **Gestão (Admin)** | `*` (Todas as permissões) | Nenhuma. Acesso total e auditoria de ações de terceiros. |
| **Relacionamento** | `dashboard.view`, `enrollments.view`, `enrollments.edit`, `activities.create`, `reports.export` | **Não altera Vendedor** (`enrollments.change_seller`) nem **Valor** (`enrollments.change_amount`). |
| **Administrativo** | `dashboard.view`, `enrollments.view`, `enrollments.edit`, `imports.execute`, `imports.rollback` | Pode alterar Vendedor apenas com permissão explícita concedida pela Gestão. |
| **Comercial Interno** | `dashboard.view`, `leads.view`, `leads.create`, `leads.edit`, `companies.view`, `companies.create`, `companies.edit`, `activities.create`, `activities.view_team`, `goals.manage` | Vê oportunidades de equipe conforme liberação. Não altera allowlist ou matrículas brutas. |
| **Consultor Externo** | `dashboard.view`, `leads.view`, `leads.create`, `leads.edit`, `companies.view`, `companies.create`, `companies.edit`, `activities.create` | **Isolamento de Carteira:** Vê e edita apenas leads/empresas atribuídos a ele (`ownerId === uid`). Sem acesso a importações, alteração de permissões ou alteração de vendedor. |
| **Marketing** | `dashboard.view`, `leads.view`, `reports.export` | Acesso agregador a origens de leads e campanhas. Sem edição direta de matrículas. |

## 3. Autorização Server-Side Oblíqua
Toda ação de leitura/mutação de servidor deve executar:
1. `requireSession()` — Valida o cookie `HttpOnly`.
2. `requireActiveUser()` — Verifica se o usuário está ativo no Firestore e em `accessAllowlist`.
3. `requirePermission(permission)` ou `requireOwnershipOrPermission(resourceOwnerId, permission)` — Valida os privilégios do chamador.
