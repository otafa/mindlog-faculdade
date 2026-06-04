"use client";

import { apagarEntrada } from "./actions";

// Botão de apagar com confirmação (form + Server Action, pois muda estado no servidor).
export function BotaoApagarEntrada({ id }: { id: string }) {
  return (
    <form
      action={apagarEntrada}
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
        className="inline-flex items-center rounded-md px-2 py-1 text-sm text-red-600 hover:bg-red-50"
      >
        Apagar
      </button>
    </form>
  );
}
