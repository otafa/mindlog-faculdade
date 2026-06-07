"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { lerSessao } from "@/lib/session";

export type EstadoPlano = {
  erro?: string;
  sucesso?: boolean;
  nomePlano?: string;
};

// Troca o plano do usuário no banco — SEM pagamento (ADR 0004 + nova ADR). Valida o
// plano contra a tabela, respeita soft delete e registra a mudança no AuditLog.
export async function trocarPlano(
  _estadoAnterior: EstadoPlano,
  formData: FormData,
): Promise<EstadoPlano> {
  // SEGURANÇA (ADR 0015): lerSessao já garante sessão válida e conta não deletada.
  const sessao = await lerSessao();
  if (!sessao) {
    redirect("/login");
  }

  const planoId = String(formData.get("planoId") ?? "");

  // O plano precisa existir no banco (não confiamos no que vem do formulário).
  const plano = await prisma.plano.findUnique({
    where: { id: planoId },
    select: { id: true, nome: true },
  });
  if (!plano) {
    return { erro: "Plano inválido." };
  }
  if (plano.id === sessao.usuario.planoId) {
    return { erro: "Esse já é o seu plano atual." };
  }

  // update + AuditLog na mesma transação (tudo ou nada). O updateMany com
  // deletadoEm:null é a guarda de soft delete: conta deletada → nenhuma linha muda.
  const alterou = await prisma.$transaction(async (tx) => {
    const r = await tx.usuario.updateMany({
      where: { id: sessao.usuario.id, deletadoEm: null },
      data: { planoId: plano.id },
    });
    if (r.count === 0) return false;

    await tx.auditLog.create({
      data: {
        usuarioId: sessao.usuario.id,
        acao: "TROCAR_PLANO",
        entidade: "Usuario",
        entidadeId: sessao.usuario.id,
      },
    });
    return true;
  });

  if (!alterou) {
    return { erro: "Não foi possível alterar o plano." };
  }

  revalidatePath("/planos");
  return { sucesso: true, nomePlano: plano.nome };
}
