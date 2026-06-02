"use server";

import { redirect } from "next/navigation";
import { verificarSenha } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { criarSessao } from "@/lib/session";

// Mensagem única para qualquer falha de credencial: nunca diferenciar "e-mail não existe"
// de "senha errada", para não permitir enumeração de usuários pela mensagem.
const ERRO_CREDENCIAL = "E-mail ou senha incorretos.";

// Hash-dummy de Argon2id (mesmos parâmetros do hashSenha). Quando o e-mail não existe,
// verificamos a senha contra este hash mesmo assim, para que o tempo de resposta seja
// parecido com o caso em que o usuário existe — evitando enumeração por timing.
// É um hash de uma senha fixa arbitrária; nenhuma conta real usa essa senha.
const HASH_DUMMY =
  "$argon2id$v=19$m=19456,t=2,p=1$7zNxe/unzHC5fEJZwlRUPg$9JSPGWfY3vzzyq2QgdfqXELgQ4LS6y+lvJ1xmEX3F2I";

export type EstadoLogin = {
  erro?: string;
  // valor devolvido para repreencher o campo de e-mail após erro (senha nunca volta).
  valores?: { email: string };
};

export async function entrar(
  _estadoAnterior: EstadoLogin,
  formData: FormData,
): Promise<EstadoLogin> {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const senha = (formData.get("senha") as string | null) ?? "";

  if (email.length === 0 || senha.length === 0) {
    return { erro: "Preencha e-mail e senha.", valores: { email } };
  }

  // Conta soft-deleted (deletadoEm != null) não loga.
  const usuario = await prisma.usuario.findFirst({
    where: { email, deletadoEm: null },
    select: { id: true, senhaHash: true },
  });

  // Verifica sempre — contra o hash real se existir, senão contra o dummy (timing).
  const senhaConfere = await verificarSenha(senha, usuario?.senhaHash ?? HASH_DUMMY);

  if (!usuario || !senhaConfere) {
    return { erro: ERRO_CREDENCIAL, valores: { email } };
  }

  await criarSessao(usuario.id);
  redirect("/"); // dashboard real vem na Fase 3
}
