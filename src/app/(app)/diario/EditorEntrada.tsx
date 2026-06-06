"use client";

import { ArrowsClockwise, Lightbulb } from "@phosphor-icons/react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { useToast } from "@/components/Toast";
import { PROMPTS_DIARIO } from "@/data/prompts-diario";
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
};

export function EditorEntrada({
  acao,
  id,
  conteudoInicial = "",
  rotuloBotao,
  sugestaoInicial = 0,
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
