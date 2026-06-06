import type { Icon } from "@phosphor-icons/react";
import {
  Brain,
  HeartHalf,
  Lock,
  PencilSimple,
  Robot,
  Smiley,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { redirect } from "next/navigation";
import { lerSessao } from "@/lib/session";

// Faixa de destaques: tom honesto, sem prometer "empatia"/"escuta" terapêutica
// (ver briefing). A IA aparece como apoio, não como terapeuta.
const DESTAQUES: { Icone: Icon; titulo: string; texto: string }[] = [
  {
    Icone: HeartHalf,
    titulo: "100% gratuito para começar",
    texto: "Crie sua conta e use as funções principais sem pagar nada.",
  },
  {
    Icone: Lock,
    titulo: "Privado — seus dados são seus",
    texto:
      "Diário e humor ficam protegidos; você pode exportar ou apagar tudo.",
  },
  {
    Icone: Robot,
    titulo: "IA como apoio",
    texto:
      "Uma ajuda para organizar pensamentos — não substitui um profissional.",
  },
];

// Passos do "como funciona": as três funções centrais do app (ver briefing).
const PASSOS: { Icone: Icon; titulo: string; texto: string }[] = [
  {
    Icone: Smiley,
    titulo: "Faça o check-in",
    texto:
      "Em poucos segundos, registre como você está. Com o tempo, surgem padrões.",
  },
  {
    Icone: PencilSimple,
    titulo: "Escreva no diário",
    texto:
      "Um espaço livre para desabafar e olhar para trás quando quiser, com histórico.",
  },
  {
    Icone: Robot,
    titulo: "Converse com a IA",
    texto:
      "Um apoio para colocar os pensamentos em ordem, disponível quando precisar.",
  },
];

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
            Um diário emocional para acompanhar seu humor, escrever o que sente
            e organizar seus pensamentos — no seu ritmo.
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

      {/* Faixa de destaques: gradiente roxo→magenta, mantendo a identidade da marca. */}
      <section className="bg-linear-to-br from-roxo to-[#C026D3] px-4 py-12 text-white sm:px-6">
        <ul className="mx-auto grid w-full max-w-5xl gap-6 sm:grid-cols-3">
          {DESTAQUES.map(({ Icone, titulo, texto }) => (
            <li key={titulo} className="flex flex-col items-center text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
                <Icone size={26} weight="duotone" />
              </span>
              <h2 className="font-medium">{titulo}</h2>
              <p className="mt-1 text-sm text-white/85">{texto}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Como funciona: alvo da âncora do botão do hero. */}
      <section id="como-funciona" className="px-4 py-14 sm:px-6">
        <div className="mx-auto w-full max-w-5xl">
          <h2 className="text-center font-serif text-2xl font-semibold text-zinc-900 sm:text-3xl">
            Como funciona
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-zinc-600">
            Três passos simples, no seu tempo.
          </p>

          <ol className="mt-8 grid gap-6 sm:grid-cols-3">
            {PASSOS.map(({ Icone, titulo, texto }, i) => (
              <li
                key={titulo}
                className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-sm"
              >
                <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-lavanda">
                  <Icone size={28} weight="duotone" className="text-roxo" />
                </span>
                <h3 className="font-medium">
                  {i + 1}. {titulo}
                </h3>
                <p className="mt-1 text-sm text-zinc-600">{texto}</p>
              </li>
            ))}
          </ol>

          {/* Honestidade sobre os limites da IA (briefing: tom honesto + CVV acessível). */}
          <p className="mx-auto mt-8 max-w-2xl rounded-xl bg-roxo/5 px-5 py-4 text-center text-sm text-zinc-600">
            O MindLog é um espaço de autoconhecimento e{" "}
            <strong className="font-medium text-zinc-800">
              não substitui acompanhamento profissional
            </strong>
            . Se você estiver passando por um momento difícil, ligue para o CVV:{" "}
            <strong className="font-medium text-zinc-800">188</strong> (24h,
            gratuito).
          </p>

          <div className="mt-8 text-center">
            <Link
              href="/cadastro"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-roxo px-6 font-medium text-white transition-colors hover:bg-roxo/90"
            >
              Comece grátis
            </Link>
          </div>
        </div>
      </section>

      <footer className="px-4 py-8 text-center text-sm text-zinc-500 sm:px-6">
        MindLog — projeto acadêmico (UNIFRAN).
      </footer>
    </div>
  );
}
