import { Brain } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { redirect } from "next/navigation";
import { lerSessao } from "@/lib/session";

// Landing pública (ADR 0018): apresenta o MindLog a quem chega DESLOGADO. Conteúdo
// 100% estático — sem query de usuário, sem dado sensível. Quem já tem sessão VÁLIDA
// é mandado para o dashboard; a checagem usa lerSessao() (tranca real), não o cookie
// do porteiro.
export default async function PaginaLanding() {
  const sessao = await lerSessao();
  if (sessao) {
    redirect("/inicio");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-lavanda text-zinc-900">
      {/* Barra do topo: marca + atalho para quem já tem conta. */}
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <span className="flex items-center gap-2">
          <Brain size={28} weight="duotone" className="text-roxo" />
          <span className="font-serif text-lg font-semibold text-roxo">
            MindLog
          </span>
        </span>
        <Link
          href="/login"
          className="text-sm font-medium text-roxo hover:underline"
        >
          Entrar
        </Link>
      </header>

      {/* Hero: centralizado, ocupa o resto da altura da viewport. */}
      <main className="flex flex-1 items-center px-4 py-12 sm:px-6">
        <section className="mx-auto w-full max-w-2xl text-center">
          <h1 className="font-serif text-4xl leading-tight font-semibold text-zinc-900 sm:text-5xl">
            Cuide da sua mente, um dia de cada vez.
          </h1>

          <p className="mt-4 text-lg text-zinc-600 sm:text-xl">
            Um diário emocional para acompanhar seu humor, escrever o que sente e
            organizar seus pensamentos — no seu ritmo.
          </p>

          <p className="mx-auto mt-4 max-w-xl text-zinc-600">
            O MindLog reúne três coisas simples em um só lugar: um check-in
            rápido de como você está, um diário pessoal com histórico e uma IA
            que serve de apoio para colocar as ideias em ordem. Sem cobranças,
            sem julgamentos.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/cadastro"
              className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-roxo px-6 font-medium text-white transition-colors hover:bg-roxo/90 sm:w-auto"
            >
              Comece grátis
            </Link>
            <Link
              href="#como-funciona"
              className="flex min-h-[48px] w-full items-center justify-center rounded-xl border border-roxo/30 bg-white px-6 font-medium text-roxo transition-colors hover:bg-roxo/5 sm:w-auto"
            >
              Como funciona
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
