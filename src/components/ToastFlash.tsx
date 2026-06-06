"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/components/Toast";

// Mostra um toast UMA vez ao montar, a partir de um "flash" vindo na URL (?toast=...).
// Usado quando a Server Action redireciona no sucesso (ex.: criar/editar diário): o
// feedback precisa sobreviver à navegação. Depois limpa o parâmetro da URL para o
// toast não reaparecer ao recarregar/voltar.
export function ToastFlash({
  texto,
  tipo = "sucesso",
}: {
  texto: string;
  tipo?: "sucesso" | "erro";
}) {
  const { mostrar } = useToast();
  const jaMostrou = useRef(false);

  useEffect(() => {
    if (jaMostrou.current) return; // evita repetição (ex.: Strict Mode)
    jaMostrou.current = true;
    mostrar(texto, tipo);

    const url = new URL(window.location.href);
    url.searchParams.delete("toast");
    window.history.replaceState(null, "", url.pathname + url.search);
  }, [mostrar, texto, tipo]);

  return null;
}
