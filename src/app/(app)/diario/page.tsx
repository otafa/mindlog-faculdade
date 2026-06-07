import { MagnifyingGlass, NotePencil } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { EstadoVazio } from "@/components/EstadoVazio";
import { ToastFlash } from "@/components/ToastFlash";
import { PROMPTS_DIARIO } from "@/data/prompts-diario";
import { descriptografar } from "@/lib/crypto";
import { formatarDataHora } from "@/lib/datas";
import { prisma } from "@/lib/db";
import { lerSessao } from "@/lib/session";
import { BotaoApagarEntrada } from "./BotaoApagarEntrada";
import { criarEntrada } from "./actions";
import { EditorEntrada } from "./EditorEntrada";

// Normaliza para comparar sem diferença de caixa nem de acento (NFD remove os
// diacríticos). Usado SÓ na busca textual em memória — nunca persistido nem logado.
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function escaparRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Destaque simples do trecho buscado (case-insensitive). Observação: o realce é
// sensível a acento, então um termo sem acento ainda FILTRA (busca acento-insensível),
// mas pode não pintar o trecho — limitação aceita para manter o realce simples.
function destacar(texto: string, termo: string): ReactNode {
  const t = termo.trim();
  if (!t) return texto;
  const re = new RegExp(`(${escaparRegex(t)})`, "gi");
  // split com grupo de captura: índices ímpares são os trechos casados.
  return texto.split(re).map((parte, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="rounded bg-roxo/20 text-conteudo">
        {parte}
      </mark>
    ) : (
      parte
    ),
  );
}

export default async function PaginaDiario({
  searchParams,
}: {
  searchParams: Promise<{ toast?: string; q?: string }>;
}) {
  // SEGURANÇA (ADR 0015): valida sessão e obtém o dono das entradas.
  const sessao = await lerSessao();
  if (!sessao) {
    redirect("/login");
  }

  const params = await searchParams;

  // Flash de feedback após o redirect das ações de criar/editar (ver ToastFlash).
  const flash =
    params.toast === "criada"
      ? "Entrada salva no diário."
      : params.toast === "editada"
        ? "Entrada atualizada."
        : null;

  // Busca textual: como `conteudo` é cifrado com AES-256-GCM (IV aleatório por
  // registro), o ciphertext é não-determinístico e LIKE/índice não funcionam (ver
  // ADR 0020). Estratégia: carregar só os diários do usuário, descriptografar em
  // memória e filtrar por substring normalizada. Nunca logamos/persistimos o texto puro.
  const termo = (params.q ?? "").trim();
  const buscando = termo.length > 0;

  const entradas = await prisma.entradaDiario.findMany({
    where: { usuarioId: sessao.usuario.id, deletadoEm: null },
    orderBy: { criadoEm: "desc" },
    select: { id: true, conteudo: true, criadoEm: true, atualizadoEm: true },
  });

  // Sugestão inicial rotaciona por dia (mesmo critério de pureza do dashboard:
  // new Date() na borda, sem Math.random/Date.now em render).
  const sugestaoInicial =
    Math.floor(new Date().getTime() / 86_400_000) % PROMPTS_DIARIO.length;

  // Decifra o conteúdo apenas para exibir/buscar (dado sensível, cifrado em repouso).
  const entradasLegiveis = entradas.map((e) => ({
    id: e.id,
    texto: descriptografar(e.conteudo),
    criadoEm: e.criadoEm,
    editado: e.atualizadoEm.getTime() !== e.criadoEm.getTime(),
  }));

  const termoNorm = normalizar(termo);
  const resultados = buscando
    ? entradasLegiveis.filter((e) => normalizar(e.texto).includes(termoNorm))
    : entradasLegiveis;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
      {flash && <ToastFlash texto={flash} />}
      {/* Ação principal (escrever) — coluna maior, fixada no topo. */}
      <section className="flex flex-col self-start rounded-2xl bg-superficie p-6 shadow-sm">
        <h1 className="mb-4 text-xl font-semibold">Nova entrada</h1>
        <EditorEntrada
          acao={criarEntrada}
          rotuloBotao="Salvar entrada"
          sugestaoInicial={sugestaoInicial}
        />
      </section>

      {/* Histórico — coluna lateral menor, com busca. */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Histórico</h2>

        {/* Busca: form GET (sem JS) que reflete o termo na URL (?q=...). */}
        <form method="get" className="flex flex-col gap-2">
          <div className="relative">
            <MagnifyingGlass
              size={18}
              className="absolute top-1/2 left-3 -translate-y-1/2 text-mutado"
            />
            <input
              type="search"
              name="q"
              defaultValue={termo}
              placeholder="Buscar no diário…"
              aria-label="Buscar no diário"
              className="w-full rounded-lg border border-borda bg-superficie py-2 pr-3 pl-9 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="min-h-[40px] rounded-lg bg-roxo px-4 text-sm font-medium text-white transition-colors hover:bg-roxo/90"
            >
              Buscar
            </button>
            {buscando && (
              <Link
                href="/diario"
                className="text-sm text-suave underline hover:text-roxo"
              >
                Limpar
              </Link>
            )}
          </div>
        </form>

        {entradasLegiveis.length === 0 ? (
          <EstadoVazio
            Icone={NotePencil}
            titulo="Seu diário ainda está em branco"
            descricao="Que tal escrever a primeira página? Use o editor para começar."
          />
        ) : resultados.length === 0 ? (
          <EstadoVazio
            Icone={MagnifyingGlass}
            titulo="Nada encontrado"
            descricao="Nenhuma entrada combina com a sua busca. Tente outras palavras."
            acao={
              <Link
                href="/diario"
                className="inline-flex min-h-[44px] items-center rounded-xl bg-roxo px-5 font-medium text-white transition-colors hover:bg-roxo/90"
              >
                Limpar busca
              </Link>
            }
          />
        ) : (
          resultados.map((e) => (
            <article
              key={e.id}
              className="flex flex-col gap-2 rounded-2xl bg-superficie p-4 shadow-sm"
            >
              <p className="font-serif text-sm whitespace-pre-wrap text-conteudo">
                {buscando ? destacar(e.texto, termo) : e.texto}
              </p>
              <footer className="flex items-center justify-between border-t border-borda pt-2 text-xs text-mutado">
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
