/**
 * Higieniza o número de telefone adicionando DDI 55 (Brasil) por padrão caso tenha 10 ou 11 dígitos
 */
export function formatPhoneForWhatsapp(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
}

/**
 * Higieniza e valida links de redirecionamento de WhatsApp vindos da planilha
 * Caso o link seja suspeito (ex: javascript:), vazio ou aponte para domínios estranhos,
 * gera um link de fallback seguro para o WhatsApp com uma mensagem de boas-vindas padrão.
 */
export function getSafeRedirectUrl(
  url: string | null | undefined,
  phone: string
): string {
  const cleanPhone = formatPhoneForWhatsapp(phone);
  const defaultWelcomeMessage = encodeURIComponent('Olá! Seja muito bem-vindo(a) ao CIES!');
  const fallbackUrl = `https://wa.me/${cleanPhone}?text=${defaultWelcomeMessage}`;

  if (!url || url.trim() === '') {
    return fallbackUrl;
  }

  const trimmedUrl = url.trim();

  // Bloqueia esquemas perigosos (como javascript: ou data:)
  const isDangerousScheme = /^(javascript|data|file|vbscript):/i.test(trimmedUrl);
  if (isDangerousScheme) {
    return fallbackUrl;
  }

  // Garante que o link use HTTP ou HTTPS
  const hasHttp = /^https?:\/\//i.test(trimmedUrl);
  if (!hasHttp) {
    return fallbackUrl;
  }

  try {
    const parsed = new URL(trimmedUrl);
    
    // Restringe a links legítimos do ecossistema do WhatsApp se quisermos rigidez extra.
    // Mas a planilha pode conter atalhos curtos diversos. Para o MVP, aceitar qualquer HTTP/HTTPS seguro
    // que não tenha injeção perigosa é o suficiente, permitindo redirects de sites de faculdade por exemplo.
    return parsed.toString();
  } catch {
    // Caso a URL seja estruturalmente malformada
    return fallbackUrl;
  }
}
