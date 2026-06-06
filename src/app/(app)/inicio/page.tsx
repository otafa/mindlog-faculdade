import type { Icon } from "@phosphor-icons/react";
import {
  ChartBar,
  Flame,
  PencilSimple,
  Quotes,
  Robot,
  Smiley,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { redirect } from "next/navigation";
import { obterDiasSeguidos } from "@/lib/insights";
import { lerSessao } from "@/lib/session";

// Frases acolhedoras, sem positividade tóxica (ver tom de comunicação no briefing).
const FRASES = [
  "Como você está hoje é válido, seja como for.",
  "Reservar um momento para si já é cuidado.",
  "Dias difíceis também fazem parte. Você não está sozinho.",
  "Pequenos passos contam.",
  "Respire. Você está aqui, e isso já basta por agora.",
  "Vá no seu ritmo — não há pressa.",
];

// Cards de ação rápida (slide 10): ícone em círculo + título + subtítulo.
// O check-in usa verde (como no deck); os demais, lavanda/roxo.
const CARDS: {
  href: string;
  titulo: string;
  subtitulo: string;
  Icone: Icon;
  circulo: string;
  icone: string;
}[] = [
  {
    href: "/checkin",
    titulo: "Fazer check-in",
    subtitulo: "30 segundos",
    Icone: Smiley,
    circulo: "bg-green-100 dark:bg-green-500/15",
    icone: "text-green-600 dark:text-green-400",
  },
  {
    href: "/diario",
    titulo: "Escrever no diário",
    subtitulo: "Reflexão livre",
    Icone: PencilSimple,
    circulo: "bg-lavanda",
    icone: "text-roxo",
  },
  {
    href: "/chat",
    titulo: "Falar com a IA",
    subtitulo: "24h, anônimo",
    Icone: Robot,
    circulo: "bg-lavanda",
    icone: "text-roxo",
  },
  {
    href: "/insights",
    titulo: "Ver meus insights",
    subtitulo: "Padrões do mês",
    Icone: ChartBar,
    circulo: "bg-lavanda",
    icone: "text-roxo",
  },
];

export default async function PaginaInicio() {
  // SEGURANÇA (ADR 0015): valida a sessão de verdade. O layout já redireciona quando null;
  // checamos aqui também por garantia e para obter o usuário (lerSessao é memoizado por
  // requisição, então não há consulta duplicada).
  const sessao = await lerSessao();
  if (!sessao) {
    redirect("/login");
  }

  // Streak em destaque: reaproveita a MESMA lógica dos insights (não recalcula).
  const diasSeguidos = await obterDiasSeguidos(sessao.usuario.id);

  // Rotaciona a frase a cada requisição usando o horário (a página é dinâmica, pois
  // depende da sessão). Evita Math.random() na renderização (regra de pureza do React).
  const frase = FRASES[new Date().getTime() % FRASES.length];

  return (
    <div className="flex flex-col gap-6">
      {/* Banner de boas-vindas (slide 10). */}
      <section className="rounded-2xl bg-roxo/15 p-6">
        <h2 className="text-lg font-semibold text-roxo">
          Que bom te ver de volta, {sessao.usuario.nome}.
        </h2>
        <p className="mt-1 text-sm text-roxo/80">
          Por onde você quer começar hoje?
        </p>
      </section>

      {/* Streak em destaque (reusa obterDiasSeguidos). 0 dias → convite acolhedor. */}
      <section className="rounded-2xl bg-linear-to-br from-roxo to-[#C026D3] p-5 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15">
            <Flame size={26} weight="fill" />
          </span>
          {diasSeguidos > 0 ? (
            <div>
              <p className="font-serif text-2xl font-semibold">
                {diasSeguidos} {diasSeguidos === 1 ? "dia" : "dias"} seguidos 🔥
              </p>
              <p className="text-sm text-white/85">
                Que cuidado bonito com você. Siga no seu ritmo.
              </p>
            </div>
          ) : (
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">Comece sua sequência hoje</p>
                <p className="text-sm text-white/85">
                  Um check-in rápido já é um primeiro passo.
                </p>
              </div>
              <Link
                href="/checkin"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-white px-5 font-medium text-roxo transition-colors hover:bg-white/90"
              >
                Fazer check-in
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Cards de ação rápida. */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map(({ href, titulo, subtitulo, Icone, circulo, icone }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center rounded-2xl bg-superficie p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span
              className={`mb-3 flex h-14 w-14 items-center justify-center rounded-full ${circulo}`}
            >
              <Icone size={28} weight="duotone" className={icone} />
            </span>
            <h3 className="font-medium">{titulo}</h3>
            <p className="mt-1 text-sm text-mutado">{subtitulo}</p>
          </Link>
        ))}
      </section>

      {/* Citação acolhedora (slide 10). */}
      <section className="flex items-start gap-3 rounded-2xl bg-superficie p-6 shadow-sm">
        <Quotes size={28} weight="fill" className="shrink-0 text-roxo/40" />
        <p className="font-serif text-suave italic">{frase}</p>
      </section>
    </div>
  );
}
