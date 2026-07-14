# Skill Availability — CIES Gestão

Controle de disponibilidade de habilidades (skills) e ferramentas MCP integradas ao agente de IA no workspace.

## Catalogo de Habilidades e Plugins Detectados

| Skill Esperada / Preset | Disponibilidade Real | Fallback Escolhido | Observação / Risco |
|---|---|---|---|
| `firebase` | **Disponível** (mcp) | N/A | Plugin do Firebase ativo na sandbox. |
| `google-antigravity-sdk` | **Disponível** (mcp) | N/A | SDK do Google Antigravity ativo. |
| `source-driven-development` | N/A (local) | Documentação oficial online | Usado para validar sintaxes Firebase no Firestore/Auth. |
| `spec-driven-development` | N/A (local) | Planejamento por arquivos locais | Executado via geração de especificações sob demanda. |
| `nextjs-best-practices` | N/A (local) | Next.js DOCS + prompt patterns | Boas práticas de App Router baseadas em documentação oficial atual. |
| `auth-implementation-patterns`| N/A (local) | Firebase Auth DOCS | Padrões de sessão SSR. |
| `ui-a11y` | N/A (local) | `accessibility-compliance-accessibility-audit` ou manual | Validação visual por teclado e leitores. |
| `test-driven-development` | N/A (local) | Vitest local + TDD manual | Escrita de testes locais nos normalizadores e regras. |

## Regra de Utilização do Plugin Firebase
- O plugin Firebase MCP é um assistente de desenvolvimento. Toda chamada ou configuração gerada deve ser cruzada com a documentação oficial atualizada do Firebase para evitar depreciações ou falhas estruturais, especialmente no Next.js App Router e no Admin SDK.
- Não faremos chamadas de gravação ou alteração fora de ambiente emulado local sem aprovação humana.
