"use client";

import { useActionState } from "react";
import { criarPost, type EstadoComunidade } from "./actions";

export function FormularioPost() {
  const [estado, acao, pendente] = useActionState(
    criarPost,
    {} as EstadoComunidade,
  );

  return (
    <form action={acao} className="flex flex-col gap-2">
      <textarea
        name="conteudo"
        rows={3}
        maxLength={280}
        placeholder="Compartilhe algo com a comunidade…"
        className="w-full rounded-lg border border-black/10 p-3"
      />
      {estado.erro && (
        <p role="alert" className="text-sm text-red-600">
          {estado.erro}
        </p>
      )}
      <button
        type="submit"
        disabled={pendente}
        className="min-h-[44px] self-start rounded-xl bg-roxo px-5 font-medium text-white disabled:opacity-50"
      >
        {pendente ? "Publicando..." : "Publicar"}
      </button>
    </form>
  );
}
