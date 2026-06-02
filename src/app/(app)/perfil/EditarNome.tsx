"use client";

import { useActionState } from "react";
import { atualizarNome, type EstadoPerfil } from "./actions";

export function EditarNome({ nomeAtual }: { nomeAtual: string }) {
  const [estado, acao, pendente] = useActionState(
    atualizarNome,
    {} as EstadoPerfil,
  );

  return (
    <form action={acao} className="flex flex-col gap-2">
      <label className="text-sm font-medium">Nome</label>
      <div className="flex gap-2">
        <input
          name="nome"
          type="text"
          defaultValue={nomeAtual}
          className="flex-1 rounded-lg border border-black/10 px-3 py-2"
        />
        <button
          type="submit"
          disabled={pendente}
          className="min-h-[44px] rounded-xl bg-roxo px-4 font-medium text-white disabled:opacity-50"
        >
          {pendente ? "..." : "Salvar"}
        </button>
      </div>
      {estado.erro && (
        <p role="alert" className="text-sm text-red-600">
          {estado.erro}
        </p>
      )}
      {estado.sucesso && (
        <p className="text-sm text-green-700">Nome atualizado.</p>
      )}
    </form>
  );
}
