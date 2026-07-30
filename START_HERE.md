# CIES Gestão — Início rápido

## Arquivos

- `AGENTS.md`: regras permanentes de trabalho.
- `CONTEXT.md`: produto, regras, módulos, dados e decisões.
- `HYPER_PROMPT.md`: execução completa para o Google Antigravity.

## Como usar

1. Coloque os três arquivos na raiz do repositório.
2. Abra a pasta do projeto no Google Antigravity.
3. Inicie uma branch:
   ```bash
   git switch main
   git pull --ff-only
   git switch -c chore/cies-v3-bootstrap
   ```
4. Envie ao agente:

   ```text
   Leia integralmente AGENTS.md, CONTEXT.md e HYPER_PROMPT.md. Execute o HYPER_PROMPT.md em modo autônomo controlado, começando pela Fase 0. Não faça deploy, push, merge, alterações destrutivas ou uso de dados reais sem autorização explícita. Implemente, teste, corrija e documente cada fase.
   ```

## Decisões novas desta versão

- login Google;
- allowlist interna;
- três consultores externos;
- funil B2C;
- funil B2B;
- empresas;
- contatos decisores;
- parcerias;
- atividades;
- metas;
- dashboard comercial integrado às matrículas;
- Vercel como hospedagem-alvo.
