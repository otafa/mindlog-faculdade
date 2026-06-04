"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { EstadoDiario } from "./actions";

type Props = {
  // Server Action passada pelo componente servidor (criar ou atualizar).
  acao: (estado: EstadoDiario, formData: FormData) => Promise<EstadoDiario>;
  // Quando presente, o editor está editando uma entrada existente.
  id?: string;
  conteudoInicial?: string;
  rotuloBotao: string;
};

export function EditorEntrada({
  acao,
  id,
  conteudoInicial = "",
  rotuloBotao,
}: Props) {
  const [estado, dispatch, pendente] = useActionState(acao, {} as EstadoDiario);

  return (
    <form action={dispatch} className="flex flex-col gap-3">
      {id && <input type="hidden" name="id" value={id} />}
      <textarea
        name="conteudo"
        defaultValue={conteudoInicial}
        placeholder="Escreva sobre o seu dia…"
        className="min-h-[20rem] w-full resize-y rounded-lg border border-black/10 p-3 font-serif"
      />
      {estado.erro && (
        <p role="alert" className="text-sm text-red-600">
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
          <Link href="/diario" className="text-sm text-zinc-600 underline">
            Cancelar
          </Link>
        )}
      </div>
    </form>
  );
}
