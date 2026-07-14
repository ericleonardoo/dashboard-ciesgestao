import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = '__session';

// Rotas que necessitam de autenticação
const protectedPaths = [
  '/dashboard',
  '/matriculas',
  '/importacoes',
  '/metas',
  '/colaboradores',
  '/leads',
  '/convenios',
  '/campanhas',
  '/relacionamento',
  '/planos-acao',
  '/relatorios',
  '/configuracoes',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verifica se o cookie __session está presente
  const sessionCookie = request.cookies.get(COOKIE_NAME)?.value;
  
  // Se for a rota raiz e estiver no path /, redirecionamos para o dashboard se logado, ou deixamos passar
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path)) || pathname === '/';
  
  if (isProtected) {
    if (!sessionCookie) {
      // Usuário não autenticado tentando acessar rota protegida -> redireciona para login
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname === '/login') {
    if (sessionCookie) {
      // Usuário autenticado tentando acessar a tela de login -> redireciona para a home/dashboard
      const dashboardUrl = new URL('/', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

// Configuração do Matcher para filtrar as rotas aplicadas e evitar interceptar arquivos estáticos
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - next.svg, vercel.svg (logo assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|next.svg|vercel.svg).*)',
  ],
};
