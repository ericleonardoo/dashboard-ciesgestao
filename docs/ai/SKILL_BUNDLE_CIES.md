# Skill Bundle CIES — Firebase Edition

> Curadoria para o catálogo `agentic-awesome-skills` e para as skills instaladas no workspace.
> Bundles são referências de seleção. O Antigravity deve invocar skills individuais pelo nome exato realmente disponível.

## 1. Regra principal

- Não carregar todas as skills de uma vez.
- Usar de 3 a 5 skills por subetapa.
- Verificar `/skills` antes da primeira execução.
- Registrar nomes reais, fonte, risco e fallback em `docs/ai/SKILL_AVAILABILITY.md`.
- Preferir documentação oficial do Firebase como fonte de verdade para APIs e segurança.
- A skill comunitária `/firebase` acelera o trabalho, mas não substitui documentação oficial atual.
- Não utilizar skills ofensivas, bloqueadas ou críticas sem autorização.
- Instalar e ativar somente skills compatíveis com a arquitetura Firebase/Firestore escolhida.

## 2. Bundles de referência do catálogo

A curadoria combina partes de:

- Essentials;
- Web Wizard;
- Full-Stack Developer;
- TypeScript & JavaScript;
- Business Analyst;
- Security Developer;
- QA & Testing;
- DevOps & Cloud;
- AAS Web App Builder;
- AAS Secure App Builder;
- AAS QA & Test Automation.

Não existe comando `/cies-bundle`. Use skills individuais.

## 3. Tier 0 — Orquestração e contexto

| Skill | Uso | Prioridade |
|---|---|---:|
| `planning-with-files` | memória persistente | obrigatória |
| `spec-driven-development` | especificar antes de construir | obrigatória |
| `source-driven-development` | confirmar decisões em docs oficiais | obrigatória |
| `planning-and-task-breakdown` | decompor o escopo | obrigatória |
| `subagent-orchestrator` | coordenar subagentes com fronteiras | alta |
| `subagent-driven-development` | paralelizar tarefas independentes | alta |
| `verification-before-completion` | impedir conclusão sem evidência | obrigatória |
| `acceptance-orchestrator` | aceitação ponta a ponta | release |

## 4. Tier 1 — Produto e gestão

| Skill | Uso |
|---|---|
| `business-analyst` | requisitos, processos, KPIs e trade-offs |
| `product-manager-toolkit` | PRD e priorização, se disponível |
| `kpi-dashboard-design` | dashboards orientados a decisão |
| `concise-planning` | planos locais objetivos |

## 5. Tier 1 — Web e design system

| Skill | Uso |
|---|---|
| `nextjs-best-practices` | práticas atuais do App Router |
| `nextjs-app-router-patterns` | estrutura full-stack |
| `react-best-practices` | performance/manutenção React |
| `shadcn` | componentes e design system |
| `tailwind-patterns` | padrões Tailwind |
| `ui-a11y` | acessibilidade |
| `accessibility-compliance-accessibility-audit` | fallback de auditoria |
| `ui-review` | revisão visual final |

## 6. Tier 1 — Firebase, Firestore e autenticação

| Skill | Uso | Observação |
|---|---|---|
| `firebase` | Auth, Firestore, Storage, Functions, Hosting e Rules | skill principal do catálogo |
| `source-driven-development` | validar tudo em docs oficiais atuais | obrigatória junto de `/firebase` |
| `auth-implementation-patterns` | sessão, cookies, revogação e RBAC | segurança |
| `api-security-best-practices` | endpoints/session/importação | segurança |
| `backend-security-coder` | revisão do Admin SDK e autorização | segurança |
| `cloud-architect` | App Hosting, IAM, ambientes, custos | opcional |
| `data-quality-frameworks` | contrato e validação da planilha | importação |

Não use `nosql-expert` como autoridade sobre Firestore: a descrição do catálogo é voltada principalmente a Cassandra/DynamoDB. Use `/firebase` + documentação oficial.

## 7. Tier 1 — Segurança defensiva

| Skill | Uso |
|---|---|
| `api-security-best-practices` | sessão, validação, rate limit |
| `backend-security-coder` | Admin SDK, cookies, autorização |
| `frontend-security-coder` | XSS, exposição de dados e cliente |
| `cc-skill-security-review` | revisão por feature |
| `dependency-management-deps-audit` | dependências, se disponível |

Não usar skills de pentest ofensivo no desenvolvimento normal.

## 8. Tier 1 — Testes e qualidade

| Skill | Uso |
|---|---|
| `test-driven-development` | regras críticas |
| `e2e-testing-patterns` | Playwright e jornadas |
| `systematic-debugging` | causa raiz |
| `lint-and-validate` | gates locais |
| `code-review-checklist` | revisão de PR |
| `test-fixing` | correção sistemática |
| `screen-reader-testing` | acessibilidade avançada |

Independentemente das skills, o projeto deve usar Firebase Local Emulator Suite e `@firebase/rules-unit-testing` para Security Rules.

## 9. Tier 1 — GitHub e entrega

| Skill | Uso |
|---|---|
| `git-workflow-and-versioning` | branches e commits |
| `github` | operações GitHub |
| `github-actions-advanced` | CI com emuladores |
| `environment-setup-guide` | setup reproduzível |
| `deployment-procedures` | plano de release, sem deploy automático |
| `address-github-comments` | revisão de PR |

## 10. Presets de ativação

### Descoberta

```text
/spec-driven-development
/source-driven-development
/planning-and-task-breakdown
/planning-with-files
/business-analyst
```

### Arquitetura Firebase

```text
/source-driven-development
/firebase
/nextjs-best-practices
/auth-implementation-patterns
/cloud-architect
```

### Interface

```text
/shadcn
/react-best-practices
/nextjs-app-router-patterns
/tailwind-patterns
/ui-a11y
```

### Importação

```text
/source-driven-development
/firebase
/data-quality-frameworks
/test-driven-development
/systematic-debugging
```

### Autenticação e permissões

```text
/source-driven-development
/firebase
/auth-implementation-patterns
/api-security-best-practices
/backend-security-coder
```

### Segurança

```text
/firebase
/api-security-best-practices
/backend-security-coder
/frontend-security-coder
/cc-skill-security-review
```

### QA

```text
/test-driven-development
/e2e-testing-patterns
/systematic-debugging
/lint-and-validate
/verification-before-completion
```

### Release candidate

```text
/acceptance-orchestrator
/verification-before-completion
/code-review-checklist
/github-actions-advanced
/deployment-procedures
```

## 11. Fallbacks

- `firebase` ausente → `/source-driven-development` + documentação oficial do Firebase + instruções do HYPER_PROMPT.
- `ui-a11y` ausente → `accessibility-compliance-accessibility-audit`.
- `product-manager-toolkit` ausente → `business-analyst` + `spec-driven-development`.
- `data-quality-frameworks` ausente → contrato da planilha no HYPER_PROMPT + TDD.
- `dependency-management-deps-audit` ausente → auditoria do package manager + revisão manual.
- `acceptance-orchestrator` ausente → `/cies-release-candidate` + `verification-before-completion`.

Nunca substituir uma skill ausente por tecnologia incompatível. Nunca inventar nome de skill.
