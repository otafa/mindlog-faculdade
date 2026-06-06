"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { cadastrar, type EstadoCadastro } from "./actions";

const ESTADO_INICIAL: EstadoCadastro = {};

const INPUT =
  "w-full rounded-lg border border-borda bg-lavanda/50 px-4 py-2.5 text-sm focus:border-roxo focus:outline-none";
const ERRO = "text-sm text-red-600";

const RECURSOS = [
  "Diário emocional",
  "Psicóloga IA 24h",
  "Insights de humor",
  "Comunidade segura",
];

export default function PaginaCadastro() {
  const [estado, acao, pendente] = useActionState(cadastrar, ESTADO_INICIAL);

  // Validação no cliente apenas para UX — o servidor é a autoridade.
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const senhasDiferem = confirmacao.length > 0 && senha !== confirmacao;

  const recursos = (
    <ul className="mt-2 flex w-full flex-col gap-2 text-left text-sm">
      {RECURSOS.map((r) => (
        <li key={r} className="rounded-lg bg-white/10 px-3 py-2">
          {r}
        </li>
      ))}
    </ul>
  );

  return (
    <AuthShell
      tagline="Sua jornada de bem-estar começa agora!"
      painelExtra={recursos}
    >
      <h1 className="text-xl font-semibold">Criar conta gratuita</h1>
      <p className="mt-1 text-sm text-mutado">Preencha os dados abaixo.</p>

      <form action={acao} noValidate className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="nome" className="text-sm font-medium">
            Nome completo
          </label>
          <input
            id="nome"
            name="nome"
            type="text"
            required
            defaultValue={estado.valores?.nome}
            autoComplete="name"
            placeholder="Digite seu nome"
            className={INPUT}
          />
          {estado.erros?.nome && (
            <span className={ERRO}>{estado.erros.nome}</span>
          )}
        </div>

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
          {estado.erros?.email && (
            <span className={ERRO}>{estado.erros.email}</span>
          )}
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
            minLength={8}
            maxLength={128}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="new-password"
            placeholder="••••••••"
            className={INPUT}
          />
          {estado.erros?.senha && (
            <span className={ERRO}>{estado.erros.senha}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="confirmacaoSenha" className="text-sm font-medium">
            Confirmar senha
          </label>
          <input
            id="confirmacaoSenha"
            name="confirmacaoSenha"
            type="password"
            required
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            autoComplete="new-password"
            placeholder="••••••••"
            className={INPUT}
          />
          {/* feedback de UX no cliente */}
          {senhasDiferem && (
            <span className={ERRO}>As senhas não coincidem.</span>
          )}
          {estado.erros?.confirmacaoSenha && (
            <span className={ERRO}>{estado.erros.confirmacaoSenha}</span>
          )}
        </div>

        <label className="flex items-start gap-2 text-sm text-suave">
          <input name="termos" type="checkbox" required className="mt-0.5" />
          <span>
            {/* TODO: apontar para a política de privacidade real quando existir */}
            Li e aceito a{" "}
            <a href="#" className="text-roxo underline">
              política de privacidade
            </a>
            .
          </span>
        </label>
        {estado.erros?.termos && (
          <span className={ERRO}>{estado.erros.termos}</span>
        )}

        <button
          type="submit"
          disabled={pendente}
          className="min-h-[44px] w-full rounded-xl bg-roxo px-5 font-medium text-white transition-colors hover:bg-roxo/90 disabled:opacity-50"
        >
          {pendente ? "Criando..." : "Criar minha conta"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-mutado">
        Já tem conta?{" "}
        <Link href="/login" className="text-roxo underline">
          Fazer login
        </Link>
      </p>
    </AuthShell>
  );
}
