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
      <button type="submit" className="text-sm text-red-600 underline">
        Apagar
      </button>
    </form>
  );
}
