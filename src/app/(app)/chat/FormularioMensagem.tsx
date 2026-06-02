"use client";

import { useActionState } from "react";
import { enviarMensagem, type EstadoChat } from "./actions";

export function FormularioMensagem() {
  const [estado, acao, pendente] = useActionState(enviarMensagem, {} as EstadoChat);

  return (
    <form action={acao} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          name="mensagem"
          type="text"
          autoComplete="off"
          placeholder="Escreva uma mensagem…"
          className="flex-1 rounded-xl border border-black/10 px-3 py-2"
        />
        <button
          type="submit"
          disabled={pendente}
          className="min-h-[44px] rounded-xl bg-[#6C5CE7] px-5 font-medium text-white disabled:opacity-50"
        >
          {pendente ? "..." : "Enviar"}
        </button>
      </div>
      {estado.erro && <p role="alert" className="text-sm text-red-600">{estado.erro}</p>}
    </form>
  );
}
