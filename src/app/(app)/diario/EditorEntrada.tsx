"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useToast } from "@/components/Toast";
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

  return (
    <form action={dispatch} className="flex flex-col gap-3">
      {id && <input type="hidden" name="id" value={id} />}
      <textarea
        name="conteudo"
        defaultValue={conteudoInicial}
        placeholder="Escreva sobre o seu dia…"
        className="min-h-[20rem] w-full resize-y rounded-lg border border-borda p-3 font-serif"
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
          <Link href="/diario" className="text-sm text-suave underline">
            Cancelar
          </Link>
        )}
      </div>
    </form>
  );
}
