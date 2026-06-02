"use client";

import { useActionState } from "react";
import { apagarConta, type EstadoPerfil } from "./actions";

export function ApagarConta() {
  const [estado, acao, pendente] = useActionState(apagarConta, {} as EstadoPerfil);

  return (
    <form
      action={acao}
      onSubmit={(e) => {
        // 2ª etapa de confirmação: diálogo nativo, além da palavra digitada.
        if (
          !confirm(
            "Apagar sua conta? Sua identidade será anonimizada e sua sessão encerrada. " +
              "Esta ação não pode ser desfeita.",
          )
        ) {
          e.preventDefault();
        }
      }}
      className="flex flex-col gap-2"
    >
      <p className="text-sm text-zinc-600">
        Isso anonimiza seus dados de identificação e encerra sua sessão. Para confirmar,
        digite <strong>APAGAR</strong> abaixo.
      </p>
      <input
        name="confirmacao"
        type="text"
        autoComplete="off"
        placeholder="APAGAR"
        className="rounded-lg border border-black/10 px-3 py-2"
      />
      {estado.erro && <p role="alert" className="text-sm text-red-600">{estado.erro}</p>}
      <button
        type="submit"
        disabled={pendente}
        className="min-h-[44px] rounded-xl border border-red-600 px-4 font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        {pendente ? "Apagando..." : "Apagar minha conta"}
      </button>
    </form>
  );
}
