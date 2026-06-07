"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { criptografar } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { lerSessao } from "@/lib/session";
import { parseTags } from "@/lib/tags";

export type EstadoDiario = {
  erro?: string;
};

// Monta o create aninhado das tags de uma entrada. connectOrCreate é SEMPRE escopado
// ao usuarioId da sessão: nunca anexa (nem cria) tag de outro usuário.
function vincularTags(usuarioId: string, nomes: string[]) {
  return nomes.map((nome) => ({
    tag: {
      connectOrCreate: {
        where: { usuarioId_nome: { usuarioId, nome } },
        create: { usuarioId, nome },
      },
    },
  }));
}

// Cria uma nova entrada de diário (conteúdo cifrado em repouso) + AuditLog.
export async function criarEntrada(
  _estadoAnterior: EstadoDiario,
  formData: FormData,
): Promise<EstadoDiario> {
  const sessao = await lerSessao();
  if (!sessao) {
    redirect("/login");
  }

  const conteudo = (formData.get("conteudo") as string | null)?.trim() ?? "";
  if (conteudo.length === 0) {
    return { erro: "Escreva algo antes de salvar." };
  }

  const nomesTags = parseTags((formData.get("tags") as string | null) ?? "");

  await prisma.$transaction(async (tx) => {
    const entrada = await tx.entradaDiario.create({
      data: {
        usuarioId: sessao.usuario.id,
        conteudo: criptografar(conteudo),
        tags: { create: vincularTags(sessao.usuario.id, nomesTags) },
      },
      select: { id: true },
    });
    await tx.auditLog.create({
      data: {
        usuarioId: sessao.usuario.id,
        acao: "CRIAR_DIARIO",
        entidade: "EntradaDiario",
        entidadeId: entrada.id,
      },
    });
  });

  // O ?toast= é só um "flash" de feedback lido na página de destino (ver ToastFlash).
  redirect("/diario?toast=criada");
}

// Atualiza uma entrada própria. A checagem de posse (usuarioId) evita editar a de outro.
export async function atualizarEntrada(
  _estadoAnterior: EstadoDiario,
  formData: FormData,
): Promise<EstadoDiario> {
  const sessao = await lerSessao();
  if (!sessao) {
    redirect("/login");
  }

  const id = String(formData.get("id") ?? "");
  const conteudo = (formData.get("conteudo") as string | null)?.trim() ?? "";
  if (conteudo.length === 0) {
    return { erro: "Escreva algo antes de salvar." };
  }

  const nomesTags = parseTags((formData.get("tags") as string | null) ?? "");

  const entrada = await prisma.entradaDiario.findFirst({
    where: { id, usuarioId: sessao.usuario.id, deletadoEm: null },
    select: { id: true },
  });
  if (!entrada) {
    return { erro: "Entrada não encontrada." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.entradaDiario.update({
      where: { id },
      data: {
        conteudo: criptografar(conteudo),
        // Substitui o conjunto de tags: remove os vínculos atuais e recria.
        tags: {
          deleteMany: {},
          create: vincularTags(sessao.usuario.id, nomesTags),
        },
      },
    });
    await tx.auditLog.create({
      data: {
        usuarioId: sessao.usuario.id,
        acao: "EDITAR_DIARIO",
        entidade: "EntradaDiario",
        entidadeId: id,
      },
    });
  });

  redirect("/diario?toast=editada");
}

// Apaga (soft delete) uma entrada própria + AuditLog. Seguro mesmo se já não existir.
export async function apagarEntrada(formData: FormData): Promise<void> {
  const sessao = await lerSessao();
  if (!sessao) {
    redirect("/login");
  }

  const id = String(formData.get("id") ?? "");
  const entrada = await prisma.entradaDiario.findFirst({
    where: { id, usuarioId: sessao.usuario.id, deletadoEm: null },
    select: { id: true },
  });

  if (entrada) {
    await prisma.$transaction(async (tx) => {
      await tx.entradaDiario.update({
        where: { id },
        data: { deletadoEm: new Date() },
      });
      await tx.auditLog.create({
        data: {
          usuarioId: sessao.usuario.id,
          acao: "APAGAR_DIARIO",
          entidade: "EntradaDiario",
          entidadeId: id,
        },
      });
    });
  }

  revalidatePath("/diario");
}
