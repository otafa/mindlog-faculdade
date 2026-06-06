"use client";

import { DownloadSimple } from "@phosphor-icons/react";
import { useToast } from "@/components/Toast";

// Aciona o download da exportação (rota /perfil/exportar) e dá feedback. Não há como
// detectar o fim do download pelo navegador, então o toast confirma o INÍCIO de forma
// honesta. A lógica da exportação (portabilidade LGPD) não muda.
export function BotaoExportar() {
  const { mostrar } = useToast();
  return (
    <a
      href="/perfil/exportar"
      download="mindlog-meus-dados.json"
      onClick={() =>
        mostrar("Preparando seu arquivo — o download vai começar.", "sucesso")
      }
      className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-roxo/30 px-4 text-sm font-medium text-roxo transition-colors hover:bg-roxo/5"
    >
      <DownloadSimple size={18} weight="bold" />
      Exportar meus dados
    </a>
  );
}
