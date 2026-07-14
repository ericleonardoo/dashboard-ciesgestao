# CIES Gestão — Hyper Prompt Pack (Firebase Edition)

Este pacote transforma o contexto do projeto em um pipeline executável para o Google Antigravity.

## Conteúdo

```text
AGENTS.md
CONTEXT.md
HYPER_PROMPT.md
.agents/
├── rules/
│   └── cies-project.md
└── workflows/
    ├── cies-bootstrap.md
    ├── cies-build.md
    ├── cies-feature.md
    ├── cies-firebase-audit.md
    ├── cies-release-candidate.md
    ├── cies-resume.md
    ├── cies-review.md
    └── cies-sync-context.md
docs/ai/
├── SKILL_BUNDLE_CIES.md
└── FIREBASE_ARCHITECTURE_BASELINE.md
scripts/
└── verify-antigravity-pack.ps1
```


## Substituição da edição anterior

Substitua em conjunto `AGENTS.md`, `CONTEXT.md`, `HYPER_PROMPT.md`, os workflows e o Skill Bundle. Não copie apenas o Hyper Prompt, porque a edição anterior continha decisões de arquitetura incompatíveis com Firebase.

## Instalação no repositório

Copie o conteúdo do pacote para a raiz do repositório CIES, preservando as pastas ocultas.

No PowerShell:

```powershell
Copy-Item -Path ".\CIES_HYPER_PROMPT_PACK\*" -Destination ".\cies-gestao" -Recurse -Force
Copy-Item -Path ".\CIES_HYPER_PROMPT_PACK\.agents" -Destination ".\cies-gestao" -Recurse -Force
```

Ou extraia o ZIP diretamente na raiz.

## Verificação

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\verify-antigravity-pack.ps1
```

## Ordem recomendada

### Primeira execução controlada

```text
/cies-bootstrap
```

Use para gerar especificação, ADRs, arquitetura e fundação técnica.

### Construção completa em uma execução

```text
/cies-build
```

Esse é o comando que dá vida ao HYPER_PROMPT. O pipeline continua entre fases e só para em gates humanos obrigatórios.

### Retomar depois de quota, pausa ou troca de computador

```text
/cies-resume
```

### Implementar uma funcionalidade após a primeira versão

```text
/cies-feature nome da funcionalidade
```

### Revisar a branch

```text
/cies-review
```

### Preparar release candidate

```text
/cies-release-candidate
```

## Skills

Leia `docs/ai/SKILL_BUNDLE_CIES.md`.

Antes da primeira execução, abra o Antigravity e confirme especialmente `/firebase` e `/source-driven-development`. O agente deve registrar os nomes reais em `docs/ai/SKILL_AVAILABILITY.md`.

## Segurança

O pipeline não está autorizado a:

- fazer deploy;
- fazer push ou merge;
- usar dados reais;
- apagar dados, alterar Rules/índices/Auth/IAM ou executar backfill destrutivo fora do Emulator Suite;
- expor secrets;
- alterar regras confirmadas silenciosamente.

## Git

Commit sugerido após copiar e revisar:

```bash
git checkout -b chore/antigravity-hyper-prompt
git add AGENTS.md CONTEXT.md HYPER_PROMPT.md .agents docs/ai/SKILL_BUNDLE_CIES.md scripts/verify-antigravity-pack.ps1 README_HYPER_PROMPT.md
git commit -m "chore: configure CIES Antigravity development pipeline"
```

Faça o push somente após revisão humana.

## Firebase

O pacote foi reconstruído para Firebase Authentication + Cloud Firestore. Execute `/cies-firebase-audit` antes de qualquer release candidate.
