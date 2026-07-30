import { NextRequest, NextResponse } from 'next/server';
import { validateAndCreateSession, destroySession } from '@/lib/firebase/auth-session';

export const dynamic = 'force-dynamic';

/**
 * Endpoint para criar a sessão (Cookie HttpOnly) a partir do ID Token cliente
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'ID Token obrigatório não fornecido.' },
        { status: 400 }
      );
    }

    // Valida allowlist no servidor e cria o cookie de sessão
    const result = await validateAndCreateSession(idToken);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Acesso negado.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao processar criação de sessão:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Falha ao autenticar no servidor. Detalhes: ' + message },
      { status: 401 }
    );
  }
}

/**
 * Endpoint para limpar o cookie de sessão e revogar os tokens no logout
 */
export async function DELETE() {
  try {
    await destroySession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao encerrar sessão:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Falha ao encerrar sessão no servidor. Detalhes: ' + message },
      { status: 500 }
    );
  }
}
