# ADR 0002: Plataforma Firebase e Modelo de Dados do Cloud Firestore

- **Status:** **CONFIRMADO**
- **Data:** 2026-07-13
- **Autor:** @architect

## Contexto
O banco de dados deve suportar o armazenamento de dados de matrículas importadas e registros operacionais de múltiplos colaboradores. O Cloud Firestore é um banco documental NoSQL (não relacional) com características específicas de queries e cobrança por leituras/escritas.

## Decisão
Adotaremos a plataforma **Firebase Console** com o **Cloud Firestore** em modo nativo como nosso banco documental centralizado.

1.  **Modelo de Dados Baseado em Coleções de Nível Superior (Top-Level):** As principais entidades (alunos, matrículas, usuários, lotes de importação e auditorias) serão estruturadas em coleções principais, facilitando pesquisas cruzadas e filtros independentes.
2.  **Desnormalização Controlada:** Para evitar consultas adicionais excessivas (problema N+1), armazenaremos dados redundantes (como nomes de vendedores ou nomes de cursos) diretamente na coleção de matrículas, com atualização controlada.
3.  **Paginação Obrigatória no Servidor:** Listas grandes de matrículas usarão paginação por cursor (utilizando a API `startAfter()` do Firestore), evitando carregamento completo de coleções em memória.
4.  **Custo e Performance de Agregações:** O dashboard gerencial não fará consultas que leiam todos os documentos para calcular os faturamentos. Utilizaremos queries de agregação (`count()`, `sum()`) nativas do Firestore executadas sob demanda, ou salvaremos instantâneos semanais/mensais calculados (`kpiSnapshots`) para consulta eficiente de relatórios históricos.

## Consequências
- **Positivas:**
  - Altíssima escalabilidade e baixa latência de acesso aos dados.
  - Facilidade de desenvolvimento local usando o Firebase Local Emulator Suite.
  - composite indexes versionados em `firestore.indexes.json` garantem performance e previsibilidade de queries.
- **Negativas / Riscos:**
  - A cobrança por leitura e escrita de documentos exige design defensivo. Queries de agregação no servidor ajudam a mitigar custos, mas o código deve evitar o uso de listeners em tempo real em telas que não necessitam de atualização instantânea.
