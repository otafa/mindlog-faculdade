import { NotePencil } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EstadoVazio } from "@/components/EstadoVazio";
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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
      {/* Ação principal (escrever) — coluna maior, fixada no topo. */}
      <section className="flex flex-col self-start rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-xl font-semibold">Nova entrada</h1>
        <EditorEntrada acao={criarEntrada} rotuloBotao="Salvar entrada" />
      </section>

      {/* Histórico — coluna lateral menor. */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Histórico</h2>
        {entradasLegiveis.length === 0 ? (
          <EstadoVazio
            Icone={NotePencil}
            titulo="Seu diário ainda está em branco"
            descricao="Que tal escrever a primeira página? Use o editor para começar."
          />
        ) : (
          entradasLegiveis.map((e) => (
            <article
              key={e.id}
              className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm"
            >
              <p className="font-serif text-sm whitespace-pre-wrap text-zinc-800">
                {e.texto}
              </p>
              <footer className="flex items-center justify-between border-t border-black/5 pt-2 text-xs text-zinc-500">
                <span>
                  {formatarDataHora(e.criadoEm)}
                  {e.editado && " (editado)"}
                </span>
                <span className="flex items-center gap-1">
                  <Link
                    href={`/diario/${e.id}`}
                    className="inline-flex items-center rounded-md px-2 py-1 text-roxo hover:bg-lavanda"
                  >
                    Editar
                  </Link>
                  <BotaoApagarEntrada id={e.id} />
                </span>
              </footer>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
