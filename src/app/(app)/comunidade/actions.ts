"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { lerSessao } from "@/lib/session";

export type EstadoComunidade = {
  erro?: string;
};

const POST_MAX = 280;

// Cria um post curto. Conteúdo é público e voluntário — não é cifrado (precisa ser
// lido por outros usuários).
export async function criarPost(
  _estadoAnterior: EstadoComunidade,
  formData: FormData,
): Promise<EstadoComunidade> {
  const sessao = await lerSessao();
  if (!sessao) {
    redirect("/login");
  }

  const conteudo = (formData.get("conteudo") as string | null)?.trim() ?? "";
  if (conteudo.length === 0) {
    return { erro: "Escreva algo para publicar." };
  }
  if (conteudo.length > POST_MAX) {
    return { erro: `O post deve ter no máximo ${POST_MAX} caracteres.` };
  }

  await prisma.post.create({ data: { usuarioId: sessao.usuario.id, conteudo } });
  revalidatePath("/comunidade");
  return {};
}

// Curte ou descurte um post (alterna). A PK composta (usuarioId, postId) impede
// curtida duplicada por construção.
export async function alternarCurtida(formData: FormData): Promise<void> {
  const sessao = await lerSessao();
  if (!sessao) {
    redirect("/login");
  }

  const postId = String(formData.get("postId") ?? "");
  const chave = { usuarioId_postId: { usuarioId: sessao.usuario.id, postId } };

  const existente = await prisma.curtida.findUnique({ where: chave });
  if (existente) {
    await prisma.curtida.delete({ where: chave });
  } else {
    await prisma.curtida.create({
      data: { usuarioId: sessao.usuario.id, postId },
    });
  }

  revalidatePath("/comunidade");
}
