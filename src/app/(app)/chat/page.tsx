import { ChatCircleDots } from "@phosphor-icons/react/dist/ssr";
import { redirect } from "next/navigation";
import { EstadoVazio } from "@/components/EstadoVazio";
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
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Conversar com a IA</h1>

      {/* Aviso permanente: a IA não substitui um profissional. */}
      <p className="rounded-lg bg-lavanda p-3 text-xs text-suave">
        Esta IA é um apoio para desabafar e refletir — ela{" "}
        <strong>não substitui</strong> um profissional de saúde mental. Em
        momentos de crise, ligue para o CVV no <strong>188</strong> (24h,
        gratuito).
      </p>

      {mensagens.length === 0 ? (
        <EstadoVazio
          Icone={ChatCircleDots}
          titulo="Comece quando quiser"
          descricao="Este é um espaço para organizar seus pensamentos. Escreva uma mensagem quando quiser começar."
        />
      ) : (
        <section className="flex min-h-[320px] flex-col gap-3 rounded-2xl bg-superficie p-4 shadow-sm">
          {mensagens.map((m) => {
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
                      : "bg-lavanda text-conteudo"
                  }`}
                >
                  {m.texto}
                </p>
              </div>
            );
          })}
        </section>
      )}

      <FormularioMensagem />

      {limite.limite !== null && (
        <p className="text-center text-xs text-mutado">
          {limite.usadasHoje} de {limite.limite} mensagens com a IA hoje (plano{" "}
          {limite.nomePlano}).
        </p>
      )}
    </div>
  );
}
