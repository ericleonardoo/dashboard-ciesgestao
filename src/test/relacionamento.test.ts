import { describe, it, expect } from 'vitest';
import { getSafeRedirectUrl, formatPhoneForWhatsapp } from '../lib/validation/url-sanitizer';

describe('Relacionamento — URL Sanitization & Security Gating', () => {

  describe('Formatação de Celular (formatPhoneForWhatsapp)', () => {
    it('deve extrair apenas digitos de telefone com mascara', () => {
      expect(formatPhoneForWhatsapp('(11) 98765-4321')).toBe('5511987654321');
    });

    it('deve adicionar DDI 55 para numeros com 10 digitos (sem o 9 extra)', () => {
      expect(formatPhoneForWhatsapp('1187654321')).toBe('551187654321');
    });

    it('deve manter o DDI se o numero ja possuir 13 digitos comecando com 55', () => {
      expect(formatPhoneForWhatsapp('5511987654321')).toBe('5511987654321');
    });
  });

  describe('Higienizador de URL (getSafeRedirectUrl)', () => {
    it('deve retornar a propria URL se for HTTP ou HTTPS legitimo', () => {
      const secureUrl = 'https://api.whatsapp.com/send?phone=5511987654321';
      expect(getSafeRedirectUrl(secureUrl, '11987654321')).toBe(secureUrl);
    });

    it('deve retornar link wa.me de fallback se a URL original for nula, vazia ou apenas espacos', () => {
      const phone = '11987654321';
      const expectedFallback = 'https://wa.me/5511987654321?text=Ol%C3%A1!%20Seja%20muito%20bem-vindo(a)%20ao%20CIES!';
      
      expect(getSafeRedirectUrl(null, phone)).toBe(expectedFallback);
      expect(getSafeRedirectUrl('   ', phone)).toBe(expectedFallback);
    });

    it('deve bloquear e retornar fallback se a URL usar protocolo perigoso javascript:', () => {
      const malicousUrl = 'javascript:alert(document.cookie)';
      const phone = '11987654321';
      const expectedFallback = 'https://wa.me/5511987654321?text=Ol%C3%A1!%20Seja%20muito%20bem-vindo(a)%20ao%20CIES!';

      expect(getSafeRedirectUrl(malicousUrl, phone)).toBe(expectedFallback);
    });

    it('deve bloquear e retornar fallback se a URL usar esquema data:', () => {
      const dangerousData = 'data:text/html,<script>alert(1)</script>';
      const phone = '11987654321';
      
      expect(getSafeRedirectUrl(dangerousData, phone)).toContain('https://wa.me/');
    });

    it('deve bloquear e retornar fallback se a URL nao tiver protocolo HTTP/HTTPS', () => {
      const badProtocol = 'wa.me/5511987654321';
      const phone = '11987654321';
      
      expect(getSafeRedirectUrl(badProtocol, phone)).toContain('https://wa.me/');
    });

    it('deve bloquear e retornar fallback se a URL estrutural for malformada', () => {
      const badStructure = 'https://[invalid-url';
      const phone = '11987654321';
      
      expect(getSafeRedirectUrl(badStructure, phone)).toContain('https://wa.me/');
    });
  });
});
