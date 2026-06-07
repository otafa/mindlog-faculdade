"use client";

import { useActionState } from "react";
import { useToast } from "@/components/Toast";
import { type EstadoPlano, trocarPlano } from "./actions";

// Botão "Escolher": dispara a Server Action de troca e mostra o toast a partir do
// resultado, sem mudar a lógica da action.
export function BotaoEscolherPlano({
  planoId,
  destaque = false,
}: {
  planoId: string;
  destaque?: boolean;
}) {
  const { mostrar } = useToast();
  const [, acao, pendente] = useActionState(
    async (anterior: EstadoPlano, formData: FormData) => {
      const resultado = await trocarPlano(anterior, formData);
      if (resultado.erro) mostrar(resultado.erro, "erro");
      else if (resultado.sucesso)
        mostrar(`Plano alterado para ${resultado.nomePlano}.`, "sucesso");
      return resultado;
    },
    {} as EstadoPlano,
  );

  return (
    <form action={acao}>
      <input type="hidden" name="planoId" value={planoId} />
      <button
        type="submit"
        disabled={pendente}
        className={`min-h-[44px] w-full rounded-xl px-5 font-medium transition-colors disabled:opacity-50 ${
          destaque
            ? "bg-roxo text-white hover:bg-roxo/90"
            : "border border-roxo/30 text-roxo hover:bg-roxo/5"
        }`}
      >
        {pendente ? "Trocando…" : "Escolher"}
      </button>
    </form>
  );
}
