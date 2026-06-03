import Link from "next/link";
import { redirect } from "next/navigation";
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

// Cards de ação rápida. Algumas rotas ainda não existem (chegam ao longo da Fase 3).
const CARDS = [
  {
    href: "/checkin",
    titulo: "Check-in",
    descricao: "Como você está se sentindo agora?",
  },
  { href: "/diario", titulo: "Diário", descricao: "Escreva sobre o seu dia." },
  {
    href: "/chat",
    titulo: "Conversar com a IA",
    descricao: "Um espaço para desabafar.",
  },
  {
    href: "/insights",
    titulo: "Insights",
    descricao: "Veja seus padrões ao longo do tempo.",
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

  const agora = new Date();
  // Rotaciona a frase a cada requisição usando o horário (a página é dinâmica, pois
  // depende da sessão). Evita Math.random() na renderização (regra de pureza do React).
  const frase = FRASES[agora.getTime() % FRASES.length];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      {/* A saudação e a data ficam na barra de conteúdo do layout (sem o bug do
          text-transform: capitalize). Aqui fica só a frase acolhedora. */}
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="font-serif text-zinc-700">{frase}</p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-2xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <h2 className="font-medium text-roxo">{card.titulo}</h2>
            <p className="mt-1 text-sm text-zinc-600">{card.descricao}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
