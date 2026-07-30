# Open Questions — CIES Gestão v3.0

> Documento de rastreamento de dúvidas não-bloqueantes e requisitos pendentes da Gestão.

## Questões em Aberto (Não-Bloqueantes)

1. **Definição oficial de Matrícula Válida:**
   - *Status:* PENDENTE da Gestão (Elen).
   - *Default Proposto:* Considerar `releaseStatus == 'YES'` (`Subiu? = SIM`) como padrão para faturamento válido.

2. **Regra exata de Semáforo de Alertas:**
   - *Status:* PENDENTE da Gestão.
   - *Default Proposto:* Follow-ups com mais de 48h sem contato são amarelos (atenção); mais de 5 dias são vermelhos (crítico).

3. **Nomes e e-mails dos 3 Consultores Externos:**
   - *Status:* PENDENTE da Gestão.
   - *Tratamento:* Serão cadastrados pela Gestão via painel `/colaboradores` após o lançamento.

4. **Tempo de Expiração do Cookie de Sessão:**
   - *Status:* PROPOSTO.
   - *Default Proposto:* 5 dias de validade para o cookie `HttpOnly` com renovação no uso.
