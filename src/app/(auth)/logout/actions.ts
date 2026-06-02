"use server";

import { redirect } from "next/navigation";
import { destruirSessao } from "@/lib/session";

/**
 * Encerra a sessão atual: remove a linha em Sessao e limpa o cookie (via destruirSessao,
 * que é seguro chamar mesmo sem sessão ativa). Em seguida redireciona para /login.
 */
export async function sair(): Promise<void> {
  await destruirSessao();
  redirect("/login"); // redirect lança NEXT_REDIRECT — fica fora de try/catch
}
