"use client";

import { useActionState } from "react";
import { useToast } from "@/components/Toast";
import { criarPost, type EstadoComunidade } from "./actions";

export function FormularioPost() {
  const { mostrar } = useToast();
  const [estado, acao, pendente] = useActionState(
    async (anterior: EstadoComunidade, formData: FormData) => {
      const resultado = await criarPost(anterior, formData);
      if (resultado.erro) mostrar(resultado.erro, "erro");
      else mostrar("Post publicado.", "sucesso");
      return resultado;
    },
    {} as EstadoComunidade,
  );

  return (
    <form action={acao} className="flex flex-col gap-2">
      <textarea
        name="conteudo"
        rows={3}
        maxLength={280}
        placeholder="Compartilhe algo com a comunidade…"
        className="w-full rounded-lg border border-borda p-3 font-serif"
      />
      {estado.erro && (
        <p role="alert" className="text-sm text-red-600">
          {estado.erro}
        </p>
      )}
      <button
        type="submit"
        disabled={pendente}
        className="min-h-[44px] self-start rounded-xl bg-roxo px-5 font-medium text-white transition-colors hover:bg-roxo/90 disabled:opacity-50"
      >
        {pendente ? "Publicando..." : "Publicar"}
      </button>
    </form>
  );
}
