"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { gerarRespostaIa } from "@/lib/ai-mock";
import { criptografar } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { statusLimiteIa } from "@/lib/planos";
import { lerSessao } from "@/lib/session";

export type EstadoChat = {
  erro?: string;
};

export async function enviarMensagem(
  _estadoAnterior: EstadoChat,
  formData: FormData,
): Promise<EstadoChat> {
  const sessao = await lerSessao();
  if (!sessao) {
    redirect("/login");
  }

  const texto = (formData.get("mensagem") as string | null)?.trim() ?? "";
  if (texto.length === 0) {
    return { erro: "Escreva uma mensagem." };
  }

  // Limite de mensagens por dia conforme o plano (ex.: Semente = 40/dia).
  const limite = await statusLimiteIa(
    sessao.usuario.id,
    sessao.usuario.planoId,
  );
  if (limite.bloqueado) {
    return {
      erro: `Você atingiu o limite de ${limite.limite} mensagens com a IA por hoje (plano ${limite.nomePlano}). Tente novamente amanhã.`,
    };
  }

  // Resposta gerada localmente (mock, sem API externa — ADR 0004).
  const resposta = gerarRespostaIa(texto);

  await prisma.$transaction(async (tx) => {
    // Reaproveita a conversa do usuário ou cria uma na primeira mensagem.
    const conversa =
      (await tx.sessaoChat.findFirst({
        where: { usuarioId: sessao.usuario.id, deletadoEm: null },
        orderBy: { atualizadoEm: "desc" },
        select: { id: true },
      })) ??
      (await tx.sessaoChat.create({
        data: { usuarioId: sessao.usuario.id },
        select: { id: true },
      }));

    // Mensagens são sensíveis (🔒): cifradas em repouso.
    await tx.mensagemChat.create({
      data: {
        sessaoChatId: conversa.id,
        autor: "USUARIO",
        conteudo: criptografar(texto),
      },
    });
    await tx.mensagemChat.create({
      data: {
        sessaoChatId: conversa.id,
        autor: "IA",
        conteudo: criptografar(resposta),
      },
    });
  });

  revalidatePath("/chat");
  return {};
}
