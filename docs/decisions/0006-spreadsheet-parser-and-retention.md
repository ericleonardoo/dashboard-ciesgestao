# ADR 0006: Biblioteca de Parser de Planilhas e Política de Privacidade (PII)

- **Status:** **PROPOSTO**
- **Data:** 2026-07-13
- **Autor:** @data-import / @security

## Contexto
O processo de importação de planilhas lida diretamente com dados pessoais de alunos (Nome, CPF, Telefone). O processamento indevido de planilhas pode gerar vazamentos ou expor PII (Personally Identifiable Information) em arquivos de log de aplicação. A escolha da biblioteca de parser também deve ser segura e livre de vulnerabilidades de injeção de fórmulas.

## Decisão
Implementaremos processamento efêmero no servidor com biblioteca estável e segura de leitura.

1.  **Escolha do Parser:** Adotaremos a biblioteca **`xlsx` (SheetJS)** ou **`exceljs`** de maneira estritamente servidora (`server-only`). Nenhuma biblioteca de planilhas fará parte do bundle do cliente.
2.  **Prevenção contra injeção de fórmulas:** O parser lerá apenas o valor cru textualmente resolvido das células (`w` ou `v` no SheetJS), desabilitando a execução de qualquer fórmula ou macro contida no arquivo carregado para evitar injeção de CSV/Fórmulas no servidor.
3.  **Processamento Efêmero (Sem Storage):** O arquivo de planilha carregado pelo formulário web será lido como um buffer binário efêmero em memória no Route Handler do servidor. Ele não será gravado no Cloud Storage local ou remoto por padrão, garantindo que o arquivo bruto seja descartado imediatamente após o término do request de processamento de staging.
4.  **Tratamento de PII em logs:** Nenhuma informação de CPF, Telefone ou Nome de aluno será gravada nos logs estruturados do Firebase ou do console da aplicação. Erros e avisos de linhas da planilha se referirão apenas ao índice da linha (ex: *"Linha 42: CPF inválido"*), preservando a privacidade do estudante.

## Consequências
- **Positivas:**
  - Facilidade de adequação aos requisitos de privacidade e LGPD.
  - Baixíssimo consumo de armazenamento no Firebase.
- **Negativas / Riscos:**
  - Caso ocorra uma queda de conexão ou o usuário feche o navegador antes de confirmar a importação, o arquivo processado temporariamente em staging será perdido e ele deverá realizar o upload novamente. Esse trade-off é aceitável em troca da segurança de dados e da simplicidade arquitetural.
