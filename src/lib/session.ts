// Helpers de sessão.
//
// A sessão tem estado no banco (tabela Sessao). O cookie HTTP-only carrega apenas um
// token aleatório criptográfico (ADR 0007 + 0014) — nunca o id (CUID) nem dados do
// usuário. A validação real ("tranca") é lerSessao(), que confere o token no banco;
// o proxy/middleware não substitui essa checagem.

import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { DURACAO_MS, NOME_COOKIE } from "@/lib/sessao-config";

// Dados do usuário expostos a partir da sessão (sem senhaHash nem campos internos).
export type UsuarioSessao = {
  id: string;
  nome: string;
  email: string;
  planoId: string;
};

/**
 * Cria uma sessão para o usuário: gera token aleatório, persiste a linha em Sessao e
 * grava o cookie HTTP-only com esse token.
 */
export async function criarSessao(usuarioId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiraEm = new Date(Date.now() + DURACAO_MS);

  await prisma.sessao.create({
    data: { token, usuarioId, expiraEm },
  });

  const cookieStore = await cookies();
  cookieStore.set(NOME_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiraEm,
  });
}

/**
 * Lê e valida a sessão atual. Retorna o usuário (campos públicos) se a sessão for válida,
 * ou null caso contrário: sem cookie, token inexistente no banco, sessão expirada ou
 * usuário com soft delete. Nunca lança para o chamador.
 */
// Envolvido em cache() do React: dentro de uma mesma requisição (ex.: layout + página
// chamando lerSessao), a checagem roda uma vez só, evitando consultas duplicadas ao banco.
export const lerSessao = cache(async function lerSessao(): Promise<{
  usuario: UsuarioSessao;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(NOME_COOKIE)?.value;
  if (!token) return null;

  // findUnique retorna null se o token não existir mais (ex.: sessão já limpa do banco),
  // então esse caso vira simplesmente "sessão inválida", sem exceção.
  const sessao = await prisma.sessao.findUnique({
    where: { token },
    select: {
      expiraEm: true,
      usuario: {
        select: {
          id: true,
          nome: true,
          email: true,
          planoId: true,
          deletadoEm: true,
        },
      },
    },
  });

  if (!sessao) return null;
  if (sessao.expiraEm <= new Date()) return null;
  if (sessao.usuario.deletadoEm !== null) return null;

  const { deletadoEm: _descartado, ...usuario } = sessao.usuario;
  void _descartado;
  return { usuario };
});

/**
 * Destrói a sessão atual: remove a linha do banco (se houver) e limpa o cookie.
 * Seguro chamar mesmo sem sessão ativa — não lança.
 */
export async function destruirSessao(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(NOME_COOKIE)?.value;
  if (!token) return;

  // deleteMany (e não delete) não lança se a linha já não existir no banco.
  await prisma.sessao.deleteMany({ where: { token } });
  cookieStore.delete(NOME_COOKIE);
}
