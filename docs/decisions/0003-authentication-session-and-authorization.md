# ADR 0003: Autenticação, Sessão por Cookies SSR e Matriz de Autorização

- **Status:** **PROPOSTO**
- **Data:** 2026-07-13
- **Autor:** @security

## Contexto
O sistema CIES Gestão processa informações confidenciais (dados de faturamento e dados pessoais de alunos). A autenticação no cliente via Firebase SDK expõe tokens que podem ser vulneráveis se não forem gerenciados corretamente no Next.js App Router (SSR). A segurança deve ser aplicada tanto na API cliente quanto no servidor.

## Decisão
Implementaremos um modelo de autenticação individual de colaboradores com **sessão SSR via cookies seguros** e autorização em duas camadas.

1.  **Firebase Authentication no Cliente:** O login do usuário será efetuado via formulário no cliente (Firebase Web SDK) por e-mail e senha.
2.  **Troca Segura de Token (Cookies SSR):** Ao efetuar o login com sucesso, o ID Token gerado no cliente será enviado via HTTPS POST para um endpoint de API (`/api/auth/session`). O endpoint usará o Firebase Admin SDK para validar o token e criar um cookie de sessão seguro (`HttpOnly`, `Secure` em produção, `SameSite=Strict`, validade padrão de 5 dias).
3.  **Autorização em Duas Camadas:**
    - **Client-Side (SDK Cliente):** O acesso direto ao banco do cliente será restrito pelas regras em `firestore.rules` (Security Rules). Por padrão, as regras negarão qualquer leitura ou escrita, permitindo apenas caminhos correspondentes ao ID do usuário e permissões específicas.
    - **Server-Side (Admin SDK):** Como o Admin SDK ignora as Security Rules do banco, qualquer chamada realizada via Server Actions ou Route Handlers fará uma validação explícita de autenticação (verificação do cookie de sessão) e verificação do papel do usuário em `users/{uid}/permissions` antes de realizar a operação.
4.  **Criação de Contas Controlada:** Não haverá rota de auto-cadastro pública. O cadastro inicial de colaboradores será feito exclusivamente por administradores autorizados.

## Consequências
- **Positivas:**
  - Máxima segurança contra ataques XSS e CSRF em páginas SSR.
  - O servidor Next.js renderiza apenas componentes adequados ao nível de acesso do usuário de forma segura.
- **Negativas / Riscos:**
  - Aumenta a complexidade de gerenciamento de estado de login (troca de tokens de autenticação por cookies). Mitigaremos escrevendo helpers de sessão encapsulados e exaustivamente testados (`lib/firebase/auth-session.ts`).
