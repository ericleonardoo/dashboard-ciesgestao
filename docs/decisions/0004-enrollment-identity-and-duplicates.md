# ADR 0004: Identidade de Matrícula, Proteção de CPF e Deduplicação

- **Status:** **CONFIRMADO**
- **Data:** 2026-07-13
- **Autor:** @data-import / @security

## Contexto
Diferente de sistemas acadêmicos tradicionais, na CIES um mesmo CPF (aluno) pode realizar múltiplas matrículas legítimas em cursos ou instituições parceiras diferentes em um mesmo mês. No entanto, linhas duplicadas exatamente iguais da mesma planilha não podem ser importadas de forma redundante.

## Decisão
Implementaremos um fluxo determinístico de validação de identidade e deduplicação no servidor.

1.  **Identidade Separada (Aluno x Matrícula):**
    - Um aluno é uma entidade com um documento na coleção `/students/` (identificado por um `studentId` aleatório seguro). Seu CPF normalizado é guardado de forma mascarada ou restrita.
    - Cada matrícula é um documento independente na coleção `/enrollments/` contendo uma referência `studentId` e metadados como curso e faculdade.
2.  **Proteção de CPF no Banco:** O CPF do aluno nunca será usado como ID do documento ou em URLs públicas. Utilizaremos uma fingerprint de CPF gerada no servidor via hash SHA-256 com sal/secret privado (`cpfFingerprint`) para buscas exatas e deduplicação, impedindo engenharia reversa do CPF de forma fácil.
3.  **Fingerprint de Duplicidade:** O cálculo de duplicidade de matrícula no período considerará: `CPF normalizado + Curso normalizado + Instituição + Mês de referência`.
4.  **Criação da Chave de Duplicidade:** Geraremos um hash `dedupFingerprint` a partir dessa composição. Se o hash já existir na base de dados para o mesmo período (`referenceMonth`), a matrícula é enviada para a fila de inconsistências da prévia da importação.

## Consequências
- **Positivas:**
  - Conformidade com a LGPD, mantendo o CPF original em campos restritos/mascarados.
  - Elimina a inserção acidental de registros duplicados idênticos.
  - Permite a mesma pessoa se matricular em dois cursos diferentes no mesmo mês de forma legítima.
- **Negativas / Riscos:**
  - A normalização do nome do curso deve ser tratada com cuidado. Variações como *"Administração"* e *"Administração - EAD"* serão consideradas cursos diferentes. Mitigaremos mantendo o nome do curso normalizado (sem acentos, maiúsculo, sem caracteres especiais) para a chave de comparação, mas salvando o texto oficial original importado.
