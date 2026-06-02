"use server";

import { redirect } from "next/navigation";
import { criptografar } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { lerSessao } from "@/lib/session";

export type EstadoCheckin = {
  erro?: string;
  sucesso?: boolean;
};

export async function salvarCheckin(
  _estadoAnterior: EstadoCheckin,
  formData: FormData,
): Promise<EstadoCheckin> {
  // SEGURANÇA (ADR 0015): valida a sessão de verdade e obtém o usuário dono do registro.
  const sessao = await lerSessao();
  if (!sessao) {
    redirect("/login");
  }

  const humor = Number(formData.get("humor"));
  if (!Number.isInteger(humor) || humor < 1 || humor > 4) {
    return { erro: "Selecione como você está se sentindo." };
  }

  const nota = (formData.get("nota") as string | null)?.trim() ?? "";
  // nota é dado sensível (🔒): cifra em repouso. Vazia vira null (nada a guardar).
  const notaCifrada = nota.length > 0 ? criptografar(nota) : null;

  // create do registro + linha de auditoria numa transação (ambos ou nenhum).
  await prisma.$transaction(async (tx) => {
    const registro = await tx.registroHumor.create({
      data: { usuarioId: sessao.usuario.id, humor, nota: notaCifrada },
      select: { id: true },
    });
    await tx.auditLog.create({
      data: {
        usuarioId: sessao.usuario.id,
        acao: "CRIAR_CHECKIN",
        entidade: "RegistroHumor",
        entidadeId: registro.id,
      },
    });
  });

  return { sucesso: true };
}
