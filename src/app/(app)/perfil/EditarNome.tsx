"use client";

import { useActionState } from "react";
import { useToast } from "@/components/Toast";
import { atualizarNome, type EstadoPerfil } from "./actions";

export function EditarNome({ nomeAtual }: { nomeAtual: string }) {
  const { mostrar } = useToast();
  const [estado, acao, pendente] = useActionState(
    async (anterior: EstadoPerfil, formData: FormData) => {
      const resultado = await atualizarNome(anterior, formData);
      if (resultado.erro) mostrar(resultado.erro, "erro");
      else if (resultado.sucesso) mostrar("Nome atualizado.", "sucesso");
      return resultado;
    },
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
          className="flex-1 rounded-lg border border-borda px-3 py-2"
        />
        <button
          type="submit"
          disabled={pendente}
          className="min-h-[44px] rounded-xl bg-roxo px-4 font-medium text-white transition-colors hover:bg-roxo/90 disabled:opacity-50"
        >
          {pendente ? "..." : "Salvar"}
        </button>
      </div>
      {estado.erro && (
        <p role="alert" className="text-sm text-red-600">
          {estado.erro}
        </p>
      )}
    </form>
  );
}
