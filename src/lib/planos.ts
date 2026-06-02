// Lógica de limites por plano.
//
// O limite vive no banco (tabela Plano, populada via seed — ADR 0010): Semente tem
// limiteMsgIaDia = 40; Equilíbrio e Florescer = null (ilimitado). Aqui contamos as
// mensagens enviadas pelo usuário à IA no dia atual (fuso SP) para aplicar o limite.

import { inicioDoDiaSP } from "@/lib/datas";
import { prisma } from "@/lib/db";

export type StatusLimiteIa = {
  nomePlano: string;
  limite: number | null; // null = ilimitado
  usadasHoje: number;
  bloqueado: boolean;
};

export async function statusLimiteIa(
  usuarioId: string,
  planoId: string,
): Promise<StatusLimiteIa> {
  const plano = await prisma.plano.findUnique({
    where: { id: planoId },
    select: { nome: true, limiteMsgIaDia: true },
  });

  const limite = plano?.limiteMsgIaDia ?? null;

  // Só conta quando há limite a aplicar.
  let usadasHoje = 0;
  if (limite !== null) {
    usadasHoje = await prisma.mensagemChat.count({
      where: {
        autor: "USUARIO",
        deletadoEm: null,
        criadoEm: { gte: inicioDoDiaSP(new Date()) },
        sessaoChat: { usuarioId },
      },
    });
  }

  return {
    nomePlano: plano?.nome ?? planoId,
    limite,
    usadasHoje,
    bloqueado: limite !== null && usadasHoje >= limite,
  };
}
