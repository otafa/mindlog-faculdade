"use client";

import { Moon, Sun } from "@phosphor-icons/react";
import { useSyncExternalStore } from "react";

// A fonte da verdade do tema é a classe `dark` no <html> (definida pelo script
// anti-flash do layout raiz). Lemos essa classe reativamente com useSyncExternalStore
// — a API correta para "estado externo" ao React, sem setState em efeito e sem
// mismatch de hidratação (getServerSnapshot devolve o valor do SSR).
function inscrever(callback: () => void) {
  const obs = new MutationObserver(callback);
  obs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => obs.disconnect();
}

const lerCliente = () => document.documentElement.classList.contains("dark");
const lerServidor = () => false; // no SSR assumimos claro; o script ajusta antes da pintura

// Alterna tema claro/escuro e persiste a escolha num cookie `tema` (sem banco, sem
// estado no servidor).
export function BotaoTema({ className = "" }: { className?: string }) {
  const escuro = useSyncExternalStore(inscrever, lerCliente, lerServidor);

  function alternar() {
    const novo = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", novo);
    // 1 ano; SameSite=Lax basta (não é dado sensível nem de autenticação).
    document.cookie = `tema=${novo ? "escuro" : "claro"}; path=/; max-age=31536000; samesite=lax`;
  }

  const Icone = escuro ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={escuro ? "Ativar tema claro" : "Ativar tema escuro"}
      aria-pressed={escuro}
      className={`flex h-10 w-10 items-center justify-center rounded-full text-roxo transition-colors hover:bg-roxo/10 ${className}`}
    >
      <Icone size={22} weight="duotone" />
    </button>
  );
}
