import type { Icon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

// Estado vazio reutilizável: ícone acolhedor + título curto + linha de apoio + ação
// opcional (um botão/link levando à primeira ação da tela). Card autocontido.
export function EstadoVazio({
  Icone,
  titulo,
  descricao,
  acao,
}: {
  Icone: Icon;
  titulo: string;
  descricao: string;
  acao?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-6 py-12 text-center shadow-sm">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-lavanda">
        <Icone size={28} weight="duotone" className="text-roxo" />
      </span>
      <div className="space-y-1">
        <p className="font-medium">{titulo}</p>
        <p className="mx-auto max-w-sm text-sm text-zinc-500">{descricao}</p>
      </div>
      {acao}
    </div>
  );
}
