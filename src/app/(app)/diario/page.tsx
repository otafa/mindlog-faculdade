import Link from "next/link";
import { redirect } from "next/navigation";
import { descriptografar } from "@/lib/crypto";
import { formatarDataHora } from "@/lib/datas";
import { prisma } from "@/lib/db";
import { lerSessao } from "@/lib/session";
import { BotaoApagarEntrada } from "./BotaoApagarEntrada";
import { criarEntrada } from "./actions";
import { EditorEntrada } from "./EditorEntrada";

export default async function PaginaDiario() {
  // SEGURANÇA (ADR 0015): valida sessão e obtém o dono das entradas.
  const sessao = await lerSessao();
  if (!sessao) {
    redirect("/login");
  }

  const entradas = await prisma.entradaDiario.findMany({
    where: { usuarioId: sessao.usuario.id, deletadoEm: null },
    orderBy: { criadoEm: "desc" },
    select: { id: true, conteudo: true, criadoEm: true, atualizadoEm: true },
  });

  // Decifra o conteúdo apenas para exibir (dado sensível, cifrado em repouso).
  const entradasLegiveis = entradas.map((e) => ({
    id: e.id,
    texto: descriptografar(e.conteudo),
    criadoEm: e.criadoEm,
    editado: e.atualizadoEm.getTime() !== e.criadoEm.getTime(),
  }));

  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-xl font-semibold">Nova entrada</h1>
        <EditorEntrada acao={criarEntrada} rotuloBotao="Salvar entrada" />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Histórico</h2>
        {entradasLegiveis.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Você ainda não escreveu nenhuma entrada.
          </p>
        ) : (
          entradasLegiveis.map((e) => (
            <article key={e.id} className="rounded-xl bg-white p-4 shadow-sm">
              <header className="mb-2 flex items-center justify-between text-xs text-zinc-500">
                <span>
                  {formatarDataHora(e.criadoEm)}
                  {e.editado && " (editado)"}
                </span>
                <span className="flex gap-3">
                  <Link href={`/diario/${e.id}`} className="text-[#6C5CE7] underline">
                    Editar
                  </Link>
                  <BotaoApagarEntrada id={e.id} />
                </span>
              </header>
              <p className="whitespace-pre-wrap text-sm text-zinc-800">{e.texto}</p>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
