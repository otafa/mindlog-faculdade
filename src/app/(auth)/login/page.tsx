"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { entrar, type EstadoLogin } from "./actions";

const ESTADO_INICIAL: EstadoLogin = {};

const INPUT =
  "w-full rounded-lg border border-black/10 bg-lavanda/50 px-4 py-2.5 text-sm focus:border-roxo focus:outline-none";

export default function PaginaLogin() {
  const [estado, acao, pendente] = useActionState(entrar, ESTADO_INICIAL);

  const citacao = (
    <div className="mt-2 w-full rounded-xl border-l-4 border-rose-300 bg-white/10 p-4 text-left">
      <p className="font-serif text-sm italic">
        &ldquo;Cuidar da mente é o ato mais corajoso que existe.&rdquo;
      </p>
      <p className="mt-2 text-xs text-white/70">— Dr. Mind</p>
    </div>
  );

  return (
    <AuthShell
      tagline="Bem-vindo de volta! Continue sua jornada."
      painelExtra={citacao}
    >
      <h1 className="text-xl font-semibold">Entrar na sua conta</h1>

      <form action={acao} noValidate className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={estado.valores?.email}
            autoComplete="email"
            placeholder="voce@email.com"
            className={INPUT}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="senha" className="text-sm font-medium">
            Senha
          </label>
          <input
            id="senha"
            name="senha"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className={INPUT}
          />
        </div>

        {/* erro genérico de credencial (não diferencia e-mail de senha) */}
        {estado.erro && (
          <p role="alert" className="text-sm text-red-600">
            {estado.erro}
          </p>
        )}

        <button
          type="submit"
          disabled={pendente}
          className="min-h-[44px] w-full rounded-xl bg-roxo px-5 font-medium text-white transition-colors hover:bg-roxo/90 disabled:opacity-50"
        >
          {pendente ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-zinc-500">
        Não tem conta?{" "}
        <Link href="/cadastro" className="text-roxo underline">
          Cadastre-se grátis
        </Link>
      </p>
    </AuthShell>
  );
}
