# Matriz de Permissões (RBAC) — CIES Gestão

A tabela abaixo define os níveis de acesso (Leitura, Edição, Ações Críticas) para cada área interna da CIES sobre os recursos do sistema.

## Matriz de Acesso

| Módulo / Recurso | Ação | Gestão | Relacionamento | Administrativo | Comercial | Marketing |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **Dashboard Geral** | Visualizar KPIs e Semáforo | **Sim** | **Sim** | **Sim** | **Sim** | **Sim** |
| | Editar Metas | **Sim** | Não | Não | **Sim** | Não |
| **Matrículas** | Visualizar lista/filtros | **Sim** | **Sim** | **Sim** | **Sim** | **Sim** |
| | Editar dados operacionais (BVS/Subiu) | **Sim** | **Sim** | **Sim** | Não | Não |
| | Editar campo Vendedor | **Sim** | Não | **Sim** (1) | Não | Não |
| | Editar campo Valor (protegido) | **Sim** | Não | Não | Não | Não |
| | Marcar como inválida/duplicada/restaurar | **Sim** | Não | **Sim** (2) | Não | Não |
| **Importações** | Upload de planilha | **Sim** | Não | **Sim** | Não | Não |
| | Confirmar lote (revisão prévia) | **Sim** | Não | **Sim** | Não | Não |
| | Reverter lote de importação (destrutiva) | **Sim** | Não | Não | Não | Não |
| **Colaboradores** | Criar/Editar usuários do sistema | **Sim** | Não | Não | Não | Não |
| | Atribuir/Alterar permissões | **Sim** | Não | Não | Não | Não |
| **Leads** | Criar/Editar leads | **Sim** | Não | Não | **Sim** | **Sim** |
| **Convênios** | Criar/Editar convênios | **Sim** | Não | Não | **Sim** | Não |
| **Campanhas** | Criar/Editar campanhas | **Sim** | Não | Não | Não | **Sim** |
| **Planos 5W2H** | Criar/Editar planos | **Sim** | **Sim** | **Sim** | **Sim** | **Sim** |
| **Auditoria** | Visualizar logs de alteração | **Sim** | Não | Não | Não | Não |

### Notas de Regra de Negócio:
- **(1) Vendedor:** O setor Administrativo pode alterar o vendedor da matrícula se houver inconsistência de nome (alias) durante a importação.
- **(2) Alterações estruturais:** Marcar uma matrícula como inválida remove-a do cálculo de faturamento válido. Exige auditoria.
- **Negar por Padrão:** Qualquer rota, action ou endpoint que não esteja explicitamente mapeado nesta matriz deve negar o acesso.
