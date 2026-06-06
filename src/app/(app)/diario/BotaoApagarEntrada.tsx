"use client";

import { useActionState } from "react";
import { useToast } from "@/components/Toast";
import { apagarEntrada } from "./actions";

// Botão de apagar com confirmação (form + Server Action, pois muda estado no servidor).
// Envolve a action em useActionState só para disparar o toast quando ela conclui — a
// lógica de exclusão no servidor permanece a mesma.
export function BotaoApagarEntrada({ id }: { id: string }) {
  const { mostrar } = useToast();
  const [, acao, pendente] = useActionState(
    async (_prev: null, formData: FormData) => {
      await apagarEntrada(formData);
      mostrar("Entrada apagada.", "sucesso");
      return null;
    },
    null,
  );

  return (
    <form
      action={acao}
      onSubmit={(e) => {
        if (
          !confirm(
            "Apagar esta entrada do diário? Esta ação não pode ser desfeita.",
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pendente}
        className="inline-flex items-center rounded-md px-2 py-1 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
      >
        {pendente ? "Apagando…" : "Apagar"}
      </button>
    </form>
  );
}
