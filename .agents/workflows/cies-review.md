---
description: Realiza revisão técnica, de negócio, segurança, UX e testes do estado atual do CIES Gestão
---

# /cies-review

Faça uma revisão adversarial e baseada em evidências do código atual.

## Escopo

1. Leia contexto, especificações, ADRs, critérios de aceitação e diff da branch.
2. Verifique primeiro as regras críticas:
   - CPF não é matrícula única;
   - duplicidade por CPF + curso + instituição + mês;
   - tri-state de BVS/Subiu;
   - pendência automática de BVS;
   - Vendedor protegido;
   - Valor protegido;
   - faturamento total separado do válido;
   - Firebase Security Rules e autorização explícita em chamadas Admin SDK;
   - ausência de PII em logs/fixtures.
3. Revise arquitetura, Firestore, Rules, índices, custo de leituras/escritas, queries, performance, acessibilidade e UX.
4. Execute lint, typecheck, testes, build e E2E disponíveis.
5. Use, quando disponíveis e em subetapas:
   - `/code-review-checklist`
   - `/cc-skill-security-review`
   - `/systematic-debugging`
   - `/lint-and-validate`
   - `/verification-before-completion`
6. Corrija automaticamente problemas seguros e locais.
7. Não faça refatoração ampla não relacionada sem registrar e justificar.

## Saída

Crie `docs/reviews/review-<data-ou-branch>.md` com achados por severidade, evidências, correções e riscos restantes. Atualize o estado persistente.
