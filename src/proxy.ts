// Guarda de rotas (proxy do Next 16 — antigo middleware.ts; aqui a função se chama `proxy`).
//
// Princípio: o proxy é o "porteiro", não a "tranca". Ele faz APENAS uma checagem barata de
// PRESENÇA do cookie de sessão. NÃO consulta o banco, NÃO valida o token, NÃO checa
// expiração — a validação real é o lerSessao() (session.ts), chamado pelos Server
// Components. Por isso este arquivo importa só o nome do cookie de sessao-config.ts e
// nunca o Prisma/session.ts (que não podem ir para o bundle do edge).

import { NextResponse, type NextRequest, type ProxyConfig } from "next/server";
import { NOME_COOKIE } from "@/lib/sessao-config";

// Rotas de autenticação: visitantes acessam; quem já tem sessão é mandado embora.
const ROTAS_AUTH = ["/login", "/cadastro"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const temCookie = request.cookies.get(NOME_COOKIE) !== undefined;
  const ehRotaAuth = ROTAS_AUTH.includes(pathname);

  // Regra B: já tem cookie e tenta acessar /login ou /cadastro → vai para a home.
  if (ehRotaAuth) {
    if (temCookie) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Regra A: rota protegida sem cookie → vai para o /login.
  if (!temCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config: ProxyConfig = {
  // Aplica o proxy apenas a estas rotas. O `missing: next-action` evita interceptar
  // requisições de Server Actions (que chegam como POST com esse header) — elas devem
  // executar a action, não passar pelo porteiro.
  //
  // Fase 3: ao adicionar rotas autenticadas (ex.: /diario, /insights, /perfil, /chat),
  // inclua cada uma aqui como `source` protegida. As de auth ficam em ROTAS_AUTH acima.
  matcher: [
    { source: "/", missing: [{ type: "header", key: "next-action" }] },
    { source: "/chat", missing: [{ type: "header", key: "next-action" }] },
    { source: "/checkin", missing: [{ type: "header", key: "next-action" }] },
    { source: "/diario", missing: [{ type: "header", key: "next-action" }] },
    { source: "/diario/:id", missing: [{ type: "header", key: "next-action" }] },
    { source: "/insights", missing: [{ type: "header", key: "next-action" }] },
    { source: "/perfil", missing: [{ type: "header", key: "next-action" }] },
    { source: "/perfil/exportar", missing: [{ type: "header", key: "next-action" }] },
    { source: "/login", missing: [{ type: "header", key: "next-action" }] },
    { source: "/cadastro", missing: [{ type: "header", key: "next-action" }] },
  ],
};
