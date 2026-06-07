import { MagnifyingGlass, NotePencil } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { EstadoVazio } from "@/components/EstadoVazio";
import { ToastFlash } from "@/components/ToastFlash";
import { PROMPTS_DIARIO } from "@/data/prompts-diario";
import { descriptografar } from "@/lib/crypto";
import { formatarDataHora, inicioDoDiaSP } from "@/lib/datas";
import { prisma } from "@/lib/db";
import { lerSessao } from "@/lib/session";
import { normalizarTag } from "@/lib/tags";
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

// Aceita só "YYYY-MM-DD" (formato do <input type="date">); ignora qualquer outra coisa.
const RE_DATA = /^\d{4}-\d{2}-\d{2}$/;

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
  searchParams: Promise<{
    toast?: string;
    q?: string;
    de?: string;
    ate?: string;
    tag?: string;
  }>;
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

  // Período: `criadoEm` está em claro, então o intervalo é filtrado NO BANCO (Prisma
  // where), combinando com a busca textual feita em memória. As datas do formulário
  // ("YYYY-MM-DD") viram limites de dia no fuso de São Paulo (ADR 0011).
  const de = RE_DATA.test(params.de ?? "") ? (params.de as string) : "";
  const ate = RE_DATA.test(params.ate ?? "") ? (params.ate as string) : "";

  // Tag: filtro SQL de verdade (nome em claro na junção). Normalizada igual à gravação.
  const tag = normalizarTag(params.tag ?? "");
  const filtrando = buscando || de !== "" || ate !== "" || tag !== "";

  const intervalo: { gte?: Date; lt?: Date } = {};
  if (de) intervalo.gte = inicioDoDiaSP(new Date(`${de}T12:00:00Z`));
  if (ate) {
    // lt = início do dia SEGUINTE (SP), tornando a data final inclusiva.
    const inicioAte = inicioDoDiaSP(new Date(`${ate}T12:00:00Z`));
    intervalo.lt = new Date(inicioAte.getTime() + 86_400_000);
  }

  const entradas = await prisma.entradaDiario.findMany({
    where: {
      usuarioId: sessao.usuario.id,
      deletadoEm: null,
      ...(de || ate ? { criadoEm: intervalo } : {}),
      // Filtro por tag no banco: entradas que têm a tag (do próprio usuário).
      ...(tag
        ? {
            tags: {
              some: { tag: { nome: tag, usuarioId: sessao.usuario.id } },
            },
          }
        : {}),
    },
    orderBy: { criadoEm: "desc" },
    select: {
      id: true,
      conteudo: true,
      criadoEm: true,
      atualizadoEm: true,
      tags: { select: { tag: { select: { nome: true } } } },
    },
  });

  // Tags que o usuário já usou — sugestões no editor (e, depois, filtro da busca).
  const tagsUsuario = await prisma.tag.findMany({
    where: { usuarioId: sessao.usuario.id },
    orderBy: { nome: "asc" },
    select: { nome: true },
  });
  const nomesTagsUsuario = tagsUsuario.map((t) => t.nome);

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
    tags: e.tags.map((t) => t.tag.nome),
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
          sugestoesTags={nomesTagsUsuario}
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
          {/* Período: filtrado no banco (criadoEm em claro). */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1 text-xs text-mutado">
              De
              <input
                type="date"
                name="de"
                defaultValue={de}
                aria-label="Data inicial"
                className="rounded-lg border border-borda bg-superficie px-2 py-1.5 text-sm"
              />
            </label>
            <label className="flex items-center gap-1 text-xs text-mutado">
              Até
              <input
                type="date"
                name="ate"
                defaultValue={ate}
                aria-label="Data final"
                className="rounded-lg border border-borda bg-superficie px-2 py-1.5 text-sm"
              />
            </label>
          </div>

          {/* Filtro por tag (SQL): só aparece se o usuário já tem tags. */}
          {nomesTagsUsuario.length > 0 && (
            <label className="flex items-center gap-1 text-xs text-mutado">
              Tag
              <select
                name="tag"
                defaultValue={tag}
                aria-label="Filtrar por tag"
                className="flex-1 rounded-lg border border-borda bg-superficie px-2 py-1.5 text-sm"
              >
                <option value="">Todas</option>
                {nomesTagsUsuario.map((nome) => (
                  <option key={nome} value={nome}>
                    {nome}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="min-h-[40px] rounded-lg bg-roxo px-4 text-sm font-medium text-white transition-colors hover:bg-roxo/90"
            >
              Buscar
            </button>
            {filtrando && (
              <Link
                href="/diario"
                className="text-sm text-suave underline hover:text-roxo"
              >
                Limpar
              </Link>
            )}
          </div>
        </form>

        {!filtrando && entradasLegiveis.length === 0 ? (
          <EstadoVazio
            Icone={NotePencil}
            titulo="Seu diário ainda está em branco"
            descricao="Que tal escrever a primeira página? Use o editor para começar."
          />
        ) : resultados.length === 0 ? (
          <EstadoVazio
            Icone={MagnifyingGlass}
            titulo="Nada encontrado"
            descricao="Nenhuma entrada combina com a sua busca ou período. Tente outros termos."
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
              {e.tags.length > 0 && (
                <ul className="flex flex-wrap gap-1.5">
                  {e.tags.map((t) => (
                    <li
                      key={t}
                      className="rounded-full bg-roxo/10 px-2.5 py-0.5 text-xs font-medium text-roxo"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              )}
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
