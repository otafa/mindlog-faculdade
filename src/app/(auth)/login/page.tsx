"use client";

import Link from "next/link";
import { useActionState } from "react";
import { entrar, type EstadoLogin } from "./actions";

const ESTADO_INICIAL: EstadoLogin = {};

export default function PaginaLogin() {
  const [estado, acao, pendente] = useActionState(entrar, ESTADO_INICIAL);

  return (
    <main style={{ maxWidth: 420, margin: "0 auto", padding: 24 }}>
      <h1>Entrar</h1>
      <p>Acesse seu diário emocional no MindLog.</p>

      <form action={acao} noValidate>
        <label>
          E-mail
          <input
            name="email"
            type="email"
            required
            defaultValue={estado.valores?.email}
            autoComplete="email"
          />
        </label>

        <label>
          Senha
          <input
            name="senha"
            type="password"
            required
            autoComplete="current-password"
          />
        </label>

        {/* erro genérico de credencial (não diferencia e-mail de senha) */}
        {estado.erro && <p role="alert">{estado.erro}</p>}

        <button
          type="submit"
          disabled={pendente}
          style={{ width: "100%", minHeight: 44 }}
        >
          {pendente ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p>
        Não tem conta? <Link href="/cadastro">Criar conta</Link>
      </p>
    </main>
  );
}
