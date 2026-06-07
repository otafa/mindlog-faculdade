"use client";

import { ArrowsClockwise, Lightbulb, X } from "@phosphor-icons/react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { useToast } from "@/components/Toast";
import { PROMPTS_DIARIO } from "@/data/prompts-diario";
import { MAX_TAGS, normalizarTag } from "@/lib/tags";
import type { EstadoDiario } from "./actions";

type Props = {
  // Server Action passada pelo componente servidor (criar ou atualizar).
  acao: (estado: EstadoDiario, formData: FormData) => Promise<EstadoDiario>;
  // Quando presente, o editor está editando uma entrada existente.
  id?: string;
  conteudoInicial?: string;
  rotuloBotao: string;
  // Índice inicial da sugestão (rotaciona por dia; vem do componente servidor).
  sugestaoInicial?: number;
  // Tags já vinculadas (na edição) e as tags que o usuário já usou (sugestões).
  tagsIniciais?: string[];
  sugestoesTags?: string[];
};

export function EditorEntrada({
  acao,
  id,
  conteudoInicial = "",
  rotuloBotao,
  sugestaoInicial = 0,
  tagsIniciais = [],
  sugestoesTags = [],
}: Props) {
  const { mostrar } = useToast();
  // No sucesso a action redireciona (o toast vira "flash" na /diario); aqui só
  // tratamos o erro, que retorna estado normalmente.
  const [estado, dispatch, pendente] = useActionState(
    async (anterior: EstadoDiario, formData: FormData) => {
      const resultado = await acao(anterior, formData);
      if (resultado?.erro) mostrar(resultado.erro, "erro");
      return resultado;
    },
    {} as EstadoDiario,
  );

  // Textarea controlado para sabermos se está vazio (mostra a sugestão) e poder
  // preenchê-la ao clicar. Não muda nada no envio (name="conteudo" continua igual).
  const [conteudo, setConteudo] = useState(conteudoInicial);
  const [idxSugestao, setIdxSugestao] = useState(
    sugestaoInicial % PROMPTS_DIARIO.length,
  );
  const vazio = conteudo.trim().length === 0;
  const sugestao = PROMPTS_DIARIO[idxSugestao];

  // Tags: estado de cliente; a lista vai num input oculto (name="tags") e o servidor
  // re-normaliza (autoridade). Nunca anexamos tag de outro usuário (o servidor escopa).
  const [tags, setTags] = useState<string[]>(tagsIniciais);
  const [entradaTag, setEntradaTag] = useState("");

  function adicionarTag(bruto: string) {
    const nome = normalizarTag(bruto);
    setEntradaTag("");
    if (!nome) return;
    setTags((atuais) =>
      atuais.includes(nome) || atuais.length >= MAX_TAGS
        ? atuais
        : [...atuais, nome],
    );
  }

  function removerTag(nome: string) {
    setTags((atuais) => atuais.filter((t) => t !== nome));
  }

  // Sugere as tags já usadas que ainda não foram adicionadas a esta entrada.
  const sugestoesDisponiveis = sugestoesTags
    .filter((s) => !tags.includes(s))
    .slice(0, 12);

  return (
    <form action={dispatch} className="flex flex-col gap-3">
      {id && <input type="hidden" name="id" value={id} />}

      {/* Sugestão de escrita (opcional): só aparece com o editor vazio. */}
      {vazio && (
        <div className="rounded-lg border border-dashed border-borda p-3 text-sm">
          <p className="flex items-center gap-1.5 text-mutado">
            <Lightbulb size={16} weight="duotone" className="text-roxo" />
            Sem ideia do que escrever? Uma sugestão:
          </p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setConteudo(sugestao)}
              className="text-left font-serif text-roxo italic hover:underline"
            >
              “{sugestao}”
            </button>
            <button
              type="button"
              onClick={() =>
                setIdxSugestao((i) => (i + 1) % PROMPTS_DIARIO.length)
              }
              aria-label="Ver outra sugestão"
              className="shrink-0 rounded-md p-1 text-mutado transition-colors hover:text-roxo"
            >
              <ArrowsClockwise size={18} />
            </button>
          </div>
        </div>
      )}

      <textarea
        name="conteudo"
        value={conteudo}
        onChange={(e) => setConteudo(e.target.value)}
        placeholder="Escreva sobre o seu dia…"
        className="min-h-[20rem] w-full resize-y rounded-lg border border-borda p-3 font-serif"
      />

      {/* Tags: chips removíveis + campo (Enter/vírgula cria) + sugestões já usadas. */}
      <div className="flex flex-col gap-2">
        <input type="hidden" name="tags" value={tags.join("\n")} />
        <div className="flex flex-wrap items-center gap-1.5">
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded-full bg-roxo/10 py-0.5 pr-1 pl-2.5 text-xs font-medium text-roxo"
            >
              {t}
              <button
                type="button"
                onClick={() => removerTag(t)}
                aria-label={`Remover tag ${t}`}
                className="rounded-full p-0.5 hover:bg-roxo/20"
              >
                <X size={12} weight="bold" />
              </button>
            </span>
          ))}
          {tags.length < MAX_TAGS && (
            <input
              type="text"
              value={entradaTag}
              onChange={(e) => setEntradaTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault(); // não submete o form
                  adicionarTag(entradaTag);
                } else if (
                  e.key === "Backspace" &&
                  entradaTag === "" &&
                  tags.length > 0
                ) {
                  removerTag(tags[tags.length - 1]);
                }
              }}
              onBlur={() => adicionarTag(entradaTag)}
              placeholder={
                tags.length === 0 ? "Tags (Enter ou vírgula)" : "+ tag"
              }
              aria-label="Adicionar tag"
              className="min-w-[8rem] flex-1 rounded-lg border border-borda px-2 py-1 text-sm"
            />
          )}
        </div>

        {sugestoesDisponiveis.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-mutado">Suas tags:</span>
            {sugestoesDisponiveis.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => adicionarTag(s)}
                disabled={tags.length >= MAX_TAGS}
                className="rounded-full border border-borda px-2.5 py-0.5 text-xs text-suave transition-colors hover:border-roxo/40 hover:text-roxo disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {estado.erro && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {estado.erro}
        </p>
      )}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pendente}
          className="min-h-[44px] rounded-xl bg-roxo px-5 font-medium text-white transition-colors hover:bg-roxo/90 disabled:opacity-50"
        >
          {pendente ? "Salvando..." : rotuloBotao}
        </button>
        {id && (
          <Link href="/diario" className="text-sm text-suave underline">
            Cancelar
          </Link>
        )}
      </div>
    </form>
  );
}
