// Exportação de dados (direito de portabilidade — LGPD).
//
// Route Handler em vez de Server Action porque o objetivo é baixar um arquivo. Os
// campos sensíveis são DECIFRADOS aqui: o destino é o próprio titular, e portabilidade
// exige dados em formato legível. Self-guard com lerSessao (layouts não envolvem rotas).

import { NextResponse } from "next/server";
import { descriptografar } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { lerSessao } from "@/lib/session";

export async function GET() {
  const sessao = await lerSessao();
  if (!sessao) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const usuario = await prisma.usuario.findUniqueOrThrow({
    where: { id: sessao.usuario.id },
    select: {
      nome: true,
      email: true,
      consentimentoEm: true,
      criadoEm: true,
      plano: { select: { id: true, nome: true } },
      registrosHumor: {
        where: { deletadoEm: null },
        orderBy: { criadoEm: "asc" },
        select: { humor: true, nota: true, criadoEm: true },
      },
      entradasDiario: {
        where: { deletadoEm: null },
        orderBy: { criadoEm: "asc" },
        select: {
          conteudo: true,
          criadoEm: true,
          atualizadoEm: true,
          tags: { select: { tag: { select: { nome: true } } } },
        },
      },
      sessoesChat: {
        where: { deletadoEm: null },
        orderBy: { criadoEm: "asc" },
        select: {
          criadoEm: true,
          mensagens: {
            where: { deletadoEm: null },
            orderBy: { criadoEm: "asc" },
            select: { autor: true, conteudo: true, criadoEm: true },
          },
        },
      },
    },
  });

  // Monta o JSON com os campos sensíveis decifrados (legíveis para o titular).
  const dados = {
    exportadoEm: new Date().toISOString(),
    usuario: {
      nome: usuario.nome,
      email: usuario.email,
      plano: usuario.plano,
      consentimentoEm: usuario.consentimentoEm,
      criadoEm: usuario.criadoEm,
    },
    registrosHumor: usuario.registrosHumor.map((r) => ({
      humor: r.humor,
      nota: r.nota ? descriptografar(r.nota) : null,
      criadoEm: r.criadoEm,
    })),
    entradasDiario: usuario.entradasDiario.map((e) => ({
      conteudo: descriptografar(e.conteudo),
      criadoEm: e.criadoEm,
      atualizadoEm: e.atualizadoEm,
      tags: e.tags.map((t) => t.tag.nome),
    })),
    conversasIa: usuario.sessoesChat.map((c) => ({
      criadoEm: c.criadoEm,
      mensagens: c.mensagens.map((m) => ({
        autor: m.autor,
        conteudo: descriptografar(m.conteudo),
        criadoEm: m.criadoEm,
      })),
    })),
  };

  return new NextResponse(JSON.stringify(dados, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="mindlog-meus-dados.json"',
    },
  });
}
