"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { destruirSessao, lerSessao } from "@/lib/session";

export type EstadoPerfil = {
  erro?: string;
  sucesso?: boolean;
};

// Palavra que o usuário precisa digitar para confirmar a exclusão (2ª etapa).
const CONFIRMACAO_EXCLUSAO = "APAGAR";

export async function atualizarNome(
  _estadoAnterior: EstadoPerfil,
  formData: FormData,
): Promise<EstadoPerfil> {
  const sessao = await lerSessao();
  if (!sessao) {
    redirect("/login");
  }

  const nome = (formData.get("nome") as string | null)?.trim() ?? "";
  if (nome.length === 0) {
    return { erro: "O nome não pode ficar vazio." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.usuario.update({ where: { id: sessao.usuario.id }, data: { nome } });
    await tx.auditLog.create({
      data: {
        usuarioId: sessao.usuario.id,
        acao: "EDITAR_NOME",
        entidade: "Usuario",
        entidadeId: sessao.usuario.id,
      },
    });
  });

  revalidatePath("/perfil");
  return { sucesso: true };
}

// Direito ao esquecimento (LGPD): soft delete + anonimização imediata. A remoção
// física definitiva acontece depois, por script manual, após a carência de 30 dias
// (ver docs/lgpd.md e ADR 0005).
export async function apagarConta(
  _estadoAnterior: EstadoPerfil,
  formData: FormData,
): Promise<EstadoPerfil> {
  const sessao = await lerSessao();
  if (!sessao) {
    redirect("/login");
  }

  const confirmacao = (formData.get("confirmacao") as string | null)?.trim() ?? "";
  if (confirmacao !== CONFIRMACAO_EXCLUSAO) {
    return { erro: `Para confirmar, digite ${CONFIRMACAO_EXCLUSAO} no campo.` };
  }

  const id = sessao.usuario.id;
  await prisma.$transaction(async (tx) => {
    // Anonimiza a identidade e marca a conta como deletada.
    await tx.usuario.update({
      where: { id },
      data: {
        deletadoEm: new Date(),
        nome: "Usuário removido",
        email: `deletado-${id}@anon.local`, // preserva a constraint @unique
        senhaHash: "!", // valor inválido fixo: nenhum hash gera isso, inviabiliza login
      },
    });
    // Revoga todas as sessões do usuário (bloqueia acesso em qualquer dispositivo).
    await tx.sessao.deleteMany({ where: { usuarioId: id } });
    await tx.auditLog.create({
      data: { usuarioId: id, acao: "APAGAR_CONTA", entidade: "Usuario", entidadeId: id },
    });
  });

  // Encerra a sessão atual (limpa o cookie) e manda para o login.
  await destruirSessao();
  redirect("/login");
}
