# ADR 0005: Representação Financeira e Proteção de Campos Críticos

- **Status:** **CONFIRMADO**
- **Data:** 2026-07-13
- **Autor:** @architect / @security

## Contexto
O sistema CIES Gestão lida com dados financeiros sensíveis (somas de faturamento e valores individuais de matrículas). Erros de ponto flutuante binário (padrão de números em JavaScript) podem causar inconsistências de centavos em agregações de grande volume. Além disso, mutações não autorizadas em valores financeiros por colaboradores operacionais devem ser impedidas.

## Decisão
Implementaremos proteção e formatação estrita dos dados monetários.

1.  **Representação Inteira em Centavos:** Todos os valores financeiros serão persistidos no banco de dados como números inteiros de centavos (ex: `R$ 199,90` -> `19990` centavos). Os cálculos matemáticos e agregações do dashboard serão feitos em centavos inteiros no servidor.
2.  **Formatação pt-BR:** O símbolo `R$` e a formatação com vírgula serão tratados apenas na renderização da interface usando utilitários puros de formatação de moeda em JavaScript (`lib/money/format.ts`).
3.  **Proteção contra Mutação de Valor:**
    - O campo `amountCents` é classificado como crítico.
    - Componentes de UI para Relacionamento ou Comercial renderizarão o campo como somente leitura.
    - No backend, o Firestore Security Rules bloqueará qualquer escrita no campo `amountCents` feita por usuários que não possuam a role `admin` ou `gestao`.
    - No servidor, endpoints que utilizam o Admin SDK realizarão verificação manual e gravarão um log na coleção `auditLogs` para cada alteração com o valor anterior e novo.

## Consequências
- **Positivas:**
  - Inexistência de erros de arredondamento de centavos no cálculo de faturamento válido e total.
  - Segurança aprimorada contra fraudes ou erros operacionais de modificação financeira.
- **Negativas / Riscos:**
  - Exige que o parser de planilhas seja preciso na leitura de formatos variados de texto monetário brasileiro. Criaremos uma biblioteca de normalização robusta e exaustivamente testada em unit tests (`lib/money/normalize.ts`).
