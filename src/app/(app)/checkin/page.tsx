"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useToast } from "@/components/Toast";
import { salvarCheckin, type EstadoCheckin } from "./actions";

const ESTADO_INICIAL: EstadoCheckin = {};

// Escala de 4 opções (Lei de Hick: poucas escolhas). Valor 1–4 conforme o schema.
const OPCOES = [
  { valor: 1, rotulo: "Mal", emoji: "😣" },
  { valor: 2, rotulo: "Neutro", emoji: "😐" },
  { valor: 3, rotulo: "Bem", emoji: "🙂" },
  { valor: 4, rotulo: "Muito bem", emoji: "😄" },
];

export default function PaginaCheckin() {
  const { mostrar } = useToast();
  // Envolve a Server Action para disparar o toast a partir do resultado (sem efeito,
  // sem mexer na lógica da action — ela continua retornando o mesmo estado).
  const [estado, acao, pendente] = useActionState(
    async (anterior: EstadoCheckin, formData: FormData) => {
      const resultado = await salvarCheckin(anterior, formData);
      if (resultado.erro) mostrar(resultado.erro, "erro");
      else if (resultado.sucesso) mostrar("Check-in salvo. 🌱", "sucesso");
      return resultado;
    },
    ESTADO_INICIAL,
  );
  const [humor, setHumor] = useState<number | null>(null);

  if (estado.sucesso) {
    return (
      <div className="mx-auto max-w-xl">
        <section className="rounded-2xl bg-superficie p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold">Check-in salvo! 🌱</h1>
          <p className="mt-2 text-suave">
            Obrigado por registrar como você está.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link href="/inicio" className="text-roxo underline">
              Voltar ao início
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <section className="rounded-2xl bg-superficie p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Como você está se sentindo?</h1>

        <form action={acao} className="mt-4 flex flex-col gap-4">
          {/* valor selecionado enviado no submit */}
          <input type="hidden" name="humor" value={humor ?? ""} />

          <div className="grid grid-cols-2 gap-3">
            {OPCOES.map((opcao) => {
              const selecionado = humor === opcao.valor;
              return (
                <button
                  key={opcao.valor}
                  type="button"
                  onClick={() => setHumor(opcao.valor)}
                  aria-pressed={selecionado}
                  className={`flex min-h-[64px] items-center justify-center gap-2 rounded-xl border text-base transition-colors ${
                    selecionado
                      ? "border-roxo bg-lavanda font-medium"
                      : "border-borda bg-superficie hover:bg-lavanda"
                  }`}
                >
                  <span aria-hidden>{opcao.emoji}</span>
                  {opcao.rotulo}
                </button>
              );
            })}
          </div>

          <label className="flex flex-col gap-1 text-sm">
            Quer anotar algo? (opcional)
            <textarea
              name="nota"
              rows={3}
              maxLength={1000}
              className="rounded-lg border border-borda p-2 font-serif"
              placeholder="O que pesou ou ajudou hoje…"
            />
          </label>

          {estado.erro && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {estado.erro}
            </p>
          )}

          <button
            type="submit"
            disabled={pendente || humor === null}
            className="min-h-[44px] self-start rounded-xl bg-roxo px-6 font-medium text-white transition-colors hover:bg-roxo/90 disabled:opacity-50"
          >
            {pendente ? "Salvando..." : "Salvar check-in"}
          </button>
        </form>
      </section>
    </div>
  );
}
