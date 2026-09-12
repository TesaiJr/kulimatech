import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 16 Proxy Convention
 * Responsável por interceptação, roteamento e futura verificação de autenticação/permissões (RBAC).
 */
export function proxy(request: NextRequest) {
  // Permite a passagem das requisições por padrão
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Intercepta todas as rotas exceto:
     * - Chamadas de API internas (_next, favicon, etc)
     * - Arquivos estáticos comuns (imagens, fonts, svg)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
