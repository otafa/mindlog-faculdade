import type { Icon } from "@phosphor-icons/react";
import {
  Barbell,
  Brain,
  CaretDown,
  ChartBar,
  ChartLineUp,
  Export,
  HeartHalf,
  Key,
  Lock,
  PencilSimple,
  Robot,
  ShieldCheck,
  Smiley,
  UserPlus,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FAQ } from "@/data/suporte";
import { lerSessao } from "@/lib/session";

// Funcionalidades do app, uma linha cada (tom do briefing). A IA aparece como
// apoio, nunca como terapeuta.
const FUNCIONALIDADES: { Icone: Icon; titulo: string; texto: string }[] = [
  {
    Icone: PencilSimple,
    titulo: "Diário",
    texto: "Escreva o que sente, com histórico para revisitar quando quiser.",
  },
  {
    Icone: Smiley,
    titulo: "Check-in de humor",
    texto: "Registre como você está em poucos segundos, todos os dias.",
  },
  {
    Icone: ChartBar,
    titulo: "Insights",
    texto: "Veja padrões do seu humor ao longo das semanas.",
  },
  {
    Icone: Robot,
    titulo: "IA como apoio",
    texto: "Ajuda a organizar pensamentos — não substitui um profissional.",
  },
  {
    Icone: UsersThree,
    titulo: "Comunidade",
    texto: "Um espaço para se sentir menos sozinho, no seu ritmo.",
  },
  {
    Icone: Barbell,
    titulo: "Exercícios",
    texto: "Práticas simples de respiração e relaxamento para o dia a dia.",
  },
];

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

// Passos do "como funciona": a jornada de uso, do cadastro aos padrões. Difere da
// seção de Funcionalidades (que lista os recursos) para não duplicar conteúdo.
const PASSOS: { Icone: Icon; titulo: string; texto: string }[] = [
  {
    Icone: UserPlus,
    titulo: "Cadastre-se",
    texto: "Crie sua conta gratuita em menos de um minuto.",
  },
  {
    Icone: Smiley,
    titulo: "Registre seu humor e escreva",
    texto:
      "Faça o check-in do dia e use o diário quando quiser colocar para fora.",
  },
  {
    Icone: ChartLineUp,
    titulo: "Veja seus padrões",
    texto: "Acompanhe sua evolução e perceba o que afeta o seu humor.",
  },
];

// Privacidade & segurança: afirmações honestas, alinhadas ao código e à docs/lgpd.md.
// NÃO prometer E2E ("ponta a ponta") — só temos criptografia em repouso no servidor.
const PRIVACIDADE: { Icone: Icon; titulo: string; texto: string }[] = [
  {
    Icone: ShieldCheck,
    titulo: "Criptografia dos seus registros",
    texto:
      "Humor, diário e conversas com a IA ficam guardados criptografados em repouso (AES-256-GCM).",
  },
  {
    Icone: Key,
    titulo: "Senha nunca em texto",
    texto:
      "Sua senha é guardada como hash com Argon2id — nem nós conseguimos lê-la.",
  },
  {
    Icone: Export,
    titulo: "Você no controle",
    texto:
      "Exporte todos os seus dados em um arquivo ou apague sua conta quando quiser (LGPD).",
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

      {/* Funcionalidades: grade de cards, um por recurso do app. */}
      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto w-full max-w-5xl">
          <h2 className="text-center font-serif text-2xl font-semibold text-zinc-900 sm:text-3xl">
            Tudo o que você precisa em um só lugar
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-zinc-600">
            Recursos simples para acompanhar como você está e cuidar de si.
          </p>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FUNCIONALIDADES.map(({ Icone, titulo, texto }) => (
              <li
                key={titulo}
                className="flex flex-col rounded-2xl bg-white p-5 shadow-sm"
              >
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-lavanda">
                  <Icone size={26} weight="duotone" className="text-roxo" />
                </span>
                <h3 className="font-medium">{titulo}</h3>
                <p className="mt-1 text-sm text-zinc-600">{texto}</p>
              </li>
            ))}
          </ul>
        </div>
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
                className="relative flex flex-col items-center rounded-2xl bg-white p-6 pt-8 text-center shadow-sm"
              >
                {/* Badge numerado: deixa a ordem da jornada explícita. */}
                <span className="absolute -top-4 flex h-8 w-8 items-center justify-center rounded-full bg-roxo font-serif text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-lavanda">
                  <Icone size={28} weight="duotone" className="text-roxo" />
                </span>
                <h3 className="font-medium">{titulo}</h3>
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

      {/* Privacidade & segurança: transmite confiança sem prometer E2E (ver lgpd.md). */}
      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto w-full max-w-5xl rounded-3xl bg-linear-to-br from-roxo to-[#C026D3] p-8 text-white sm:p-12">
          <h2 className="text-center font-serif text-2xl font-semibold sm:text-3xl">
            Seus dados são seus
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-white/85">
            Criptografia dos seus registros e controle total nas suas mãos — sem
            prometer mais do que entregamos.
          </p>

          <ul className="mt-8 grid gap-6 sm:grid-cols-3">
            {PRIVACIDADE.map(({ Icone, titulo, texto }) => (
              <li
                key={titulo}
                className="flex flex-col items-center text-center"
              >
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
                  <Icone size={26} weight="duotone" />
                </span>
                <h3 className="font-medium">{titulo}</h3>
                <p className="mt-1 text-sm text-white/85">{texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ: reaproveita o conteúdo da tela de Suporte (@/data/suporte). Acordeão
          nativo com <details> — sem JS de cliente nem biblioteca. */}
      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <h2 className="text-center font-serif text-2xl font-semibold text-zinc-900 sm:text-3xl">
            Perguntas frequentes
          </h2>

          <ul className="mt-8 flex flex-col gap-3">
            {FAQ.map((item) => (
              <li key={item.pergunta}>
                <details className="group rounded-2xl bg-white p-4 shadow-sm">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium text-zinc-800">
                    {item.pergunta}
                    <CaretDown
                      size={18}
                      className="shrink-0 text-roxo transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <p className="mt-2 font-serif text-sm text-zinc-600">
                    {item.resposta}
                  </p>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Rodapé completo: marca, navegação, apoio em crise (CVV) e crédito acadêmico. */}
      <footer className="border-t border-black/5 bg-white px-4 py-10 sm:px-6">
        <div className="mx-auto grid w-full max-w-5xl gap-8 sm:grid-cols-3">
          <div>
            <span className="flex items-center gap-2">
              <Brain size={26} weight="duotone" className="text-roxo" />
              <span className="font-serif text-lg font-semibold text-roxo">
                MindLog
              </span>
            </span>
            <p className="mt-2 max-w-xs text-sm text-zinc-600">
              Seu diário emocional: humor, escrita e um apoio para organizar os
              pensamentos.
            </p>
          </div>

          <nav aria-label="Acesso" className="flex flex-col gap-2 text-sm">
            <h2 className="font-medium text-zinc-800">Acesso</h2>
            <Link href="/login" className="text-zinc-600 hover:text-roxo">
              Entrar
            </Link>
            <Link href="/cadastro" className="text-zinc-600 hover:text-roxo">
              Criar conta gratuita
            </Link>
          </nav>

          <div className="text-sm">
            <h2 className="font-medium text-zinc-800">
              Precisa de apoio agora?
            </h2>
            <p className="mt-2 text-zinc-600">
              O CVV oferece apoio emocional gratuito e sigiloso, 24h.
            </p>
            <a
              href="tel:188"
              className="mt-1 inline-block font-semibold text-roxo hover:underline"
            >
              Ligar 188
            </a>
          </div>
        </div>

        <p className="mx-auto mt-8 w-full max-w-5xl border-t border-black/5 pt-6 text-sm text-zinc-500">
          Projeto acadêmico — UNIFRAN, disciplina de UX/UI. Sem fins comerciais.
        </p>
      </footer>
    </div>
  );
}
