import { Brain } from "@phosphor-icons/react";
import type { ReactNode } from "react";

// Casca visual das telas de autenticação (slides 8 e 9): painel roxo à esquerda
// (marca + frase + conteúdo extra) e o formulário à direita num card branco.
// No mobile os dois painéis empilham (o roxo vira o topo).
export function AuthShell({
  tagline,
  painelExtra,
  children,
}: {
  tagline: string;
  painelExtra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-lavanda p-4 sm:p-6">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-sm sm:grid-cols-2">
        <div className="flex flex-col items-center gap-4 bg-roxo p-8 text-center text-white">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15">
            <Brain size={40} weight="fill" />
          </span>
          <div>
            <p className="font-serif text-2xl font-semibold">MindLog</p>
            <p className="mt-1 text-sm text-white/80">{tagline}</p>
          </div>
          {painelExtra}
        </div>

        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}
