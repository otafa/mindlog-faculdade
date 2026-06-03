import { redirect } from "next/navigation";
import { descriptografar } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { statusLimiteIa } from "@/lib/planos";
import { lerSessao } from "@/lib/session";
import { FormularioMensagem } from "./FormularioMensagem";

export default async function PaginaChat() {
  // SEGURANÇA (ADR 0015).
  const sessao = await lerSessao();
  if (!sessao) {
    redirect("/login");
  }

  // Conversa atual do usuário (se já existir) e suas mensagens, em ordem cronológica.
  const conversa = await prisma.sessaoChat.findFirst({
    where: { usuarioId: sessao.usuario.id, deletadoEm: null },
    orderBy: { atualizadoEm: "desc" },
    select: {
      mensagens: {
        where: { deletadoEm: null },
        orderBy: { criadoEm: "asc" },
        select: { id: true, autor: true, conteudo: true },
      },
    },
  });

  const mensagens = (conversa?.mensagens ?? []).map((m) => ({
    id: m.id,
    autor: m.autor,
    texto: descriptografar(m.conteudo),
  }));

  const limite = await statusLimiteIa(
    sessao.usuario.id,
    sessao.usuario.planoId,
  );

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <h1 className="text-xl font-semibold">Conversar com a IA</h1>

      {/* Aviso permanente: a IA não substitui um profissional. */}
      <p className="rounded-lg bg-lavanda p-3 text-xs text-zinc-600">
        Esta IA é um apoio para desabafar e refletir — ela{" "}
        <strong>não substitui</strong> um profissional de saúde mental. Em
        momentos de crise, ligue para o CVV no <strong>188</strong> (24h,
        gratuito).
      </p>

      <section className="flex min-h-[320px] flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
        {mensagens.length === 0 ? (
          <p className="m-auto text-sm text-zinc-500">
            Comece a conversa quando quiser. Estou aqui para ouvir.
          </p>
        ) : (
          mensagens.map((m) => {
            const ehUsuario = m.autor === "USUARIO";
            return (
              <div
                key={m.id}
                className={`flex ${ehUsuario ? "justify-end" : "justify-start"}`}
              >
                <p
                  className={`max-w-[80%] rounded-2xl px-3 py-2 font-serif text-sm whitespace-pre-wrap ${
                    ehUsuario
                      ? "bg-roxo text-white"
                      : "bg-zinc-100 text-zinc-800"
                  }`}
                >
                  {m.texto}
                </p>
              </div>
            );
          })
        )}
      </section>

      <FormularioMensagem />

      {limite.limite !== null && (
        <p className="text-center text-xs text-zinc-500">
          {limite.usadasHoje} de {limite.limite} mensagens com a IA hoje (plano{" "}
          {limite.nomePlano}).
        </p>
      )}
    </div>
  );
}
