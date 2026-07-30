# ADR 0003: Google Auth, Allowlist Server-Side e RBAC

## Status
**CONFIRMADO** (29/07/2026)

## Contexto
O CIES Gestão é um sistema web interno. Ele não possui cadastro público de usuários. Todos os colaboradores acessarão o sistema utilizando suas contas Google ativas. Contudo, o simples fato de possuir uma conta Google válida não deve conceder acesso às rotas ou aos dados do sistema.

## Decisão
1. **Autenticação no Cliente:** Utilizar o provedor `GoogleAuthProvider` do Firebase Authentication no cliente via popup com fallback por redirect.
2. **Validação Server-Side da Allowlist:** Ao receber o ID Token do Firebase no servidor (`/api/auth/session`), o Admin SDK verifica a assinatura do token, se o e-mail está verificado e se o e-mail consta na coleção `accessAllowlist` com status `'ACTIVE'`.
3. **Bloqueio de Não Autorizados:** Caso o e-mail autenticado pelo Google não esteja na `accessAllowlist`, o servidor rejeita o login com a mensagem explicativa: *"Sua conta Google foi reconhecida, mas ainda não possui acesso ao CIES Gestão. Solicite liberação à Gestão."*
4. **Sessão por Cookie HttpOnly:** Após a aprovação do servidor, um cookie de sessão seguro (`HttpOnly`, `Secure` em produção, `SameSite=Lax`) é configurado (`__session`).
5. **RBAC no Servidor:** As permissões e papéis são extraídos do registro do colaborador no Firestore pelo Admin SDK em cada requisição de Server Action ou Route Handler.

## Consequências
- A segurança é mantida integralmente no servidor, impedindo bypass por manipulação de estado do cliente.
- Security Rules do Firestore no cliente aplicam a regra `deny-by-default` para usuários não cadastrados em `users/{uid}`.
